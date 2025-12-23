import { NextFunction, Request, Response } from 'express';
import { CustomerModel } from '../models/Customer';

declare module 'express-serve-static-core' {
  interface Request {
    customer?: {
      id: string;
      email: string;
      name: string;
    };
  }
}

/**
 * Middleware to authenticate customer via customerId
 * Customer ID can be passed in:
 * - Authorization header: "Customer <customerId>"
 * - Request body: customerId
 * - Query params: customerId
 */
export const authenticateCustomer = async (req: Request, res: Response, next: NextFunction) => {
  let customerId: string | undefined;

  // Check Authorization header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Customer ')) {
    customerId = authHeader.split(' ')[1];
  }

  // Check request body
  if (!customerId && req.body?.customerId) {
    customerId = req.body.customerId;
  }

  // Check query params
  if (!customerId && req.query?.customerId) {
    customerId = req.query.customerId as string;
  }

  if (!customerId) {
    return res.status(401).json({ message: 'Customer authentication required' });
  }

  try {
    const customer = await CustomerModel.findById(customerId);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    req.customer = {
      id: customer._id.toString(),
      email: customer.email,
      name: customer.name,
    };
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid customer ID' });
  }
};

