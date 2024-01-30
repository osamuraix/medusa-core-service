import { MedusaRequest, MedusaResponse } from '@medusajs/medusa';

import RoleService from '../../../../services/role';

export default async (req: MedusaRequest, res: MedusaResponse) => {
  const { role_id } = req.params;

  const roleService = req.scope.resolve('roleService') as RoleService;

  const role = await roleService.retrieve(role_id);
  res.json({ role });
};
