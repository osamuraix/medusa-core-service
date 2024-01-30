import { ConfigModule } from '@medusajs/medusa';
import bodyParser from 'body-parser';
import cors, { CorsOptions } from 'cors';
import { Router } from 'express';
import { parseCorsOrigins } from 'medusa-core-utils';

import authRoutes from './auth';
import customerRoutes from './customer';

export default (app: Router, container, config: ConfigModule) => {
  const { projectConfig } = config;

  const corsOptions: CorsOptions = {
    origin: parseCorsOrigins(projectConfig.store_cors),
    credentials: true,
  };

  app.use('/store', cors(corsOptions), bodyParser.json());

  const storeRoute = Router();

  app.use('/store', storeRoute);

  authRoutes(storeRoute);
  customerRoutes(storeRoute, container);
};
