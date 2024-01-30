import { dataSource } from '@medusajs/medusa/dist/loaders/database';

import { RoleItems } from '../models/role-items';

export const RoleItemsRepository = dataSource.getRepository(RoleItems);

export default RoleItemsRepository;
