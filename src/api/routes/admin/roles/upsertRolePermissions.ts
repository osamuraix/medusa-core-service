import { MedusaRequest, MedusaResponse, validator } from '@medusajs/medusa';
import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

import RoleService from '../../../../services/role';

export class AdminUpsertRolePermissionRequest {
  @IsOptional()
  @IsString()
  store_id?: string;

  @IsNotEmpty()
  @IsArray()
  permissions: string[];
}

export default async (req: MedusaRequest, res: MedusaResponse) => {
  const { role_id } = req.params;
  const validated = await validator(AdminUpsertRolePermissionRequest, req.body);

  const roleService = req.scope.resolve('roleService') as RoleService;
  const role = await roleService.updateRolePermissions(role_id, validated);

  res.json(role);
};
