# Pet Save Web - Project Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [Architecture](#architecture)
5. [Key Features](#key-features)
6. [API Integration](#api-integration)
7. [Getting Started](#getting-started)
8. [Development Guidelines](#development-guidelines)

---

## Project Overview

### What is Pet Save?

**Pet Save** is a comprehensive e-commerce marketplace platform specifically designed for pet food and supplies. It connects pet owners with pet shops and businesses through an online marketplace.

### Application Type
**Two-sided marketplace platform** serving three user types:
- 🐕 **Clients (Buyers)**: Pet owners purchasing pet food, treats, toys, and supplies
- 🏪 **Sellers (Business Members)**: Pet shops and businesses selling pet products
- 👨‍💼 **Administrators**: Platform managers overseeing operations

### Main Purpose
Pet Save provides an online platform for buying and selling pet products with features including:
- Browse products by animal category
- Location-based shopping with distance tracking
- Real-time inventory management
- Integrated payment processing (TossPayments)
- Order tracking and management
- Review and rating system
- Business registration and approval workflow

### Target Users

| User Type | Description | Primary Features |
|-----------|-------------|------------------|
| **General Members** | Pet owners | Product browsing, shopping cart, order management, reviews |
| **Business Members** | Pet shop owners | Product registration, inventory management, order fulfillment |
| **Administrators** | Platform managers | User management, order oversight, business approvals, customer service |

---

## Technology Stack

### Core Framework
- **Next.js 15.3.2** - React meta-framework with App Router
- **React 19.0.0** - UI library
- **TypeScript 5.x** - Type safety and developer experience

### State Management
- **Redux Toolkit 2.9.1** - Global state management
- **React Redux 9.2.0** - React bindings for Redux
- **Context API** - Authentication and user context

### Styling & UI
- **CSS Modules** - Component-scoped styling
- **React Icons 5.5.0** - Icon library
- **Framer Motion 12.23.12** - Animations
- **react-hot-toast 2.6.0** - Toast notifications
- **yet-another-react-lightbox 3.25.0** - Image gallery

### API & Data
- **Axios 1.11.0** - HTTP client
- **Custom API Client** - Request/response interceptors, token refresh, error handling

### Payment & Integration
- **@tosspayments/payment-sdk 1.9.1** - Payment processing
- **Kakao API** - Address search
- **@yudiel/react-qr-scanner 2.3.1** - QR code scanning

### Development Tools
- **ESLint** - Code quality
- **Turbopack** - Fast development builds
- **TypeScript Strict Mode** - Type safety

---

## Project Structure

```
pet_save_web/
├── src/
│   └── app/
│       ├── admin/                    # Admin panel application
│       │   ├── (auth)/              # Admin authentication
│       │   ├── pages/               # Admin feature pages
│       │   └── offline/             # Offline page handling
│       ├── client/                   # Client-facing application
│       │   ├── (auth)/              # Client authentication
│       │   ├── pages/               # Client feature pages
│       │   ├── seller/              # Seller-specific pages
│       │   └── offline/             # Offline handling
│       ├── api/                      # API integration layer
│       │   ├── services/            # API service classes
│       │   │   ├── admin/          # Admin services
│       │   │   ├── client/         # Client services
│       │   │   └── contact-product/ # Contact services
│       │   ├── types/               # TypeScript definitions
│       │   ├── config/              # API configuration
│       │   ├── interceptors/        # Request/response interceptors
│       │   └── utils/               # API utilities
│       ├── components/               # Reusable UI components
│       │   ├── admin/               # Admin components
│       │   ├── auth/                # Auth components
│       │   ├── pages/               # Page-level components
│       │   ├── sections/            # Section components
│       │   ├── seller-components/   # Seller components
│       │   ├── ui/                  # Generic UI components
│       │   ├── hooks/               # Custom React hooks
│       │   └── providers/           # Context providers
│       ├── context/                  # React Context
│       │   ├── authContext.tsx      # Authentication state
│       │   └── userContext.tsx      # User profile state
│       ├── redux/                    # Redux store
│       │   ├── store.ts             # Store configuration
│       │   ├── hooks.ts             # Typed hooks
│       │   └── slices/              # Redux slices
│       └── utils/                    # Utility functions
├── public/                           # Static assets
├── next.config.ts                    # Next.js configuration
├── tsconfig.json                     # TypeScript configuration
├── package.json                      # Dependencies
└── .env.local                        # Environment variables
```

### Organization Pattern

The project uses a **hybrid organization approach**:

1. **Layer-based**: Separation of concerns (API, components, context, redux)
2. **Feature-based**: Pages organized by feature (my-page, shopping-cart, products)
3. **Role-based**: Separate directories for admin, client, and seller

---

## Architecture

### API Client Architecture

#### Configuration
**Base URL** (dynamic based on environment):
- **Development**: Uses Next.js API proxy
- **Production**: Direct backend connection `http://211.107.13.167:11309/api/pet-save`

#### API Client Features

```typescript
// File: src/app/api/apiClient.ts
```

**Key Capabilities:**
1. **Request Deduplication**: Prevents duplicate requests within 1-second window
2. **Automatic Token Refresh**: Backend provides new tokens in response headers
3. **Public/Protected Classification**: Differentiates endpoint access levels
4. **Request/Response Logging**: Debugging support
5. **Error Handling**: User-friendly error messages
6. **FormData Support**: File upload handling

#### Service Layer Pattern

```typescript
// Example Service Pattern
export class ProductService {
  private static readonly BASE_URL = '/products';

  static async getProductDetails(id: string): Promise<ApiResponse<Product>> {
    return await apiClient.get<Product>(`${this.BASE_URL}/${id}/details`);
  }

  static async createProduct(payload: CreateProductRequest): Promise<ApiResponse<Product>> {
    return await apiClient.post<Product>(this.BASE_URL, payload);
  }
}
```

**Service Organization:**

| Service Category | Location | Purpose |
|-----------------|----------|---------|
| **Client Services** | `api/services/client/` | User-facing operations |
| **Admin Services** | `api/services/admin/` | Admin operations |
| **Contact Services** | `api/services/contact-product/` | Product inquiries |

### Component Architecture

#### Component Hierarchy

```
Pages (Route Handlers)
  └── Page Components (Business Logic)
      └── Section Components (Feature Areas)
          └── UI Components (Generic Reusables)
```

#### Component Types

| Type | Location | Purpose | Example |
|------|----------|---------|---------|
| **Pages** | `app/client/pages/`, `app/admin/pages/` | Route handlers | `homepage/page.tsx` |
| **Page Components** | `components/pages/` | Business logic containers | `ShoppingCartPage` |
| **Sections** | `components/sections/` | Feature-rich areas | `TopBar`, `ProductGrid` |
| **UI Components** | `components/ui/` | Generic reusables | `Loading`, `Modal`, `Button` |

### State Management

#### Redux Store Structure

```typescript
// File: src/app/redux/store.ts

Store {
  product: ProductState,      // Product caching
  order: OrderState,          // Order management
  points: PointsState,        // Points/rewards
  review: ReviewState,        // Review management
  user: UserState,            // User data caching
  loading: LoadingState       // UI loading states
}
```

#### Context API

```typescript
// Authentication Context
interface AuthContextType {
  isAuthenticated: boolean;
  login: (credentials) => Promise<void>;
  logout: () => void;
  token: string | null;
}

// User Context
interface UserContextType {
  user: User | null;
  role: 'client' | 'seller';
  businessApprovalStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | null;
  refreshUserData: () => Promise<void>;
}
```

### Type System

**API Types** organized by domain in `src/app/api/types/`:

```typescript
// Example: Product Types
export interface Product {
  productId?: string;
  productName?: string;
  thumbnail?: string;
  salePrice?: number;
  discountedPrice?: number;
  expiryDate?: string;
  store?: {
    storeId?: number | string;
    name?: string;
    address?: string;
  };
}

export interface ProductSearchParams {
  keyword?: string;
  categoryName?: string;
  registrationStatus?: 'ONSALE' | 'SOLD_OUT';
  page?: number;
  size?: number;
  sortBy?: 'createdAt' | 'salePrice' | 'discountedPrice' | 'expiryDate';
  direction?: 'asc' | 'desc';
}
```

---

## Key Features

### 🛒 Client Features

#### 1. Product Discovery & Shopping
- **Homepage** - Category-based product browsing
- **Product Search** - Keyword, category, status, price, expiry filters
- **Product Details** - Images, pricing, store information
- **Location-Based Filtering** - Find products near you
- **Shopping Cart** - Quantity management, cart totals

#### 2. Order Management
- **Delivery Address** - Address book management
- **Payment Processing** - TossPayments integration
- **Order Confirmation** - Real-time order tracking
- **Return/Exchange** - Request returns and exchanges

#### 3. User Profile (My Page)
- Account information management
- Order history with tracking
- Review management (write, view, edit)
- Points system with history
- Favorite/saved products
- Delivery address book
- Notification settings
- Customer inquiry history
- Referral code system

#### 4. Customer Service
- Contact/inquiry system with image upload
- Notice board viewing
- FAQ access

#### 5. Authentication
- Login/signup with email or phone
- Find ID by email/phone
- Password reset flow
- Email/phone verification

### 🏪 Seller Features

#### 1. Business Registration
- Business member signup process
- Business approval status tracking (PENDING → APPROVED)
- Business document upload

#### 2. Product Management
- Product registration form with images
- Product list view with filters
- Inventory management
- Product status changes (on sale, sold out)

#### 3. Store Management
- Store information management
- Operating hours configuration
- Profile customization

#### 4. Customer Relations
- Customer inquiry responses
- Return/exchange request handling

#### 5. Referral System
- Referral code generation and management

### 👨‍💼 Admin Features

#### 1. Product Management
- View all products with filters
- Edit product details
- Delete products
- Search by status/keyword

#### 2. Order & Delivery Management
- Order pipeline tracking:
  - Waiting payment
  - Payment completed
  - Product preparation
  - Delivery/pickup in progress
  - Receipt complete

#### 3. Member Management
- General member management
- Business member management
- Business registration approval workflow

#### 4. Refund/Exchange Processing
- Cancellation requests
- Return requests
- Exchange requests

#### 5. Customer Service Center
- Announcement/notice management
- Customer inquiry handling

#### 6. Category Management
- Animal category CRUD operations

#### 7. Financial Management
- Tax invoice list
- Referral payment management

---

## API Integration

### Authentication Flow

#### 1. Initial Login
```typescript
// User credentials sent to /auth/login
const { data, error } = await AuthService.login({ username, password });

// Backend returns accessToken
// Token stored in localStorage.authToken
// User info stored in localStorage.user
```

#### 2. Authenticated Requests
```typescript
// Request interceptor adds Authorization header
Authorization: Bearer <token>

// Public endpoints explicitly exclude authorization
// Protected endpoints require valid token
```

#### 3. Token Refresh
```typescript
// Backend sends new token in response header
new-access-token: <newToken>

// Response interceptor automatically updates localStorage.authToken
// Custom event 'tokenUpdated' dispatched for app-wide updates
```

#### 4. Session Expiry
```typescript
// 401/403 errors trigger redirect to login
// Exceptions: public pages (homepage, product browsing)
// Corrupted token data cleaned up on app start
```

### API Response Structure

```typescript
interface ApiResponse<T> {
  data: T | null;
  error?: string;
}

// Usage example
const { data, error } = await ProductService.getProduct(id);

if (error) {
  toast.error(error); // Show user-friendly error
  console.error('API Error:', error);
} else {
  // Use data
  setProduct(data);
}
```

### Error Handling Strategy

#### 1. API Client Level
- Network errors preserved and propagated
- Auth errors (401/403) trigger redirects
- Response errors formatted for user display

#### 2. Service Level
```typescript
try {
  const response = await apiClient.post(url, data);
  if (response.error) {
    console.error('Service error:', response.error);
  }
  return response;
} catch (error) {
  return { data: null, error: error.message };
}
```

#### 3. Component Level
```typescript
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);

const handleAction = async () => {
  setLoading(true);
  setError(null);

  const { data, error } = await Service.action();

  if (error) {
    setError(error);
    toast.error(error);
  } else {
    toast.success('Success!');
  }

  setLoading(false);
};
```

### Major API Endpoints

| Category | Base Path | Description |
|----------|-----------|-------------|
| **Auth** | `/auth/*` | Login, signup, password recovery |
| **Verification** | `/verification/*` | Email/phone verification |
| **Products** | `/products/*` | Product CRUD, search, status |
| **Categories** | `/categories/*` | Category management |
| **Cart** | `/carts/*` | Shopping cart operations |
| **Orders** | `/orders/*` | Order management |
| **Stores** | `/stores/*` | Store/shop operations |
| **Members** | `/members/*` | User profile management |
| **Business** | `/business/*` | Business registration |
| **Address** | `/address/*` | Address search (Kakao API) |
| **Files** | `/files/*` | File uploads |
| **Reviews** | `/reviews/*` | Product reviews |
| **Inquiries** | `/inquiries/*` | Customer inquiries |
| **Notices** | `/notices/*` | Announcements |
| **Referrals** | `/referrals/*` | Referral codes |

### Special Integrations

#### 1. Kakao Address API
```typescript
// Server-side proxy to avoid CORS
GET/POST /api/pet-save/address/search

// Used in:
// - Registration forms
// - Delivery address management
```

#### 2. TossPayments
```typescript
// Environment variable
NEXT_PUBLIC_TOSS_CLIENT_KEY=your_key_here

// Integration
import { loadTossPayments } from '@tosspayments/payment-sdk';

// Payment flow in order placement
```

#### 3. QR Code Scanning
```typescript
// Used for order pickup verification
import { QrScanner } from '@yudiel/react-qr-scanner';
```

---

## Getting Started

### Prerequisites
- Node.js 18+ (recommended)
- npm or yarn
- Git

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd pet_save_web

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your keys
```

### Environment Variables

Create a `.env.local` file:

```env
# TossPayments
NEXT_PUBLIC_TOSS_CLIENT_KEY=your_toss_client_key

# Kakao API
NEXT_PUBLIC_KAKAO_API_KEY=your_kakao_api_key

# Backend API (optional override)
NEXT_PUBLIC_API_URL=http://211.107.13.167:11309/api/pet-save
```

### Running the Application

```bash
# Development mode (with Turbopack)
npm run dev
# Runs on http://localhost:11311

# Production build
npm run build
npm start
```

### Project Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with Turbopack |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |

---

## Development Guidelines

### Code Organization Best Practices

#### 1. Component Structure
```typescript
// Component file structure
import { useState, useEffect } from 'react';
import styles from './Component.module.css';
import { ServiceClass } from '@/app/api/services/...';

interface ComponentProps {
  // Props type definition
}

export const Component = ({ ...props }: ComponentProps) => {
  // State
  const [data, setData] = useState(null);

  // Effects
  useEffect(() => {
    // Side effects
  }, [dependencies]);

  // Event handlers
  const handleEvent = () => {
    // Logic
  };

  // Render
  return (
    <div className={styles.container}>
      {/* JSX */}
    </div>
  );
};
```

#### 2. Service Layer Pattern
```typescript
// Service class structure
export class FeatureService {
  private static readonly BASE_URL = '/endpoint';

  static async getItem(id: string): Promise<ApiResponse<ItemType>> {
    return await apiClient.get<ItemType>(`${this.BASE_URL}/${id}`);
  }

  static async createItem(payload: CreateItemRequest): Promise<ApiResponse<ItemType>> {
    return await apiClient.post<ItemType>(this.BASE_URL, payload);
  }
}
```

#### 3. Type Definitions
```typescript
// Define types in src/app/api/types/
export interface Entity {
  id: string;
  name: string;
  // Other fields
}

export interface EntitySearchParams {
  keyword?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  direction?: 'asc' | 'desc';
}
```

### Styling Guidelines

#### CSS Modules
```css
/* ComponentName.module.css */
.container {
  display: flex;
  flex-direction: column;
}

.item {
  padding: 1rem;
}

/* Use BEM-like naming for variants */
.item--active {
  background-color: #66bfa7;
}
```

```typescript
// Component usage
<div className={styles.container}>
  <div className={`${styles.item} ${isActive ? styles['item--active'] : ''}`}>
    Content
  </div>
</div>
```

### State Management Guidelines

#### When to Use Redux vs Context

**Use Redux for:**
- Global application state
- Complex state logic
- State that needs persistence
- Data caching

**Use Context for:**
- Authentication state
- User profile
- Theme/locale
- Simple shared state

#### Redux Slice Pattern
```typescript
// src/app/redux/slices/featureSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface FeatureState {
  items: Item[];
  loading: boolean;
}

const initialState: FeatureState = {
  items: [],
  loading: false,
};

export const featureSlice = createSlice({
  name: 'feature',
  initialState,
  reducers: {
    setItems: (state, action: PayloadAction<Item[]>) => {
      state.items = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const { setItems, setLoading } = featureSlice.actions;
export default featureSlice.reducer;
```

### Error Handling Best Practices

#### 1. Always Handle Errors
```typescript
const { data, error } = await Service.method();

if (error) {
  // Show user-friendly message
  toast.error(error);
  // Log for debugging
  console.error('Operation failed:', error);
  return;
}

// Proceed with data
processData(data);
```

#### 2. Loading States
```typescript
const [loading, setLoading] = useState(false);

const handleAction = async () => {
  setLoading(true);
  try {
    await performAction();
  } catch (error) {
    handleError(error);
  } finally {
    setLoading(false);
  }
};
```

#### 3. User Feedback
```typescript
// Use toast notifications
import toast from 'react-hot-toast';

toast.success('Operation successful!');
toast.error('Something went wrong');
toast.loading('Processing...');
```

### Testing Recommendations

#### Component Testing
- Test user interactions
- Test conditional rendering
- Test API integration points
- Mock API calls

#### Service Testing
- Test request/response handling
- Test error scenarios
- Test authentication flows

### Git Workflow

#### Branch Naming
```
feature/feature-name
bugfix/bug-description
hotfix/critical-fix
```

#### Commit Messages
```
feat: Add product filtering by category
fix: Resolve authentication token refresh issue
refactor: Update API client error handling
docs: Update README with setup instructions
```

---

## Additional Resources

### Configuration Files

| File | Purpose |
|------|---------|
| `next.config.ts` | Next.js configuration, API proxy, image optimization |
| `tsconfig.json` | TypeScript compiler options |
| `package.json` | Dependencies and scripts |
| `.env.local` | Environment variables (not committed) |

### Important Directories

| Directory | Purpose |
|-----------|---------|
| `src/app/api/services/` | API service classes |
| `src/app/api/types/` | TypeScript type definitions |
| `src/app/components/` | Reusable components |
| `src/app/redux/slices/` | Redux state slices |
| `src/app/context/` | React Context providers |

### External Documentation

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Redux Toolkit Documentation](https://redux-toolkit.js.org)
- [TossPayments Documentation](https://docs.tosspayments.com)
- [Kakao API Documentation](https://developers.kakao.com)

---

## Support & Maintenance

### Common Issues

#### Issue: Port Already in Use
```bash
# Kill process on port 11311
# Windows
netstat -ano | findstr :11311
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:11311 | xargs kill -9
```

#### Issue: Token Expired
```typescript
// Tokens are automatically refreshed
// Manual refresh not needed
// Clear localStorage if corrupted:
localStorage.removeItem('authToken');
localStorage.removeItem('user');
```

#### Issue: API Connection Refused
- Check backend server is running: `http://211.107.13.167:11309`
- Verify network connectivity
- Check Next.js proxy configuration in `next.config.ts`

### Performance Optimization

1. **Image Optimization**: Use Next.js `<Image>` component
2. **Code Splitting**: Leverage Next.js automatic code splitting
3. **API Caching**: Use Redux for caching frequently accessed data
4. **Lazy Loading**: Use `React.lazy()` for large components

---

## Changelog

### Version History

**Current Version**: 1.0.0

#### Recent Updates
- ✅ Multi-image upload support for product inquiries
- ✅ Improved image preview UI with compact square thumbnails
- ✅ Enhanced file upload experience with better visual feedback
- ✅ Fixed image preview display issues

---

## License

[Specify your license here]

---

## Contact & Support

For questions, issues, or contributions:
- **Project Repository**: [Repository URL]
- **Issue Tracker**: [Issues URL]
- **Documentation**: This file

---

**Last Updated**: 2025-01-17
**Document Version**: 1.0.0
