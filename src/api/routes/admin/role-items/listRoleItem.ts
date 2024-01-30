import type { MedusaRequest, MedusaResponse } from '@medusajs/medusa';

import RoleItemService from '../../../../services/role-item';

export default async (req: MedusaRequest, res: MedusaResponse) => {
  const roleItemService = req.scope.resolve(
    'roleItemService',
  ) as RoleItemService;
  const roleItems = await roleItemService.list();

  res.json({ roleItems });
};
