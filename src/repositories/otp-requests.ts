import { dataSource } from '@medusajs/medusa/dist/loaders/database';

import { OtpRequests } from '../models/otp-requests';

export const OtpRequestsRepository = dataSource.getRepository(OtpRequests);

export default OtpRequestsRepository;
