import { authenticate } from '@medusajs/medusa';
import { wrapHandler } from '@medusajs/utils';
import { Router } from 'express';

import createSession from '@medusajs/medusa/dist/api/routes/admin/auth/create-session';
import deleteSession from '@medusajs/medusa/dist/api/routes/admin/auth/delete-session';
import getUser from '@medusajs/medusa/dist/api/routes/admin/auth/get-session';
import getToken from '@medusajs/medusa/dist/api/routes/admin/auth/get-token';

const route = Router();

export default (app: Router) => {
  app.use('/auth', route);

  route.post('/', wrapHandler(createSession));

  route.post('/token', wrapHandler(getToken));

  route.use(authenticate());

  route.get('/', wrapHandler(getUser));

  route.delete('/', wrapHandler(deleteSession));
};
