import { wrapHandler } from '@medusajs/utils';
import { Router } from 'express';

import createCustomer from './createCustomer';

const route = Router();

export default (app: Router, container) => {
  app.use('/customers', route);

  route.post('/', wrapHandler(createCustomer));
};
