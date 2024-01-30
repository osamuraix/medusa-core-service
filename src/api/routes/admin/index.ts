import { authenticate } from '@medusajs/medusa';
import { ConfigModule } from '@medusajs/types';
import bodyParser from 'body-parser';
import cors, { CorsOptions } from 'cors';
import { Router } from 'express';

import { permissions, registerLoggedInUser } from '../../middlewares';
import authRoutes from './auth';
import inviteRoutes from './invite';
import permissionRoutes from './permissions';
import roleItems from './role-items';
import rolesRoutes from './roles';
import userRoutes from './users';

export default (app: Router, container, config: ConfigModule) => {
  const { projectConfig } = config;

  const corsOptions: CorsOptions = {
    origin: projectConfig.admin_cors.split(','),
    credentials: true,
  };

  app.use('/admin', cors(corsOptions), bodyParser.json());
  app.use(
    /\/admin\/((?!auth)(?!invites\/accept)(?!users\/reset-password)(?!users\/password-token).*)/,
    authenticate(),
  );

  const adminRoute = Router();
  adminRoute.use(registerLoggedInUser, permissions);

  app.use('/admin', adminRoute);

  authRoutes(adminRoute);
  inviteRoutes(adminRoute);
  permissionRoutes(adminRoute);
  roleItems(adminRoute);
  rolesRoutes(adminRoute);
  userRoutes(adminRoute);
};
