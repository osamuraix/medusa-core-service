import { TransactionBaseService } from '@medusajs/medusa';
import { MedusaError } from '@medusajs/utils';
import { EntityManager } from 'typeorm';

import { RoleItem } from '../models/role-item';
import RoleItemRepository from '../repositories/role-item';

export type CreateRoleItemInput = Pick<RoleItem, 'name' | 'path'>;

type InjectedDependencies = {
  roleItemRepository: typeof RoleItemRepository;
};

class RoleItemService extends TransactionBaseService {
  protected readonly roleItemRepository_: typeof RoleItemRepository;

  constructor(container: InjectedDependencies) {
    super(container);

    this.roleItemRepository_ = container.roleItemRepository;
  }

  async list(): Promise<RoleItem[]> {
    const roleItemRepo = this.manager_.withRepository(this.roleItemRepository_);
    return roleItemRepo.find();
  }

  async retrieve(id: string): Promise<RoleItem> {
    const roleItemRepo = this.manager_.withRepository(this.roleItemRepository_);
    const roleItem = await roleItemRepo.findOne({
      where: {
        id,
      },
    });

    if (!roleItem) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        `Role item with item_id: ${id} was not found`,
      );
    }

    return roleItem;
  }

  async create(data: CreateRoleItemInput): Promise<RoleItem> {
    return this.atomicPhase_(async (manager) => {
      const roleItemRepo = manager.withRepository(this.roleItemRepository_);
      const roleItem = roleItemRepo.create(data);

      const result = await roleItemRepo.save(roleItem);

      return await this.retrieve(result.id);
    });
  }

  async delete(id: string) {
    return await this.atomicPhase_(async (manager: EntityManager) => {
      const roleItem = await this.retrieve(id);

      const roleItemRepo = manager.withRepository(this.roleItemRepository_);
      await roleItemRepo.remove(roleItem);

      return Promise.resolve();
    });
  }
}

export default RoleItemService;
