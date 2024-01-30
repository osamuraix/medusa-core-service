import { authenticate } from '@medusajs/medusa';
import { wrapHandler } from '@medusajs/utils';
import { Router } from 'express';

import createRoleItem from './createRoleItem';
import deleteRoleItem from './deleteRoleItem';
import listRoleItem from './listRoleItem';

const route = Router();

export default (app: Router) => {
  app.use('/role-items', route);

  route.use(authenticate());

  route.get('/', wrapHandler(listRoleItem));

  route.post('/', wrapHandler(createRoleItem));

  route.delete('/:id', wrapHandler(deleteRoleItem));
};
