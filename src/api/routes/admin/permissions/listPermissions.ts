import type { MedusaRequest, MedusaResponse } from '@medusajs/medusa';

import PermissionService from '../../../../services/permission';

export default async (req: MedusaRequest, res: MedusaResponse) => {
  const permissionService = req.scope.resolve(
    'permissionService',
  ) as PermissionService;
  const permission = await permissionService.list();

  res.json({ permission });
};
