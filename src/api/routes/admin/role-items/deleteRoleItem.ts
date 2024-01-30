import { MedusaRequest, MedusaResponse } from '@medusajs/medusa';
import { EntityManager } from 'typeorm';

import RoleItemService from '../../../../services/role-item';

export default async (req: MedusaRequest, res: MedusaResponse) => {
  const { id } = req.params;

  const roleItemService = req.scope.resolve(
    'roleItemService',
  ) as RoleItemService;
  const manager: EntityManager = req.scope.resolve('manager');

  await manager.transaction(async (transactionManager) => {
    return await roleItemService.withTransaction(transactionManager).delete(id);
  });

  res.status(200).send({
    id,
    object: 'roleItem',
    deleted: true,
  });
};
