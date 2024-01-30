import {
  AnalyticsConfigService,
  TransactionBaseService,
} from '@medusajs/medusa';
import AnalyticsFeatureFlag from '@medusajs/medusa/dist/loaders/feature-flags/analytics';
import { FlagRouter, MedusaError } from '@medusajs/utils';
import { EntityManager, FindManyOptions, FindOneOptions } from 'typeorm';

import { Role } from '../models/role';
import { RoleItems } from '../models/role-items';
import { User } from '../models/user';
import RoleRepository from '../repositories/role';
import RoleItemsRepository from '../repositories/role-items';
import PermissionService, { CreatePermissionInput } from './permission';
import RoleItemService from './role-item';
import UserService from './user';

type CreateRoleInput = Pick<Role, 'name' | 'store_id'> & {
  permissions?: CreatePermissionInput[];
};

type UpdateRoleItemsInput = {
  item_id: string;
  permission_id: string;
};

type UpsertRolePermissionsInput = {
  store_id?: string;
  permissions: string[];
};

type InjectedDependencies = {
  roleRepository: typeof RoleRepository;
  roleItemsRepository: typeof RoleItemsRepository;
  analyticsConfigService: AnalyticsConfigService;
  roleItemService: RoleItemService;
  permissionService: PermissionService;
  userService: UserService;
  loggedInUser: User | null;
  featureFlagRouter: FlagRouter;
};

class RoleService extends TransactionBaseService {
  protected readonly roleRepository_: typeof RoleRepository;
  protected readonly analyticsConfigService_: AnalyticsConfigService;
  protected readonly roleItemService_: RoleItemService;
  protected readonly permissionService_: PermissionService;
  protected readonly roleItemsRepository_: typeof RoleItemsRepository;
  protected readonly userService_: UserService;
  protected readonly loggedInUser_: User | null;
  protected readonly featureFlagRouter_: FlagRouter;

  constructor(container: InjectedDependencies) {
    super(container);

    this.roleRepository_ = container.roleRepository;
    this.roleItemsRepository_ = container.roleItemsRepository;
    this.analyticsConfigService_ = container.analyticsConfigService;
    this.roleItemService_ = container.roleItemService;
    this.permissionService_ = container.permissionService;
    this.userService_ = container.userService;
    this.loggedInUser_ = container.loggedInUser;
    this.featureFlagRouter_ = container.featureFlagRouter;
  }

  buildQuerySearchRole(id?: string): FindManyOptions<Role> {
    const loggedInUser_ = this.loggedInUser_;

    let query: FindOneOptions<Role> = {
      where: [
        {
          id,
          store_id: loggedInUser_.store_id,
        },
        {
          id,
          users: {
            store_id: loggedInUser_.store_id,
          },
        },
      ],
      // relations: ['items', 'permissions', 'users'],
      relations: ['items', 'items.permissions', 'users'],
    };

    if (!loggedInUser_.store_id) {
      query = {
        ...query,
        where: {
          id,
        },
      };
    }

    return query;
  }

  async list(): Promise<Role[]> {
    const roleRepo = this.manager_.withRepository(this.roleRepository_);
    return roleRepo.find(this.buildQuerySearchRole());
  }

  async retrieve(id: string): Promise<Role> {
    const roleRepo = this.manager_.withRepository(this.roleRepository_);
    const role = await roleRepo.findOne(this.buildQuerySearchRole(id));

    if (!role) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        `Role with role_id: ${id} was not found`,
      );
    }

    return role;
  }

  async create(data: CreateRoleInput): Promise<Role> {
    const { store_id: storeId } = data;
    const loggedInUser_ = this.loggedInUser_;

    if (loggedInUser_.store_id && loggedInUser_.store_id !== storeId) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        `Store with store_id: ${storeId} was not found`,
      );
    }

    return this.atomicPhase_(async (manager) => {
      const { permissions: permissionsData = [] } = data;
      delete data.permissions;

      const roleRepo = manager.withRepository(this.roleRepository_);
      const role = roleRepo.create(data);

      // role.permissions = [];

      // for (const permissionData of permissionsData) {
      //   role.permissions.push(
      //     await this.permissionService_.create(permissionData),
      //   );
      // }

      const result = await roleRepo.save(role);

      return await this.retrieve(result.id);
    });
  }

  async delete(role_id: string) {
    const loggedInUser_ = this.loggedInUser_;

    return await this.atomicPhase_(async (manager: EntityManager) => {
      const analyticsServiceTx =
        this.analyticsConfigService_.withTransaction(manager);

      const role = await this.retrieve(role_id);

      if (role.store_id !== loggedInUser_.store_id) {
        throw new MedusaError(
          MedusaError.Types.NOT_ALLOWED,
          `Role with role_id: ${role_id} is not allowed`,
        );
      }

      if (this.featureFlagRouter_.isFeatureEnabled(AnalyticsFeatureFlag.key)) {
        await analyticsServiceTx.delete(role_id);
      }

      const roleRepo = manager.withRepository(this.roleRepository_);
      await roleRepo.softRemove(role);

      return Promise.resolve();
    });
  }

  async addUser(role_id: string, user_id: string): Promise<Role> {
    const [user, role] = await Promise.all([
      this.userService_.retrieve(user_id),
      this.retrieve(role_id),
    ]);

    if (role.users) {
      role.users.push(user);
    } else {
      role.users = [user];
    }

    const roleRepo = this.manager_.withRepository(this.roleRepository_);
    return roleRepo.save(role);
  }

  async removeUser(role_id: string, user_id: string) {
    await this.userService_.retrieve(user_id);
    const role = await this.retrieve(role_id);

    role.users = role.users.filter((user) => user.id !== user_id);

    const roleRepo = this.manager_.withRepository(this.roleRepository_);
    await roleRepo.save(role);

    return Promise.resolve();
  }

  async addRoleItem(
    role_id: string,
    data: UpdateRoleItemsInput,
  ): Promise<RoleItems> {
    const [role, roleItem, permission] = await Promise.all([
      this.retrieve(role_id),
      this.roleItemService_.retrieve(data.item_id),
      this.permissionService_.retrieve(data.permission_id),
    ]);

    console.log('-------->', roleItem);
    console.log('-------->', permission);

    // role.items = [roleItem];
    // role.permissions = [permission];

    console.log('--------> role', role);

    const roleRepo = this.manager_.withRepository(this.roleItemsRepository_);
    return roleRepo.save({
      role,
      roleItem,
      permission,
    });
  }

  async removeRoleItem(role_id: string, user_id: string) {
    await this.userService_.retrieve(user_id);
    const role = await this.retrieve(role_id);

    role.users = role.users.filter((user) => user.id !== user_id);

    const roleRepo = this.manager_.withRepository(this.roleRepository_);
    await roleRepo.save(role);

    return Promise.resolve();
  }

  async updateRolePermissions(
    role_id: string,
    data: UpsertRolePermissionsInput,
  ) {
    const { store_id: storeId } = data;
    const loggedInUser_ = this.loggedInUser_;

    if (loggedInUser_.store_id && loggedInUser_.store_id !== storeId) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        `Store with store_id: ${storeId} was not found`,
      );
    }

    return this.atomicPhase_(async (manager) => {
      const role = await this.retrieve(role_id);

      // role.permissions = await Promise.all(
      //   data.permissions.map((permission_id) =>
      //     this.permissionService_.retrieve(permission_id),
      //   ),
      // );

      const roleRepo = manager.withRepository(this.roleRepository_);
      const result = await roleRepo.save(role);

      return result;
    });
  }
}

export default RoleService;
