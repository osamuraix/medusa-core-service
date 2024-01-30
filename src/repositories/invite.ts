import { dataSource } from '@medusajs/medusa/dist/loaders/database';

import { Invite } from '../models/invite';

export const InviteRepository = dataSource.getRepository(Invite);

export default InviteRepository;
