# ShopSphere 🛒

A complete, production-ready e-commerce web application built with the MERN stack (MongoDB, Express, React, Node.js). Includes product catalog, shopping cart, checkout, order tracking, reviews & ratings, wishlist, role-based admin panel, and sales analytics.

## ✨ Features

### Customer
- Browse products with search, category/price filters, sorting & pagination
- Product detail pages with image gallery, ratings, and reviews
- Add/remove products to cart and wishlist (persisted server-side)
- Multi-step checkout with shipping address and payment method selection
- Order history with detailed tracking timeline (processing → shipped → delivered)
- Profile management: edit info, multiple addresses, avatar upload, password change
- Dark mode, fully responsive (mobile-first)

### Admin
- Dashboard: revenue chart (7-day), order status breakdown, top-selling products, recent orders
- Product management: create/edit/delete products with multi-image upload, categories, stock, discounts, featured flag
- Order management: view all orders, update order status (auto-restocks on cancellation, auto-marks COD as paid on delivery)
- User management: view all users, change roles (admin/user), delete users

### Platform
- JWT authentication with bcrypt password hashing
- Role-based access control (admin/user) enforced on backend routes
- Centralized error handling & request validation (express-validator)
- File uploads via Multer (product images, avatars)
- Email notifications on order placement & status changes (logs to console if SMTP not configured)

## 🛠 Tech Stack

**Frontend:** React (Vite), React Router, Redux Toolkit, Tailwind CSS, Axios, React Hook Form, Framer Motion, Recharts, React Hot Toast

**Backend:** Node.js, Express.js, MongoDB, Mongoose, JWT, bcryptjs, Multer, express-validator

## 📁 Project Structure

```
ecommerce-app/
├── frontend/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/      # Reusable UI (Navbar, ProductCard, Modal, etc.)
│   │   ├── pages/             # Route pages (Home, Products, Cart, admin/*)
│   │   ├── layouts/             # MainLayout, AuthLayout, AdminLayout
│   │   ├── routes/                # Route guards (Protected, Admin)
│   │   ├── hooks/                   # useDebounce, useRedux
│   │   ├── context/                   # Redux slices & store
│   │   ├── services/                    # Axios API services
│   │   ├── utils/                         # Helper functions
│   │   └── App.jsx
│   └── package.json
│
├── backend/
│   ├── config/        # DB connection
│   ├── controllers/    # Route logic (auth, product, cart, order, review, wishlist)
│   ├── middleware/       # auth, error, upload, async handler
│   ├── models/             # User, Product, Cart, Order, Review, Wishlist
│   ├── routes/                # Express routers
│   ├── services/                # Email notifications
│   ├── validations/               # express-validator rules
│   ├── uploads/                     # Uploaded images (served statically)
│   └── server.js
│
└── README.md
```

## ⚙️ Setup Instructions

### Prerequisites
- Node.js v18+
- MongoDB Atlas account (or local MongoDB)

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
npm run dev
```

### 2. Frontend (new terminal)

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

App runs at `http://localhost:5173`, API at `http://localhost:5000`.

### 3. Create an Admin User

By default, all registrations create a `user` role account. To create an admin:
1. Register a normal account through the UI
2. Connect to your MongoDB database (e.g. via MongoDB Atlas or `mongosh`)
3. Find the user document in the `users` collection and change `role` to `"admin"`
4. Log out and log back in — you'll now see the **Admin Dashboard** link in the navbar

## 🔑 Environment Variables

**backend/.env**
```
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/shopsphere
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5173
MAX_FILE_UPLOAD=2000000
FILE_UPLOAD_PATH=./uploads

# Optional - for real email notifications (otherwise logged to console)
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USER=your@email.com
EMAIL_PASS=your_password
EMAIL_FROM=noreply@shopsphere.com
```

**frontend/.env**
```
VITE_API_URL=http://localhost:5000/api
VITE_UPLOADS_URL=http://localhost:5000
```

## 🔌 API Endpoints

### Auth
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/auth/register` | Register a new user | Public |
| POST | `/api/auth/login` | Login user | Public |
| GET | `/api/auth/profile` | Get current user profile | Private |
| PUT | `/api/auth/profile` | Update profile (name, phone, addresses, password, avatar) | Private |
| GET | `/api/auth/users` | List all users (search, pagination) | Admin |
| PUT | `/api/auth/users/:id/role` | Update a user's role | Admin |
| DELETE | `/api/auth/users/:id` | Delete a user | Admin |

### Products
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/products` | List products (search, filter, sort, paginate) | Public |
| GET | `/api/products/categories` | Get distinct categories | Public |
| GET | `/api/products/:id` | Get product detail + reviews | Public |
| POST | `/api/products` | Create product (multipart, up to 5 images) | Admin |
| PUT | `/api/products/:id` | Update product | Admin |
| DELETE | `/api/products/:id/images/:imageIndex` | Remove a single image | Admin |
| DELETE | `/api/products/:id` | Delete product | Admin |

### Reviews (nested under products)
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/products/:id/reviews` | Get reviews for a product | Public |
| POST | `/api/products/:id/reviews` | Create a review | Private |
| PUT | `/api/products/:id/reviews/:reviewId` | Update own review | Private |
| DELETE | `/api/products/:id/reviews/:reviewId` | Delete review (owner or admin) | Private |

### Cart
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/cart` | Get current user's cart | Private |
| POST | `/api/cart/add` | Add item to cart | Private |
| PUT | `/api/cart/update` | Update item quantity | Private |
| DELETE | `/api/cart/remove/:productId` | Remove item from cart | Private |
| DELETE | `/api/cart/clear` | Clear cart | Private |

### Orders
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/orders` | Place an order (checkout) | Private |
| GET | `/api/orders/my-orders` | Get current user's orders | Private |
| GET | `/api/orders/:id` | Get order detail | Private (owner/admin) |
| GET | `/api/orders` | Get all orders | Admin |
| PUT | `/api/orders/:id/status` | Update order status | Admin |
| GET | `/api/orders/stats/dashboard` | Sales analytics | Admin |

### Wishlist
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/wishlist` | Get wishlist | Private |
| POST | `/api/wishlist/:productId` | Add to wishlist | Private |
| DELETE | `/api/wishlist/:productId` | Remove from wishlist | Private |

## 🚀 Deployment

### Backend → Render
1. New Web Service → connect repo → root directory `backend`
2. Build command: `npm install` · Start command: `npm start`
3. Add all environment variables from `.env.example`

### Frontend → Vercel
1. Import repo → root directory `frontend`
2. Framework preset: Vite
3. Add `VITE_API_URL` and `VITE_UPLOADS_URL` pointing to your Render backend URL
4. `vercel.json` is included for SPA routing rewrites

> **Note on file uploads in production:** Render's free tier filesystem is ephemeral — uploaded images will be lost on redeploy/restart. For production use, integrate a cloud storage provider (e.g. Cloudinary, AWS S3) in `uploadMiddleware.js` instead of local disk storage.

## 🎨 Design System

| Element | Value |
|---------|-------|
| Primary | `#16A34A` (green) |
| Accent | `#F59E0B` (amber) |
| Background (light) | `#F8FAFC` |
| Background (dark) | `#0F172A` |

## 📄 License

MIT — free to use for personal portfolios and commercial projects.
