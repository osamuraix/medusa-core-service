import { FindConfig, UserService as MedusaUserService } from '@medusajs/medusa';
import {
  CreateUserInput as MedusaCreateUserInput,
  FilterableUserProps as MedusaFilterableUserProps,
  UpdateUserInput as MedusaUpdateUserInput,
} from '@medusajs/medusa/dist/types/user';
import { MedusaError } from '@medusajs/utils';
import { Lifetime } from 'awilix';

import { User } from '../models/user';
import StoreRepository from '../repositories/store';
import UserRepository from '../repositories/user';

type CreateUserInput = {
  store_id?: string;
} & MedusaCreateUserInput;

type UpdateUserInput = {
  role_id?: string;
  store_id?: string;
} & MedusaUpdateUserInput;

type FilterableUserProps = {
  store_id?: string;
} & MedusaFilterableUserProps;

class UserService extends MedusaUserService {
  static LIFE_TIME = Lifetime.TRANSIENT;
  protected readonly loggedInUser_: User | null;
  protected readonly storeRepository_: typeof StoreRepository;
  protected readonly userRepository_: typeof UserRepository;

  constructor(container) {
    // @ts-expect-error prefer-rest-params
    super(...arguments);
    this.storeRepository_ = container.storeRepository;
    this.userRepository_ = container.userRepository;

    try {
      this.loggedInUser_ = container.loggedInUser;
    } catch (e) {
      // avoid errors when backend first runs
    }
  }

  async list(
    selector: FilterableUserProps,
    config: FindConfig<User> = {},
  ): Promise<User[]> {
    const { store_id } = this.loggedInUser_;
    let condition: FilterableUserProps;

    const relations = new Set(['roles', 'roles.items', 'store']);
    config.relations = [...relations];

    if (store_id) {
      condition = {
        store_id,
      };
    }

    return super.list({ ...condition, ...selector }, config);
  }

  async retrieve(
    user_id: string,
    config: FindConfig<User> = {},
  ): Promise<User> {
    const relations = new Set(['roles', 'roles.items', 'store']);
    config.relations = [...relations];

    if (this.loggedInUser_?.store_id) {
      return this.retrieveForLoggedInUser(user_id, config);
    }

    return super.retrieve(user_id, config);
  }

  async retrieveForLoggedInUser(user_id: string, config?: FindConfig<User>) {
    const { store_id } = this.loggedInUser_;

    const userRepo = this.manager_.withRepository(this.userRepository_);
    const user = await userRepo.findOne({
      ...config,
      where: {
        id: user_id,
        store_id,
      },
    });

    if (!user) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        `User with user_id: ${user_id} was not found`,
      );
    }

    return user;
  }

  async create(user: CreateUserInput, password: string): Promise<User> {
    if (!user.store_id) {
      const storeRepo = this.manager_.withRepository(this.storeRepository_);
      let newStore = storeRepo.create();
      newStore = await storeRepo.save(newStore);
      user.store_id = newStore.id;
    }

    return super.create(user, password);
  }

  async update(user_id: string, update: UpdateUserInput): Promise<User> {
    return super.update(user_id, update);
  }
}

export default UserService;
