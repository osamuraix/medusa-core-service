import { MedusaRequest, MedusaResponse, validator } from '@medusajs/medusa';
import { IsNotEmpty, IsString } from 'class-validator';

import RoleItemService, {
  CreateRoleItemInput,
} from '../../../../services/role-item';

export class AdminCreateRoleItemRequest implements CreateRoleItemInput {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  path: string;
}

export default async (req: MedusaRequest, res: MedusaResponse) => {
  const validated = await validator(AdminCreateRoleItemRequest, req.body);

  const roleItemService = req.scope.resolve(
    'roleItemService',
  ) as RoleItemService;
  const permission = await roleItemService.create(validated);

  res.json(permission);
};
