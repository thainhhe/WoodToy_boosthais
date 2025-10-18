# Google OAuth Setup Guide

## Quick Setup

### 1. Get Google Client ID

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create/Select project
3. Enable "Google+ API" or "Google Identity Services"
4. Credentials → Create OAuth 2.0 Client ID
5. Application type: "Web application"
6. Authorized JavaScript origins: `http://localhost:5173`
7. Copy **Client ID**

### 2. Add to Backend .env

```env
GOOGLE_CLIENT_ID=123456789-abcdefg.apps.googleusercontent.com
```

### 3. Install Dependencies

Backend is already set up! Just install:

```bash
cd back-end
npm install
```

### 4. Test API

#### Using Swagger (http://localhost:5000/api-docs)

1. Expand "POST /api/auth/google"
2. Click "Try it out"
3. Get a Google ID token from frontend
4. Paste token in request body
5. Execute

#### Using curl

```bash
curl -X POST http://localhost:5000/api/auth/google \
  -H "Content-Type: application/json" \
  -d '{"token":"YOUR_GOOGLE_ID_TOKEN"}'
```

## Frontend Integration

### React + @react-oauth/google

#### Install Package

```bash
npm install @react-oauth/google
```

#### Wrap App with Provider

```jsx
// main.jsx or App.jsx
import { GoogleOAuthProvider } from '@react-oauth/google';

function App() {
  return (
    <GoogleOAuthProvider clientId="YOUR_GOOGLE_CLIENT_ID">
      {/* Your components */}
    </GoogleOAuthProvider>
  );
}
```

#### Add Login Button

```jsx
import { GoogleLogin } from '@react-oauth/google';

function Login() {
  const handleSuccess = async (credentialResponse) => {
    const response = await fetch('http://localhost:5000/api/auth/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: credentialResponse.credential })
    });

    const data = await response.json();
    if (data.success) {
      // Save tokens
      localStorage.setItem('refreshToken', data.data.refreshToken);
      // Store accessToken in state (not localStorage!)
      console.log('User:', data.data.user);
    }
  };

  return (
    <GoogleLogin
      onSuccess={handleSuccess}
      onError={() => console.log('Login Failed')}
    />
  );
}
```

## How It Works

```
┌─────────┐         ┌────────┐         ┌─────────┐         ┌──────────┐
│ User    │         │Frontend│         │ Backend │         │  Google  │
└────┬────┘         └───┬────┘         └────┬────┘         └────┬─────┘
     │  Click Google     │                   │                   │
     │  Login Button     │                   │                   │
     ├──────────────────>│                   │                   │
     │                   │                   │                   │
     │                   │  Open Google      │                   │
     │                   │  Auth Popup       │                   │
     │                   ├───────────────────────────────────────>│
     │                   │                   │                   │
     │  User Authenticates                   │                   │
     │  with Google      │                   │                   │
     │<──────────────────────────────────────────────────────────┤
     │                   │                   │                   │
     │                   │  Receive Google   │                   │
     │                   │  ID Token         │                   │
     │                   │<──────────────────────────────────────┤
     │                   │                   │                   │
     │                   │  POST /api/auth/google               │
     │                   │  { token: "..." } │                   │
     │                   ├──────────────────>│                   │
     │                   │                   │                   │
     │                   │                   │  Verify Token     │
     │                   │                   ├──────────────────>│
     │                   │                   │                   │
     │                   │                   │  Token Valid ✓    │
     │                   │                   │<──────────────────┤
     │                   │                   │                   │
     │                   │                   │  Create/Update    │
     │                   │                   │  User in DB       │
     │                   │                   │                   │
     │                   │                   │  Generate JWT     │
     │                   │                   │  Tokens           │
     │                   │                   │                   │
     │                   │  Return JWT       │                   │
     │                   │  Tokens + User    │                   │
     │                   │<──────────────────┤                   │
     │                   │                   │                   │
     │  Redirect to      │                   │                   │
     │  Dashboard        │                   │                   │
     │<──────────────────┤                   │                   │
     │                   │                   │                   │
```

## Features

✅ **Automatic Account Creation**: New users are registered automatically
✅ **Account Linking**: Links Google to existing email accounts
✅ **JWT Integration**: Uses same JWT tokens as regular login
✅ **Profile Picture**: Automatically saves Google avatar
✅ **Email Verification**: Only allows verified Google emails
✅ **Secure**: Token verification happens on backend

## API Response

### Success Response

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@gmail.com",
      "role": "user",
      "avatar": "https://lh3.googleusercontent.com/a/...",
      "provider": "google"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "1a2b3c4d5e6f7g8h9i0j..."
  }
}
```

### Error Response

```json
{
  "success": false,
  "message": "Invalid Google token",
  "error": "Token verification failed"
}
```

## Security Notes

1. **Never expose Google Client Secret** in frontend
2. **Always verify tokens on backend** (we do this!)
3. **Store refresh tokens securely** (httpOnly cookies or secure storage)
4. **Never store access tokens in localStorage** (use memory/state)
5. **Use HTTPS in production**

## Troubleshooting

### "Invalid Google token" Error

- Check GOOGLE_CLIENT_ID is correct in .env
- Token might be expired (Google tokens expire quickly)
- Make sure token is the ID token, not access token

### "Please verify your Google email first"

- User's Google email is not verified
- Ask user to verify email in Google account

### CORS Error

- Add frontend URL to Google Console authorized origins
- Check CORS settings in backend

### User Already Exists

- This is normal! System will link accounts automatically
- User can login with both password and Google

## Testing Without Frontend

Use this online tool: [Google OAuth Playground](https://developers.google.com/oauthplayground/)

1. Select "Google OAuth2 API v2"
2. Check "email", "profile"
3. Authorize APIs
4. Exchange authorization code for tokens
5. Copy the ID token
6. Test in Swagger or curl

## Production Checklist

- [ ] Update Google Console with production URLs
- [ ] Set GOOGLE_CLIENT_ID in production .env
- [ ] Enable HTTPS
- [ ] Update CORS_ORIGIN
- [ ] Test thoroughly before launch

## Need Help?

Check the full documentation in `AUTH_SETUP.md` or contact the team!

