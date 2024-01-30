import type {
  MedusaNextFunction,
  MedusaRequest,
  MedusaResponse,
} from '@medusajs/medusa';

import { User } from '../../models/user';
import UserService from '../../services/user';

const getUserByUserId = async (req: MedusaRequest) => {
  const userService = req.scope.resolve('userService') as UserService;
  return await userService.retrieve(req.user.userId);
};

export const registerLoggedInUser = async (
  req: MedusaRequest,
  res: MedusaResponse,
  next: MedusaNextFunction,
) => {
  let loggedInUser: User | null = null;

  if (req.user && req.user.userId) {
    loggedInUser = await getUserByUserId(req);
  }

  req.scope.register({
    loggedInUser: {
      resolve: () => loggedInUser,
    },
  });

  next();
};

export const permissions = async (
  req: MedusaRequest,
  res: MedusaResponse,
  next: MedusaNextFunction,
) => {
  if (!req.user || !req.user.userId) {
    next();
    return;
  }

  const loggedInUser = await getUserByUserId(req);

  if (!loggedInUser.roles) {
    next();
    return;
  }

  // const mappedMetadata = loggedInUser.roles.flatMap((roles) =>
  //   roles.permissions.map((permissions) => permissions),
  // );

  // const isAllowed = mappedMetadata.some((permission) => {
  //   const metadataKey = Object.keys(permission.metadata).find(
  //     (key) => key === req.path,
  //   );

  //   if (!metadataKey) {
  //     return false;
  //   }

  //   return permission.metadata[metadataKey];
  // });

  // if (!isAllowed) {
  //   next();
  //   return;
  // }

  // res.sendStatus(401);

  next();
  return;
};
