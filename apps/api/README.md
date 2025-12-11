# Custom Printing E-Commerce API

Backend API for the Custom Printing E-Commerce Platform built with Express, Prisma, Supabase, and Razorpay.

## Tech Stack

- **Runtime**: Bun
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Supabase (customers) + JWT (admin)
- **Payments**: Razorpay
- **File Upload**: Multer (local storage, can be extended to S3)

## Project Structure

```
src/
├── controllers/     # Request handlers
│   ├── authController.ts
│   ├── productController.ts
│   ├── orderController.ts
│   ├── paymentController.ts
│   └── uploadController.ts
├── middleware/      # Express middleware
│   ├── auth.ts          # Authentication middleware
│   ├── errorHandler.ts  # Error handling
│   └── upload.ts        # File upload configuration
├── routes/         # API routes
│   ├── auth.ts
│   ├── customer.ts
│   ├── admin.ts
│   ├── payment.ts
│   └── upload.ts
├── services/       # External services
│   ├── prisma.ts
│   ├── supabase.ts
│   └── razorpay.ts
├── utils/          # Utility functions
│   ├── response.ts
│   └── errors.ts
└── index.ts        # Application entry point
```

## Setup

### 1. Install Dependencies

```bash
bun install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and fill in the values:

```bash
cp .env.example .env
```

Required variables:
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret key for JWT tokens
- `RAZORPAY_KEY_ID` & `RAZORPAY_KEY_SECRET`: Razorpay credentials
- `SUPABASE_URL` & `SUPABASE_ANON_KEY`: (Optional) Supabase credentials

### 3. Setup Database

```bash
# Generate Prisma Client
bun run db:generate

# Push schema to database
bun run db:push

# Seed database with sample data
bun run db:seed
```

### 4. Start Development Server

```bash
bun run dev
```

The server will start on `http://localhost:3002`

## API Endpoints

### Authentication & User

- `POST /api/auth/register` - Customer registration
- `POST /api/auth/login` - Customer login
- `POST /api/auth/admin/login` - Admin login
- `GET /api/user/profile` - Get user profile (protected)

### Product Catalog

- `GET /api/categories` - List all categories
- `GET /api/products` - List products (with pagination & filters)
- `GET /api/products/:id` - Get single product
- `POST /api/admin/products` - Create product (admin)
- `PUT /api/admin/products/:id` - Update product (admin)
- `DELETE /api/admin/products/:id` - Delete product (admin)
- `POST /api/admin/products/:id/variants` - Add variant (admin)

### File Upload

- `POST /api/upload` - Upload design image (protected)

### Orders

- `POST /api/orders` - Create order (protected)
- `GET /api/orders` - List my orders (protected)
- `GET /api/orders/:id` - Get order details (protected)
- `GET /api/orders/:id/track` - Track order (public, requires email/phone)

### Admin Order Management

- `GET /api/admin/orders` - List all orders (admin)
- `GET /api/admin/orders/:id` - Get order details (admin)
- `PATCH /api/admin/orders/:id/status` - Update order status (admin)

### Payment

- `POST /api/payment/create-order` - Create Razorpay order (protected)
- `POST /api/payment/verify` - Verify payment (protected)
- `POST /api/payment/webhooks/razorpay` - Razorpay webhook (public)

## Testing Examples

### 1. Admin Login

```bash
curl -X POST http://localhost:3002/api/auth/admin/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'
```

Response:
```json
{
  "success": true,
  "data": {
    "admin": { ... },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 2. Customer Registration

```bash
curl -X POST http://localhost:3002/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "customer@example.com",
    "password": "password123",
    "name": "John Doe",
    "phone": "+1234567890"
  }'
```

### 3. Create Order (with auth token)

```bash
curl -X POST http://localhost:3002/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "items": [
      {
        "productId": "product-id",
        "variantId": "variant-id",
        "quantity": 2,
        "customDesignUrl": "https://example.com/design.jpg",
        "customText": "Hello World"
      }
    ],
    "addressId": "address-id",
    "paymentMethod": "ONLINE"
  }'
```

### 4. Create Razorpay Order

```bash
curl -X POST http://localhost:3002/api/payment/create-order \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "orderId": "order-id",
    "amount": 1299.00
  }'
```

### 5. Verify Payment

```bash
curl -X POST http://localhost:3002/api/payment/verify \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "razorpay_order_id": "order_xxx",
    "razorpay_payment_id": "pay_xxx",
    "razorpay_signature": "signature_xxx"
  }'
```

## Database Schema

Key models:
- `User` - Customer accounts
- `Admin` - Admin users
- `Category` - Product categories
- `Product` - Products with variants
- `Order` - Customer orders
- `OrderItem` - Order line items
- `Payment` - Payment records
- `Address` - Shipping addresses

See `prisma/schema.prisma` for full schema.

## Scripts

- `bun run dev` - Start development server with watch mode
- `bun run build` - Build for production
- `bun run start` - Start production server
- `bun run db:push` - Push Prisma schema to database
- `bun run db:migrate` - Create and run migrations
- `bun run db:generate` - Generate Prisma Client
- `bun run db:seed` - Seed database with sample data
- `bun run db:studio` - Open Prisma Studio

## Notes

- Supabase auth is optional. If not configured, the API falls back to local JWT authentication.
- File uploads are stored locally in `uploads/designs/`. In production, configure S3 or similar.
- Razorpay webhook secret must be configured for webhook verification.
- Admin password is hashed using bcrypt.

## Default Admin Credentials (from seed)

- Username: `admin`
- Password: `admin123`
- Email: `admin@example.com`

**⚠️ Change these in production!**
