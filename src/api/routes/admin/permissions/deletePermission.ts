import { MedusaRequest, MedusaResponse } from '@medusajs/medusa';
import { EntityManager } from 'typeorm';

import PermissionService from '../../../../services/permission';

export default async (req: MedusaRequest, res: MedusaResponse) => {
  const { permission_id } = req.params;

  const permissionService = req.scope.resolve(
    'permissionService',
  ) as PermissionService;
  const manager: EntityManager = req.scope.resolve('manager');

  await manager.transaction(async (transactionManager) => {
    return await permissionService
      .withTransaction(transactionManager)
      .delete(permission_id);
  });

  res.status(200).send({
    id: permission_id,
    object: 'role',
    deleted: true,
  });
};
