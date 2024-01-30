import { authenticate } from '@medusajs/medusa';
import { wrapHandler } from '@medusajs/utils';
import { Router } from 'express';

import resetPassword from '@medusajs/medusa/dist/api/routes/admin/users/reset-password';
import resetPasswordToken from '@medusajs/medusa/dist/api/routes/admin/users/reset-password-token';

import deleteUser from '@medusajs/medusa/dist/api/routes/admin/users/delete-user';
import getUser from '@medusajs/medusa/dist/api/routes/admin/users/get-user';
import listUsers from '@medusajs/medusa/dist/api/routes/admin/users/list-users';

import createUser from './createUser';
import updateUser from './updateUser';

const route = Router();

export default (app: Router) => {
  app.use('/users', route);

  route.post('/password-token', wrapHandler(resetPasswordToken));

  route.post('/reset-password', wrapHandler(resetPassword));

  route.use(authenticate());

  route.get('/:user_id', wrapHandler(getUser));

  route.post('/', wrapHandler(createUser));

  route.post('/:user_id', wrapHandler(updateUser));

  route.delete('/:user_id', wrapHandler(deleteUser));

  route.get('/', wrapHandler(listUsers));
};
