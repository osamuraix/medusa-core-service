import { authenticate } from '@medusajs/medusa';
import { wrapHandler } from '@medusajs/utils';
import { Router } from 'express';

import createPermission from './createPermission';
import deletePermission from './deletePermission';
import listPermissions from './listPermissions';

const route = Router();

export default (app: Router) => {
  app.use('/permissions', route);

  route.use(authenticate());

  route.get('/', wrapHandler(listPermissions));

  route.post('/', wrapHandler(createPermission));

  route.delete('/:id', wrapHandler(deletePermission));
};
