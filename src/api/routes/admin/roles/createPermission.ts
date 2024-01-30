import { MedusaRequest, MedusaResponse, validator } from '@medusajs/medusa';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

import PermissionService, {
  CreatePermissionInput,
} from '../../../../services/permission';

export class AdminCreatePermissionRequest implements CreatePermissionInput {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  metadata: Record<string, boolean>;

  @IsOptional()
  @IsString()
  store_id?: string;
}

export default async (req: MedusaRequest, res: MedusaResponse) => {
  const validated = await validator(AdminCreatePermissionRequest, req.body);

  const permissionService = req.scope.resolve(
    'permissionService',
  ) as PermissionService;
  const permission = await permissionService.create(validated);

  res.json(permission);
};
