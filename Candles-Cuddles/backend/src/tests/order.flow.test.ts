import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { app } from '../app';
import { ProductModel } from '../models/Product';
import * as razorpayService from '../services/razorpay.service';

describe('Orders API', () => {
  let mongo: MongoMemoryServer;

  beforeAll(async () => {
    mongo = await MongoMemoryServer.create();
    await mongoose.connect(mongo.getUri());
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongo.stop();
  });

  it('creates an order and returns Razorpay payload', async () => {
    await ProductModel.create({
      title: 'Lavender Candle',
      slug: 'lavender-candle',
      description: 'Relaxing lavender scent',
      price: 129900,
      currency: 'INR',
      images: [],
      stock: 5,
      active: true,
    });

    const spy = jest.spyOn(razorpayService, 'createRazorpayOrder').mockResolvedValue({
      id: 'order_test',
      amount: 129900,
      currency: 'INR',
      status: 'created',
    } as any);

    const res = await request(app).post('/api/v1/orders/create').send({
      user: { name: 'Jane Doe', email: 'jane@example.com' },
      items: [{ productId: (await ProductModel.findOne({ slug: 'lavender-candle' }))!._id.toString(), qty: 1 }],
    });

    expect(res.status).toBe(201);
    expect(res.body.razorpayOrderId).toBe('order_test');
    expect(res.body.amount).toBe(129900);
    expect(spy).toHaveBeenCalled();

    spy.mockRestore();
  });
});

