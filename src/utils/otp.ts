import { parse } from 'libphonenumber-js';
import speakeasy from 'speakeasy';

interface IGenerateOtp {
  otp_code: string;
  ref_code: string;
}

export const generateOtp = (length: number = 4): IGenerateOtp => {
  const secret = speakeasy.generateSecret({ length });

  const ref_code = secret.base32;
  const otp_code = speakeasy.totp({
    encoding: 'base32',
    secret: secret.base32,
  });

  return {
    otp_code,
    ref_code,
  };
};

export const verifyOtp = ({ otp_code, ref_code }: IGenerateOtp): boolean => {
  return speakeasy.totp.verify({
    encoding: 'base32',
    token: otp_code,
    secret: ref_code,
  });
};

export const phoneWithoutRegion = (phone: string): string => {
  const parsedNumber = parse(phone, { extended: true });

  if (!parsedNumber.phone) {
    return phone;
  }

  return `0${parsedNumber.phone}`;
};
