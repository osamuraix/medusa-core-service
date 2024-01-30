import { dataSource } from '@medusajs/medusa/dist/loaders/database';

import { RoleItem } from '../models/role-item';

export const RoleItemRepository = dataSource.getRepository(RoleItem);

export default RoleItemRepository;
