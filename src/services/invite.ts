import { UserRoles } from '@medusajs/medusa';
import MedusaInviteService from '@medusajs/medusa/dist/services/invite';
import { ListInvite } from '@medusajs/medusa/dist/types/invites';
import { MedusaError } from '@medusajs/utils';
import { JwtPayload } from 'jsonwebtoken';

import { EntityManager } from 'typeorm';
import { Invite } from '../models/invite';
import { User } from '../models/user';
import InviteRepository from '../repositories/invite';
import StoreRepository from '../repositories/store';
import UserRepository from '../repositories/user';

type UpdateInviteInput = {
  store_id?: string;
};

class InviteService extends MedusaInviteService {
  protected readonly loggedInUser_: User | null;
  protected readonly inviteRepository_: typeof InviteRepository;
  protected readonly userRepository_: typeof UserRepository;
  protected readonly storeRepository_: typeof StoreRepository;

  constructor(container) {
    // @ts-expect-error prefer-rest-params
    super(...arguments);
    this.inviteRepository_ = container.inviteRepository;
    this.userRepository_ = container.userRepository;
    this.storeRepository_ = container.storeRepository;

    try {
      this.loggedInUser_ = container.loggedInUser;
    } catch (e) {
      // avoid errors when backend first runs
    }
  }

  async retrieve(id: string): Promise<Invite> {
    const inviteRepo = this.manager_.withRepository(this.inviteRepository_);
    const invite = await inviteRepo.findOneBy({ id });

    if (!invite) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        `Invite with invite_id: ${id} was not found`,
      );
    }

    return invite;
  }

  async update(inviteId: string, data: UpdateInviteInput): Promise<Invite> {
    return await this.atomicPhase_(async (manager: EntityManager) => {
      const { store_id } = data;

      const inviteRepo = manager.withRepository(this.inviteRepository_);

      const invite = await this.retrieve(inviteId);

      if (store_id) {
        invite.store_id = store_id;
      }

      return inviteRepo.save(invite);
    });
  }

  async list(selector, config = {}): Promise<ListInvite[]> {
    const { store_id } = this.loggedInUser_;
    let condition = {};

    if (store_id) {
      condition = {
        store_id,
      };
    }

    return super.list({ ...condition, ...selector }, config);
  }

  async create(
    user: string,
    role: UserRoles,
    validDuration?: number,
  ): Promise<void> {
    await super.create(user, role, validDuration);

    const store_id = this.loggedInUser_?.store_id;
    if (store_id) {
      await this.atomicPhase_(async (manager: EntityManager) => {
        const inviteRepo = manager.withRepository(this.inviteRepository_);
        const invite = await inviteRepo.findOneBy({ user_email: user });

        await this.update(invite.id, { store_id });
      });
    }
  }

  async accept(token: string, user_: User): Promise<User> {
    let decoded;

    try {
      decoded = this.verifyToken(token);
    } catch (err) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        'Token is not valid',
      );
    }

    const { invite_id } = decoded;

    const invite = await this.retrieve(invite_id);
    const store_id = invite?.store_id;

    const user = await super.accept(token, user_);

    if (store_id) {
      let old_store_id = user.store_id;

      const userRepo = this.manager_.withRepository(this.userRepository_);
      const storeRepo = this.manager_.withRepository(this.storeRepository_);

      user.store_id = store_id;

      await Promise.all([
        await userRepo.save(user),
        await storeRepo.delete({ id: old_store_id }),
      ]);
    }

    return user;
  }

  verifyToken(token): JwtPayload | string {
    return super.verifyToken(token);
  }
}

export default InviteService;
