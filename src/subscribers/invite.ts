import { ConfigModule } from '@medusajs/medusa';
import { IEventBusService } from '@medusajs/types';
import nodemailer from 'nodemailer';
import url from 'url';

import InviteService from '../services/invite';

type InjectedDependencies = {
  eventBusService: IEventBusService;
};

class InviteSubscriber {
  private readonly eventBusService_: IEventBusService;
  private readonly configModule_: ConfigModule;

  constructor(container: InjectedDependencies, configModule: ConfigModule) {
    this.eventBusService_ = container.eventBusService;
    this.configModule_ = configModule;

    this.eventBusService_.subscribe(
      InviteService.Events.CREATED,
      this.handleSendByEmail,
    );
  }

  handleSendByEmail = async (data) => {
    const { admin_cors } = this.configModule_.projectConfig;

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const recipientEmail = data.user_email;
    const invitationToken = data.token;

    const invitationUrl = url.format({
      host: admin_cors,
      pathname: '/invite',
      query: {
        token: invitationToken,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: recipientEmail,
      subject: 'Invitation to the TTO Store',
      html: `<p>Hello,</p><p>Click on the following link to Sign up:</p><p><a href="${invitationUrl}">${invitationUrl}</a></p>`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });
  };
}

export default InviteSubscriber;
