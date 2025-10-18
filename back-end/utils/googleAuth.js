import { OAuth2Client } from "google-auth-library";

// Initialize Google OAuth2 Client
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * Verify Google ID Token
 * @param {string} token - Google ID token from frontend
 * @returns {Promise<Object>} - User payload from Google
 */
export const verifyGoogleToken = async (token) => {
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    return {
      valid: true,
      payload: {
        googleId: payload.sub,
        email: payload.email,
        name: payload.name || null, // May be null if profile scope not requested
        avatar: payload.picture || null, // May be null if profile scope not requested
        emailVerified: payload.email_verified,
      },
    };
  } catch (error) {
    return {
      valid: false,
      error: error.message,
    };
  }
};

/**
 * Validate Google Client ID is configured
 * @returns {boolean}
 */
export const isGoogleAuthConfigured = () => {
  return !!process.env.GOOGLE_CLIENT_ID;
};
