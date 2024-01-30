import {
  MedusaRequest,
  MedusaResponse,
  registerOverriddenValidators,
  AdminUpdateUserRequest as MedusaAdminUpdateUserRequest,
} from '@medusajs/medusa';
import { IsString } from 'class-validator';

import updateUser from '@medusajs/medusa/dist/api/routes/admin/users/update-user';

export class AdminUpdateUserRequest extends MedusaAdminUpdateUserRequest {
  // @IsString()
  // custom_field: string
}

registerOverriddenValidators(AdminUpdateUserRequest);

export default async (req: MedusaRequest, res: MedusaResponse) => {
  await updateUser(req, res);
};
