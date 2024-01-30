import { ConfigModule } from '@medusajs/medusa';
import { IEventBusService } from '@medusajs/types';

import OtpService from '../services/otp';
import SmsService from '../services/sms';

type InjectedDependencies = {
  eventBusService: IEventBusService;
  smsService: SmsService;
};

class OtpSubscriber {
  private readonly eventBusService_: IEventBusService;
  private readonly smsService_: SmsService;
  private readonly configModule_: ConfigModule;

  constructor(container: InjectedDependencies, configModule: ConfigModule) {
    this.eventBusService_ = container.eventBusService;
    this.smsService_ = container.smsService;
    this.configModule_ = configModule;

    this.eventBusService_.subscribe(
      OtpService.Events.SMS_CREATED,
      this.handleSendBySMS,
    );

    this.eventBusService_.subscribe(
      OtpService.Events.EMAIL_CREATED,
      this.handleSendByEmail,
    );

    this.eventBusService_.subscribe(
      SmsService.Events.success,
      this.handleSendSuccess,
    );
  }

  getConfigurations() {
    return this.configModule_;
  }

  handleSendBySMS = async (data) => {
    await this.smsService_.send(data.id, {
      destination: data.send_to,
      otp: data.otp_code,
      ref: data.ref_code,
    });
  };

  handleSendByEmail = async (data) => {};

  handleSendSuccess = async (data) => {
    await this.smsService_.retrieve(data.id, data.request_id);
  };
}

export default OtpSubscriber;
