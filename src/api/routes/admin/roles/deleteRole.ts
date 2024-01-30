import { MedusaRequest, MedusaResponse } from '@medusajs/medusa';
import { EntityManager } from 'typeorm';

import RoleService from '../../../../services/role';

export default async (req: MedusaRequest, res: MedusaResponse) => {
  const { role_id } = req.params;

  const roleService = req.scope.resolve('roleService') as RoleService;
  const manager: EntityManager = req.scope.resolve('manager');

  await manager.transaction(async (transactionManager) => {
    return await roleService
      .withTransaction(transactionManager)
      .delete(role_id);
  });

  res.status(200).send({
    id: role_id,
    object: 'role',
    deleted: true,
  });
};
