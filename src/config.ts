import dotenv from 'dotenv';

dotenv.config();

interface IStoreConfig {
  customer: {
    domainEmail?: string;
  };
}

interface ISmsHeader {
  authToken?: string;
  subAccountId?: string;
}

interface ISmsBody {
  source?: string;
  region?: string;
}

interface ISms {
  vender: string;
  api: string;
  header: ISmsHeader;
  body: ISmsBody;
  expireMinute: number;
}

interface Config {
  store: IStoreConfig;
  sms: ISms;
}

const config: Config = {
  store: {
    customer: {
      domainEmail:
        process.env.STORE_CUSTOMER_EMAIL_DOMAIN || 'talaadthaionline.com',
    },
  },
  sms: {
    vender: process.env.SMS_VENDER || '8x8',
    api: process.env.SMS_API_BASE_RL || 'https://sms.8x8.com',
    header: {
      authToken: process.env.SMS_HEADER_AUTH_TOKEN,
      subAccountId: process.env.SMS_HEADER_SUB_ACCOUNT_ID,
    },
    body: {
      source: process.env.SMS_BODY_SOURCE,
      region: process.env.SMS_BODY_REGION || 'TH',
    },
    expireMinute: parseInt(process.env.SMS_EXPIRE_MINUTE) || 1,
  },
};

export default config;
