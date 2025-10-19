# Authentication & Authorization Setup Guide

## Environment Variables

Add these environment variables to your `.env` file:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb+srv://your-username:your-password@cluster.mongodb.net/wooden-toys?retryWrites=true&w=majority

# JWT Configuration
# Access Token Secret - Generate a strong random secret
# You can use: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_ACCESS_SECRET=your-super-secret-access-token-key-change-this-in-production

# Refresh Token Secret (optional - currently using crypto.randomBytes)
JWT_REFRESH_SECRET=your-super-secret-refresh-token-key-change-this-in-production

# Token Expiration
JWT_ACCESS_EXPIRE=15m
JWT_REFRESH_EXPIRE_DAYS=7

# CORS Configuration
CORS_ORIGIN=http://localhost:5173

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

## Generating Secure JWT Secrets

Run this command to generate a secure secret:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Use the output for `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET`.

## API Endpoints

### Authentication Endpoints

#### Register
- **POST** `/api/auth/register`
- Body: `{ name, email, password, role? }`
- Returns: User data + access token + refresh token

#### Login
- **POST** `/api/auth/login`
- Body: `{ email, password }`
- Returns: User data + access token + refresh token

#### Google OAuth Login
- **POST** `/api/auth/google`
- Body: `{ token }` (Google ID token from frontend)
- Returns: User data + access token + refresh token
- Note: Creates account automatically if user doesn't exist

#### Refresh Token
- **POST** `/api/auth/refresh-token`
- Body: `{ refreshToken }`
- Returns: New access token + new refresh token

#### Logout
- **POST** `/api/auth/logout`
- Body: `{ refreshToken }`
- Returns: Success message

#### Logout All Devices
- **POST** `/api/auth/logout-all`
- Headers: `Authorization: Bearer <access-token>`
- Returns: Success message

#### Get Current User
- **GET** `/api/auth/me`
- Headers: `Authorization: Bearer <access-token>`
- Returns: Current user profile

#### Update Profile
- **PUT** `/api/auth/me`
- Headers: `Authorization: Bearer <access-token>`
- Body: `{ name?, email?, phoneNumber?, address? }`
- Returns: Updated user profile
- Address format: `{ street, ward, district, city, country, postalCode }`

#### Change Password
- **PUT** `/api/auth/change-password`
- Headers: `Authorization: Bearer <access-token>`
- Body: `{ currentPassword, newPassword }`
- Returns: Success message

#### Update User Status (Admin Only)
- **PUT** `/api/auth/users/:userId/status`
- Headers: `Authorization: Bearer <admin-access-token>`
- Body: `{ isActive: true/false }`
- Returns: Updated user status
- Note: Admin cannot deactivate their own account. Deactivating a user revokes all their tokens.

#### Forgot Password
- **POST** `/api/auth/forgot-password`
- Body: `{ email }`
- Returns: Reset token (in production, send via email)
- Note: Token expires in 10 minutes

#### Reset Password
- **POST** `/api/auth/reset-password/:resetToken`
- Body: `{ newPassword }`
- Returns: Success message
- Note: All refresh tokens are revoked after reset

## Token Strategy

### Access Token
- **Type**: JWT (JSON Web Token)
- **Lifetime**: 15 minutes (configurable)
- **Storage**: Memory/State (NOT localStorage for security)
- **Usage**: Sent in Authorization header for protected routes

### Refresh Token
- **Type**: Random crypto bytes (64 bytes hex)
- **Lifetime**: 7 days (configurable)
- **Storage**: Database (with revocation support)
- **Usage**: Used to obtain new access tokens

## Security Features

1. **Password Hashing**: bcrypt with salt rounds
2. **JWT Verification**: Token signature validation
3. **Token Revocation**: Refresh tokens can be revoked
4. **Role-Based Access**: User and Admin roles
5. **IP Tracking**: Tracks IP for token creation/revocation
6. **Account Status**: Can deactivate user accounts
7. **Automatic Cleanup**: Expired tokens auto-deleted

## Protecting Routes

### Protect Middleware (Authentication Required)

```javascript
import { protect } from "./middleware/authMiddleware.js";

router.get("/protected-route", protect, controller);
```

### Authorize Middleware (Role-Based)

```javascript
import { protect, authorize } from "./middleware/authMiddleware.js";

// Only admin can access
router.delete("/admin-only", protect, authorize("admin"), controller);

// Multiple roles
router.get("/staff", protect, authorize("admin", "moderator"), controller);
```

### Optional Auth Middleware

```javascript
import { optionalAuth } from "./middleware/authMiddleware.js";

// User data available if logged in, but not required
router.get("/public", optionalAuth, controller);
```

## Example: Protect Product Routes

Update `back-end/routes/productRoutes.js`:

```javascript
import { protect, authorize } from "../middleware/authMiddleware.js";

// Public routes
router.get("/", getProducts);
router.get("/:id", getProductById);

// Protected routes (admin only)
router.post("/", protect, authorize("admin"), createProduct);
router.put("/:id", protect, authorize("admin"), updateProduct);
router.delete("/:id", protect, authorize("admin"), deleteProduct);
```

## Client-Side Implementation

### Login Flow

```javascript
// 1. Login
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});

const { data } = await response.json();
// Store tokens securely
// accessToken -> memory/state (never localStorage)
// refreshToken -> httpOnly cookie or secure storage

// 2. Make authenticated requests
const result = await fetch('/api/protected', {
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
});

// 3. Handle token expiration
if (response.status === 401) {
  // Refresh access token
  const refreshResponse = await fetch('/api/auth/refresh-token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken })
  });
  
  const { data } = await refreshResponse.json();
  // Update tokens and retry request
}
```

## Google OAuth Setup

### 1. Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth client ID"
5. Select "Web application"
6. Add authorized JavaScript origins:
   - `http://localhost:5173` (for development)
   - Your production URL
7. Add authorized redirect URIs (if needed)
8. Copy the **Client ID**
9. Add to `.env` file: `GOOGLE_CLIENT_ID=your-client-id-here`

### 2. Frontend Implementation (React Example)

#### Install Google Sign-In Library

```bash
npm install @react-oauth/google
```

#### Setup Google OAuth Provider

```jsx
import { GoogleOAuthProvider } from '@react-oauth/google';

function App() {
  return (
    <GoogleOAuthProvider clientId="your-google-client-id">
      {/* Your app components */}
    </GoogleOAuthProvider>
  );
}
```

#### Add Google Login Button

```jsx
import { GoogleLogin } from '@react-oauth/google';

function LoginPage() {
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: credentialResponse.credential,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        // Store tokens
        localStorage.setItem('refreshToken', data.data.refreshToken);
        // Store accessToken in memory/state (not localStorage)
        
        // Redirect or update UI
        console.log('Login successful:', data.data.user);
      }
    } catch (error) {
      console.error('Google login error:', error);
    }
  };

  const handleGoogleError = () => {
    console.error('Google login failed');
  };

  return (
    <div>
      <GoogleLogin
        onSuccess={handleGoogleSuccess}
        onError={handleGoogleError}
      />
    </div>
  );
}
```

### 3. How It Works

1. **Frontend**: User clicks "Sign in with Google" button
2. **Google**: Opens popup/redirect for user to authenticate
3. **Google**: Returns ID token to frontend
4. **Frontend**: Sends ID token to backend `/api/auth/google`
5. **Backend**: Verifies token with Google
6. **Backend**: Creates/updates user in database
7. **Backend**: Generates JWT tokens (access + refresh)
8. **Backend**: Returns JWT tokens to frontend
9. **Frontend**: Stores tokens and redirects user

### 4. Account Linking

The system automatically handles:
- **New User**: Creates account with Google info
- **Existing User (same email)**: Links Google account to existing account
- **Google User**: Updates info if needed

## Testing with Swagger

1. Start server: `npm run dev`
2. Open Swagger UI: `http://localhost:5000/api-docs`
3. Register/Login to get tokens (or use Google OAuth)
4. Click "Authorize" button (top right)
5. Enter: `Bearer <your-access-token>`
6. Test protected endpoints

## Database Models

### User Model
- name, email, password (hashed, optional for OAuth)
- provider (local, google)
- googleId (for Google OAuth users)
- avatar (profile picture URL)
- role (user, admin)
- isActive, lastLogin
- timestamps

### RefreshToken Model
- token, user, expiresAt
- createdByIp, revokedAt, revokedByIp
- replacedByToken
- Auto-deletion of expired tokens

## Best Practices

1. **Never expose JWT secrets** in code or public repositories
2. **Use HTTPS** in production
3. **Implement rate limiting** for auth endpoints
4. **Monitor failed login attempts**
5. **Rotate secrets** periodically
6. **Use short-lived access tokens**
7. **Store refresh tokens securely**
8. **Implement logout on password change**
9. **Add email verification** (future enhancement)
10. **Add 2FA** for sensitive operations (future enhancement)

## Troubleshooting

### "Not authorized" errors
- Check if access token is expired (refresh it)
- Verify Authorization header format: `Bearer <token>`
- Ensure user account is active

### "Invalid refresh token"
- Token may be expired or revoked
- User needs to login again

### Token keeps expiring
- Access tokens expire after 15 minutes by design
- Implement automatic token refresh on client side

