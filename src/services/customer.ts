import {
  Customer,
  CustomerService as MedusaCustomerService,
} from '@medusajs/medusa';
import { CreateCustomerInput as MedusaCreateCustomerInput } from '@medusajs/medusa/dist/types/customers';

import config from '../config';
import { phoneWithoutRegion } from '../utils/otp';

export type CreateCustomerInput = {
  phone?: string;
  email?: string;
} & MedusaCreateCustomerInput;

class CustomerService extends MedusaCustomerService {
  constructor(container) {
    // @ts-expect-error prefer-rest-params
    super(...arguments);
  }

  async create(customer: CreateCustomerInput): Promise<Customer> {
    if (!customer.email) {
      customer.phone = phoneWithoutRegion(customer.phone);
      customer.email = `${customer.phone.substring(1)}@${
        config.store.customer.domainEmail
      }`;
    }

    return super.create(customer);
  }
}

export default CustomerService;
