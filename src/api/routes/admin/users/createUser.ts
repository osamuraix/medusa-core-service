import {
  AdminCreateUserRequest as MedusaAdminCreateUserRequest,
  MedusaRequest,
  MedusaResponse,
  registerOverriddenValidators,
} from '@medusajs/medusa';

import createUser from '@medusajs/medusa/dist/api/routes/admin/users/create-user';

export class AdminCreateUserRequest extends MedusaAdminCreateUserRequest {
  // @IsString()
  // custom_field: string
}

registerOverriddenValidators(AdminCreateUserRequest);

export default async (req: MedusaRequest, res: MedusaResponse) => {
  await createUser(req, res);
};
