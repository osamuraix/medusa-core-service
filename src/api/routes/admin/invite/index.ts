import { authenticate } from '@medusajs/medusa';
import { wrapHandler } from '@medusajs/utils';
import { Router } from 'express';

import acceptInvite from '@medusajs/medusa/dist/api/routes/admin/invites/accept-invite';
import createInvite from '@medusajs/medusa/dist/api/routes/admin/invites/create-invite';
import deleteInvite from '@medusajs/medusa/dist/api/routes/admin/invites/delete-invite';
import listInvites from '@medusajs/medusa/dist/api/routes/admin/invites/list-invites';
import resendInvite from '@medusajs/medusa/dist/api/routes/admin/invites/resend-invite';

const route = Router();

export default (app: Router) => {
  app.use('/invites', route);

  route.post('/accept', wrapHandler(acceptInvite));

  route.use(authenticate());

  route.get('/', wrapHandler(listInvites));

  route.post('/', wrapHandler(createInvite));

  route.post('/:invite_id/resend', wrapHandler(resendInvite));

  route.delete('/:invite_id', wrapHandler(deleteInvite));
};
