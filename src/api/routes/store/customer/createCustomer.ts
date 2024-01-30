import {
  MedusaRequest,
  MedusaResponse,
  StorePostCustomersReq as MedusaStorePostCustomersRequest,
  registerOverriddenValidators,
} from '@medusajs/medusa';
import {
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
} from 'class-validator';

import createCustomer from '@medusajs/medusa/dist/api/routes/store/customers/create-customer';

export class StorePostCustomersReq extends MedusaStorePostCustomersRequest {
  @IsNotEmpty()
  @IsPhoneNumber('TH', {
    message: 'Invalid phone number. Valid phone number sample +66123456789',
  })
  phone: string;

  @IsOptional()
  @IsString()
  email: string;

  @IsOptional()
  @IsString()
  first_name: string;

  @IsOptional()
  @IsString()
  last_name: string;

  @IsOptional()
  @IsString()
  password: string;
}

registerOverriddenValidators(StorePostCustomersReq);

export default async (req: MedusaRequest, res: MedusaResponse) => {
  await createCustomer(req, res);
};
