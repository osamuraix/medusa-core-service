import {
  FindConfig,
  StoreService as MedusaStoreService,
  Store,
  User,
} from '@medusajs/medusa';
import { Lifetime } from 'awilix';

class StoreService extends MedusaStoreService {
  static LIFE_TIME = Lifetime.SCOPED;
  protected readonly loggedInUser_: User | null;

  constructor(container) {
    // @ts-expect-error prefer-rest-params
    super(...arguments);

    try {
      this.loggedInUser_ = container.loggedInUser;
    } catch (e) {
      // avoid errors when backend first runs
    }
  }

  async retrieve(config?: FindConfig<Store>): Promise<Store> {
    if (!this.loggedInUser_) {
      return super.retrieve(config);
    }

    return this.retrieveForLoggedInUser(config);
  }

  async retrieveForLoggedInUser(config?: FindConfig<Store>) {
    const storeRepo = this.manager_.withRepository(this.storeRepository_);
    const store = await storeRepo.findOne({
      ...config,
      relations: [...config.relations, 'members', 'roles'],
      where: {
        id: this.loggedInUser_.store_id,
      },
    });

    if (!store) {
      throw new Error('Unable to find the user store');
    }

    return store;
  }
}

export default StoreService;
