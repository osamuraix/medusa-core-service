import { MedusaRequest, MedusaResponse, validator } from '@medusajs/medusa';
import { IsNotEmpty, IsString } from 'class-validator';

import RoleService from '../../../../services/role';

export class AdminAddUserRoleRequest {
  @IsNotEmpty()
  @IsString()
  user_id: string;
}

export default async (req: MedusaRequest, res: MedusaResponse) => {
  const { role_id } = req.params;

  const { user_id } = await validator(AdminAddUserRoleRequest, req.body);
  const roleService = req.scope.resolve('roleService') as RoleService;

  const role = await roleService.addUser(role_id, user_id);
  res.json(role);
};
