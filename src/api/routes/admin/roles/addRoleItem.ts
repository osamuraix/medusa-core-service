import { MedusaRequest, MedusaResponse, validator } from '@medusajs/medusa';
import { IsNotEmpty, IsString } from 'class-validator';

import RoleService from '../../../../services/role';

export class AdminAddUserRoleRequest {
  @IsNotEmpty()
  @IsString()
  item_id: string;

  @IsNotEmpty()
  @IsString()
  permission_id: string;
}

export default async (req: MedusaRequest, res: MedusaResponse) => {
  const { role_id } = req.params;

  const validate = await validator(AdminAddUserRoleRequest, req.body);
  const roleService = req.scope.resolve('roleService') as RoleService;

  const role = await roleService.addRoleItem(role_id, validate);
  res.json(role);
};
