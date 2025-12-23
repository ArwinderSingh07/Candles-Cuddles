import { test, expect } from '@playwright/test';

const productFixture = [
  {
    _id: 'prod_1',
    title: 'Vanilla Smoke',
    slug: 'vanilla-smoke',
    description: 'Vanilla bean, oud, sandalwood.',
    price: 99900,
    currency: 'INR',
    images: ['/design/product_page.jpg'],
    stock: 5,
  },
];

test('checkout flow with mocked Razorpay', async ({ page }) => {
  await page.route('**/api/v1/products', (route) => route.fulfill({ json: productFixture }));
  await page.route('**/api/v1/orders/create', (route) =>
    route.fulfill({
      json: {
        orderId: 'db_order',
        razorpayOrderId: 'rzp_order',
        amount: 99900,
        currency: 'INR',
        key: 'rzp_test_key',
      },
    }),
  );

  let verifyCalled = false;
  await page.route('**/api/v1/orders/verify', (route) => {
    verifyCalled = true;
    route.fulfill({ json: { message: 'Order verified' } });
  });

  await page.route('https://checkout.razorpay.com/v1/checkout.js', (route) =>
    route.fulfill({
      contentType: 'application/javascript',
      body: `
        window.Razorpay = function (options) {
          this.open = () => {
            options.handler({
              razorpay_payment_id: 'pay_test',
              razorpay_order_id: options.order_id,
              razorpay_signature: 'sig_test',
            });
          };
        };
      `,
    }),
  );

  await page.goto('/');
  await page.getByRole('link', { name: 'Shop' }).click();
  await page.getByRole('button', { name: 'Add' }).click();
  await page.goto('/checkout');

  await page.getByLabel('Full name').fill('Test User');
  await page.getByLabel('Email').fill('test@example.com');
  await page.getByLabel('Phone').fill('9999999999');
  await page.getByRole('button', { name: 'Pay with Razorpay' }).click();

  await expect(page.getByText('Payment captured!')).toBeVisible();
  expect(verifyCalled).toBeTruthy();
});

