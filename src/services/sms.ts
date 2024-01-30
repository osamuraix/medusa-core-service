import {
  ConfigModule,
  EventBusService,
  TransactionBaseService,
} from '@medusajs/medusa';
import { MedusaError } from '@medusajs/utils';
import axios, { AxiosInstance } from 'axios';
import moment from 'moment';
import path from 'path';
import { EntityManager } from 'typeorm';

import config from '../config';
import { Translator } from '../libraries/i18n/translator';
import OtpRequestsRepository from '../repositories/otp-requests';

type InjectedDependencies = {
  configModule: ConfigModule;
  eventBusService: EventBusService;
  otpRequestsRepository: typeof OtpRequestsRepository;
};

export type SmsPayload = {
  destination: string;
  otp: string;
  ref?: string;
};

class SmsService extends TransactionBaseService {
  static Events = {
    success: 'success',
  };

  protected readonly configModule_: ConfigModule;
  protected readonly eventBus_: EventBusService;
  protected readonly otpRequestsRepository_: typeof OtpRequestsRepository;
  protected readonly translator_: Translator;

  constructor(container: InjectedDependencies) {
    super(container);

    this.configModule_ = container.configModule;
    this.eventBus_ = container.eventBusService;
    this.otpRequestsRepository_ = container.otpRequestsRepository;
    this.translator_ = new Translator({
      fallbackLanguage: 'th',
      baseDir: path.join(__dirname, '../i18n'),
    });

    this.translator_.load();
  }

  getConfigurations() {
    return this.configModule_;
  }

  private buildPayload(data: SmsPayload) {
    const { destination, otp, ref } = data;
    let payload = {};

    const text = this.translator_.translate(
      config.sms.body.region.toLocaleLowerCase(),
      'sms.otp.signIn.text',
      {
        OTP: otp,
        REF: ref,
      },
    );

    switch (config.sms.vender) {
      case '8x8':
        payload = {
          source: config.sms.body.source,
          destination,
          text,
          encoding: 'AUTO',
          country: config.sms.body.region,
        };
        break;
    }

    return payload;
  }

  private buildPath(method: string, request_id?: string): string {
    let pathUrl = '';

    if (method === 'GET') {
      switch (config.sms.vender) {
        case '8x8':
          pathUrl = `/v1/subaccounts/${config.sms.header.subAccountId}/messages/${request_id}`;
          break;
      }
    }

    if (method === 'POST') {
      switch (config.sms.vender) {
        case '8x8':
          pathUrl = `/v1/subaccounts/${config.sms.header.subAccountId}/messages`;
          break;
      }
    }

    return pathUrl;
  }

  async send(otp_id: string, data: SmsPayload) {
    try {
      const axiosInstance: AxiosInstance = axios.create({
        baseURL: config.sms.api,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${config.sms.header.authToken}`,
        },
      });

      const response = await axiosInstance.post(
        this.buildPath('POST'),
        this.buildPayload(data),
      );

      return await this.atomicPhase_(async (manager: EntityManager) => {
        const otpRequestsRepository = manager.withRepository(
          this.otpRequestsRepository_,
        );

        const otp = await otpRequestsRepository.findOneBy({ id: otp_id });
        otp.request_id = response.data.umid;
        otp.requested_at = moment().toDate();

        await Promise.all([
          otpRequestsRepository.save(otp),
          this.eventBus_
            .withTransaction(manager)
            .emit(SmsService.Events.success, {
              id: otp.id,
              request_id: otp.request_id,
            }),
        ]);
      });
    } catch (err) {
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        `Otp was expired.`,
      );
    }
  }

  async retrieve(otp_id: string, request_id: string) {
    try {
      const axiosInstance: AxiosInstance = axios.create({
        baseURL: config.sms.api,
        headers: {
          Authorization: `Bearer ${config.sms.header.authToken}`,
        },
      });

      const response = await axiosInstance.get(
        this.buildPath('GET', request_id),
      );

      return await this.atomicPhase_(async (manager: EntityManager) => {
        const otpRequestsRepository = manager.withRepository(
          this.otpRequestsRepository_,
        );

        const otp = await otpRequestsRepository.findOneBy({ id: otp_id });
        otp.sent_at = moment(response.data.status.timestamp).toDate();

        await otpRequestsRepository.save(otp);
      });
    } catch (err) {
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        `Otp was expired.`,
      );
    }
  }
}

export default SmsService;
