import dotenv from 'dotenv';
import httpProxy from 'express-http-proxy';
import { authenticate } from '@medusajs/medusa';
import { Router } from 'express';

dotenv.config();

const productsServiceUrl = process.env.PRODUCTS_SERVICE_URL;
const ordersServiceUrl = process.env.ORDERS_SERVICE_URL;

export default (app: Router) => {
  if (productsServiceUrl) {
    const productRoute = Router();
    app.use('/admin/products', authenticate(), productRoute);
    productRoute.all('*', httpProxy(productsServiceUrl));
  }

  if (ordersServiceUrl) {
    const orderRoute = Router();
    app.use('/admin/orders', authenticate(), orderRoute);
    orderRoute.all('*', httpProxy(ordersServiceUrl));
  }
};
