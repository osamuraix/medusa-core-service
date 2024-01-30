import {
  ConfigModule,
  Customer,
  EventBusService,
  FindConfig,
  Selector,
  TransactionBaseService,
  buildQuery,
} from '@medusajs/medusa';
import { MedusaError } from '@medusajs/utils';
import jwt from 'jsonwebtoken';
import moment from 'moment';

import { EntityManager } from 'typeorm';

import config from '../config';
import { OtpRequests, OtpSendVia } from '../models/otp-requests';
import OtpRequestsRepository from '../repositories/otp-requests';
import { generateOtp, phoneWithoutRegion } from '../utils/otp';
import CustomerService, { CreateCustomerInput } from './customer';

type InjectedDependencies = {
  configModule: ConfigModule;
  otpRequestsRepository: typeof OtpRequestsRepository;
  eventBusService: EventBusService;
  customerService: CustomerService;
};

export type CreateOtpInput = {
  phone?: string;
  email?: string;
  otp_code?: string;
  ref_code?: string;
};

export type CreateOtpRequests = Pick<
  OtpRequests,
  'send_via' | 'send_to' | 'ref_code' | 'session_id' | 'expires_at'
>;

class OtpService extends TransactionBaseService {
  static Events = {
    SMS_CREATED: 'sms.created',
    EMAIL_CREATED: 'email.created',
  };

  protected readonly configModule_: ConfigModule;
  protected readonly otpRequestsRepository_: typeof OtpRequestsRepository;
  protected readonly eventBusService_: EventBusService;
  protected readonly customerService_: CustomerService;
  protected readonly expireMinute: number;

  constructor(container: InjectedDependencies) {
    super(container);
    this.configModule_ = container.configModule;
    this.otpRequestsRepository_ = container.otpRequestsRepository;
    this.eventBusService_ = container.eventBusService;
    this.customerService_ = container.customerService;
    this.expireMinute = config.sms.expireMinute;
  }

  getConfigurations() {
    return this.configModule_;
  }

  async retrieve(
    selector: Selector<OtpRequests>,
    config: FindConfig<OtpRequests> = {},
  ): Promise<OtpRequests | never> {
    const customerRepo = this.activeManager_.withRepository(
      this.otpRequestsRepository_,
    );

    const query = buildQuery(selector, config);
    const customer = await customerRepo.findOne(query);

    return customer;
  }

  async searchQuery(data: CreateOtpInput) {
    const { phone, email, otp_code, ref_code } = data;

    let selector: Selector<OtpRequests> = {
      send_via: OtpSendVia.SMS,
      send_to: phoneWithoutRegion(phone),
      expires_at: {
        gte: moment().toDate(),
      },
      verified_at: null,
    };
    let config: FindConfig<OtpRequests> = {
      order: {
        requested_at: 'DESC',
      },
    };

    if (email) {
      selector = {
        ...selector,
        send_via: OtpSendVia.EMAIL,
        send_to: email,
      };
    }

    if (otp_code && ref_code) {
      delete selector.expires_at;

      selector = { ...selector, ref_code };
    }

    const otp = await this.retrieve(selector, config);

    if (otp) {
      if (otp_code && ref_code) {
        let decode;

        try {
          decode = jwt.verify(
            otp.session_id,
            this.getConfigurations().projectConfig.jwt_secret,
          );
        } catch (err) {
          throw new MedusaError(
            MedusaError.Types.INVALID_DATA,
            `Otp was expired.`,
          );
        }

        const { send_to, otp_code, ref_code } = decode;

        const isSendToMatch = selector.send_to === send_to;
        const isOtpMatch = data.otp_code === otp_code;
        const isRefMatch = data.ref_code === ref_code;

        if (!isSendToMatch || !isOtpMatch || !isRefMatch) {
          throw new MedusaError(
            MedusaError.Types.INVALID_DATA,
            `Otp not match.`,
          );
        }
      } else {
        const expire = moment(otp.expires_at);
        const now = moment();

        if (expire >= now) {
          throw new MedusaError(
            MedusaError.Types.INVALID_DATA,
            `Waiting for otp expired.`,
          );
        }
      }
    }

    return otp;
  }

  async create(data: CreateOtpInput) {
    return await this.atomicPhase_(async (manager: EntityManager) => {
      await this.searchQuery(data);

      const { phone, email } = data;
      let eventEmit = OtpService.Events.SMS_CREATED;
      let send_via = OtpSendVia.SMS;
      let send_to = phoneWithoutRegion(phone);

      if (email) {
        eventEmit = OtpService.Events.EMAIL_CREATED;
        send_via = OtpSendVia.EMAIL;
        send_to = email;
      }

      const { otp_code, ref_code } = generateOtp();

      const session_id = jwt.sign(
        { send_to, otp_code, ref_code },
        this.getConfigurations().projectConfig.jwt_secret,
        { expiresIn: `${this.expireMinute}m` },
      );

      const expires_at = moment().add(this.expireMinute, 'm').toDate();

      const payload: CreateOtpRequests = {
        send_via,
        send_to,
        ref_code,
        session_id,
        expires_at,
      };

      const otpRequestsRepository = manager.withRepository(
        this.otpRequestsRepository_,
      );

      const created = otpRequestsRepository.create(payload);
      const result = await otpRequestsRepository.save(created);

      await this.eventBusService_.withTransaction(manager).emit(eventEmit, {
        id: result.id,
        send_to,
        otp_code,
        ref_code,
      });
    });
  }

  async verify(data: CreateOtpInput) {
    return await this.atomicPhase_(async (manager: EntityManager) => {
      const otp = await this.searchQuery(data);

      if (!otp) {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          `Otp or Ref not found.`,
        );
      }

      let customer: Customer;
      let payload: CreateCustomerInput;

      try {
        if (otp.send_via === OtpSendVia.SMS) {
          payload = { phone: otp.send_to, ...payload };
          customer = await this.customerService_.retrieveByPhone(otp.send_to);
        }

        if (otp.send_via === OtpSendVia.EMAIL) {
          payload = { email: otp.send_to, ...payload };
          customer = await this.customerService_.retrieveRegisteredByEmail(
            otp.send_to,
          );
        }
      } catch (err) {
        customer = await this.customerService_.create(payload);
      }

      const otpRequestsRepository = manager.withRepository(
        this.otpRequestsRepository_,
      );

      otp.verified_at = moment().toDate();
      await otpRequestsRepository.save(otp);

      const token = jwt.sign(
        { customer_id: customer.id, domain: 'store' },
        this.getConfigurations().projectConfig.jwt_secret,
        {
          expiresIn: '30d',
        },
      );

      return {
        access_token: token,
      };
    });
  }
}

export default OtpService;
