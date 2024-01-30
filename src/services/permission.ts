import {
  AnalyticsConfigService,
  TransactionBaseService,
} from '@medusajs/medusa';
import AnalyticsFeatureFlag from '@medusajs/medusa/dist/loaders/feature-flags/analytics';
import { FlagRouter, MedusaError } from '@medusajs/utils';

import { EntityManager, FindManyOptions, FindOneOptions } from 'typeorm';
import { Permission } from '../models/permission';
import { User } from '../models/user';
import PermissionRepository from '../repositories/permission';

export type CreatePermissionInput = Pick<
  Permission,
  'name' | 'store_id' | 'metadata'
>;

type InjectedDependencies = {
  permissionRepository: typeof PermissionRepository;
  loggedInUser: User | null;
  analyticsConfigService: AnalyticsConfigService;
  featureFlagRouter: FlagRouter;
};

class PermissionService extends TransactionBaseService {
  protected readonly permissionRepository_: typeof PermissionRepository;
  protected readonly loggedInUser_: User | null;
  protected readonly analyticsConfigService_: AnalyticsConfigService;
  protected readonly featureFlagRouter_: FlagRouter;

  constructor(container: InjectedDependencies) {
    super(container);
    this.permissionRepository_ = container.permissionRepository;
    this.loggedInUser_ = container.loggedInUser;
    this.analyticsConfigService_ = container.analyticsConfigService;
    this.featureFlagRouter_ = container.featureFlagRouter;
  }

  buildQuerySearchRole(id?: string): FindManyOptions<Permission> {
    const loggedInUser_ = this.loggedInUser_;

    let query: FindOneOptions<Permission> = {
      where: {
        id,
        store_id: loggedInUser_.store_id,
      },
    };

    if (!loggedInUser_.store_id) {
      query = {
        where: {
          id,
        },
        ...query,
      };
    }

    return query;
  }

  async list(): Promise<Permission[]> {
    const permissionRepo = this.manager_.withRepository(
      this.permissionRepository_,
    );

    return permissionRepo.find(this.buildQuerySearchRole());
  }

  async retrieve(id: string): Promise<Permission> {
    const permissionRepo = this.manager_.withRepository(
      this.permissionRepository_,
    );
    const permission = await permissionRepo.findOne(
      this.buildQuerySearchRole(id),
    );

    if (!permission) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        `Permission with permission_id: ${id} was not found`,
      );
    }

    return permission;
  }

  async create(data: CreatePermissionInput) {
    const { store_id: storeId } = data;
    const loggedInUser_ = this.loggedInUser_;

    if (loggedInUser_.store_id && loggedInUser_.store_id !== storeId) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        `Store with store_id: ${storeId} was not found`,
      );
    }

    return this.atomicPhase_(async (manager) => {
      const permissionRepo = manager.withRepository(this.permissionRepository_);
      const permission = permissionRepo.create(data);

      const result = await permissionRepo.save(permission);

      return result;
    });
  }

  async delete(permission_id: string) {
    const loggedInUser_ = this.loggedInUser_;

    return await this.atomicPhase_(async (manager: EntityManager) => {
      const analyticsServiceTx =
        this.analyticsConfigService_.withTransaction(manager);

      const permission = await this.retrieve(permission_id);

      if (permission.store_id !== loggedInUser_.store_id) {
        throw new MedusaError(
          MedusaError.Types.NOT_ALLOWED,
          `Permission with permission_id: ${permission_id} is not allowed`,
        );
      }

      if (this.featureFlagRouter_.isFeatureEnabled(AnalyticsFeatureFlag.key)) {
        await analyticsServiceTx.delete(permission_id);
      }

      const permissionRepo = manager.withRepository(this.permissionRepository_);
      await permissionRepo.remove(permission);

      return Promise.resolve();
    });
  }
}

export default PermissionService;
