import { authenticate } from '@medusajs/medusa';
import { wrapHandler } from '@medusajs/utils';
import { Router } from 'express';

import addUser from './addUser';
// import createPermission from './createPermission';
import createRole from './createRole';
// import deletePermission from './deletePermission';
import deleteRole from './deleteRole';
import getRole from './getRole';
// import listPermissions from './listPermissions';
import addRoleItem from './addRoleItem';
import listRoles from './listRoles';
import removeRoleItem from './removeRoleItem';
import removeUser from './removeUser';
import upsertRolePermissions from './upsertRolePermissions';

const route = Router();

export default (app: Router) => {
  app.use('/roles', route);

  route.use(authenticate());

  route.get('/', wrapHandler(listRoles));

  route.post('/', wrapHandler(createRole));

  // route.get('/permissions', wrapHandler(listPermissions));

  // route.post('/permission', wrapHandler(createPermission));

  // route.delete('/permission/:permission_id', wrapHandler(deletePermission));

  route.get('/:role_id', wrapHandler(getRole));

  route.delete('/:role_id', wrapHandler(deleteRole));

  route.post('/:role_id/user', wrapHandler(addUser));

  route.delete('/:role_id/user', wrapHandler(removeUser));

  route.post('/:role_id/role-item', wrapHandler(addRoleItem));

  route.delete('/:role_id/role-item', wrapHandler(removeRoleItem));

  route.put('/:role_id/permissions', wrapHandler(upsertRolePermissions));
};
