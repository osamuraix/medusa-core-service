import { MedusaRequest, MedusaResponse, validator } from '@medusajs/medusa';
import { MedusaError } from '@medusajs/utils';
import { IsEmail, IsOptional, IsPhoneNumber } from 'class-validator';

import OtpService from '../../../../services/otp';

export class AuthPostOtpReq {
  @IsOptional()
  @IsPhoneNumber('TH', {
    message: 'Invalid phone number. Valid phone number sample +66123456789',
  })
  phone?: string;

  @IsOptional()
  @IsEmail()
  email?: string;
}

export default async (req: MedusaRequest, res: MedusaResponse) => {
  if (!req.body) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      `Invite phone number or email.`,
    );
  }

  const validated = await validator(AuthPostOtpReq, req.body);

  const otpService: OtpService = req.scope.resolve('otpService');
  const response = await otpService.create(validated);

  res.json(response);
};
