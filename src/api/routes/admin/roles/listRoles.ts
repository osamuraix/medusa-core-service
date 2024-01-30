import type { MedusaRequest, MedusaResponse } from '@medusajs/medusa';

import RoleService from '../../../../services/role';

export default async (req: MedusaRequest, res: MedusaResponse) => {
  const roleService = req.scope.resolve('roleService') as RoleService;
  const role = await roleService.list();

  res.json({ role });
};
