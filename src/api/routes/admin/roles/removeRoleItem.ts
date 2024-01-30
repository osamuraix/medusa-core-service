import { MedusaRequest, MedusaResponse, validator } from '@medusajs/medusa';
import { IsNotEmpty, IsString } from 'class-validator';

import RoleService from '../../../../services/role';

export class AdminRemoveUserRoleRequest {
  @IsNotEmpty()
  @IsString()
  item_id: string;
}

export default async (req: MedusaRequest, res: MedusaResponse) => {
  const { role_id } = req.params;

  const { item_id } = await validator(AdminRemoveUserRoleRequest, req.body);
  const roleService = req.scope.resolve('roleService') as RoleService;

  await roleService.removeRoleItem(role_id, item_id);

  res.status(200).send({
    id: role_id,
    object: 'role',
    deleted: true,
  });
};
