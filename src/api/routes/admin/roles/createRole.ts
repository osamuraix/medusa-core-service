import { MedusaRequest, MedusaResponse, validator } from '@medusajs/medusa';
import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

import { CreatePermissionInput } from '../../../../services/permission';
import RoleService from '../../../../services/role';

export class AdminCreateRoleRequest {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  store_id?: string;

  @IsOptional()
  @IsArray()
  permissions?: CreatePermissionInput[];
}

export default async (req: MedusaRequest, res: MedusaResponse) => {
  const validated = await validator(AdminCreateRoleRequest, req.body);

  const roleService = req.scope.resolve('roleService') as RoleService;
  const role = await roleService.create(validated);

  res.json(role);
};
