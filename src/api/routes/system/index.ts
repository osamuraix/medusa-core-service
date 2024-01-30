import { Router, Request, Response } from 'express';
import { wrapHandler } from '@medusajs/utils';

const route = Router();

export default (app: Router) => {
  app.use('/system', route);

  route.get(
    '/health',
    wrapHandler(async (req: Request, res: Response) => {
      res.sendStatus(200);
    }),
  );
};
