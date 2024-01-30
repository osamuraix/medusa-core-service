import { errorHandler } from '@medusajs/medusa';
import { ConfigModule } from '@medusajs/types';
import { Router } from 'express';

import adminRoutes from './routes/admin';
import gatewayRoutes from './routes/gateway';
import storeRoutes from './routes/store';
import systemRoutes from './routes/system';

export default (container, config: ConfigModule) => {
  const app = Router();

  adminRoutes(app, container, config);
  gatewayRoutes(app);
  storeRoutes(app, container, config);
  systemRoutes(app);
  app.use(errorHandler());

  return app;
};
