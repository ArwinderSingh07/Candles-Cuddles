import { Types } from 'mongoose';
import { OrderModel, OrderDocument } from '../models/Order';
import { ProductModel } from '../models/Product';

interface CartItemInput {
  productId: string;
  qty: number;
}

export const hydrateItems = async (items: CartItemInput[]) => {
  const ids = items.map((item) => new Types.ObjectId(item.productId));
  const products = await ProductModel.find({ _id: { $in: ids }, active: true });
  const itemsWithDetails = items.map((item) => {
    const product = products.find((p) => p._id.toString() === item.productId);
    if (!product) {
      throw new Error(`Product ${item.productId} unavailable`);
    }
    if (item.qty > product.stock) {
      throw new Error(`Insufficient stock for ${product.title}`);
    }
    return {
      productId: product._id.toString(),
      title: product.title,
      qty: item.qty,
      price: product.price,
    };
  });

  const amount = itemsWithDetails.reduce((acc, item) => acc + item.price * item.qty, 0);
  return { items: itemsWithDetails, amount };
};

export const markOrderStatus = async (
  orderId: string,
  status: OrderDocument['status'],
  extra?: Partial<OrderDocument>,
) => {
  return OrderModel.findByIdAndUpdate(orderId, { status, ...extra }, { new: true });
};

