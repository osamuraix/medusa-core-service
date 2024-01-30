import { requireCustomerAuthentication } from '@medusajs/medusa';
import { wrapHandler } from '@medusajs/utils';
import { Router } from 'express';

import createSession from '@medusajs/medusa/dist/api/routes/store/auth/create-session';
import deleteSession from '@medusajs/medusa/dist/api/routes/store/auth/delete-session';
import getExists from '@medusajs/medusa/dist/api/routes/store/auth/exists';
import getSession from '@medusajs/medusa/dist/api/routes/store/auth/get-session';
import getToken from '@medusajs/medusa/dist/api/routes/store/auth/get-token';

import createOtp from './createOtp';
import verifyOtp from './verifyOtp';

const route = Router();

export default (app: Router) => {
  app.use('/auth', route);

  route.get('/', requireCustomerAuthentication(), wrapHandler(getSession));
  route.get('/:email', wrapHandler(getExists));
  route.delete('/', wrapHandler(deleteSession));
  route.post('/', wrapHandler(createSession));
  route.post('/token', wrapHandler(getToken));

  route.post('/otp', wrapHandler(createOtp));
  route.post('/otp/verify', wrapHandler(verifyOtp));
};
