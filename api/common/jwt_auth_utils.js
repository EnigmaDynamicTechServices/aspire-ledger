import jwt from "jsonwebtoken";

const secretKey = "8Y:5s<j`ZGf5e7Z";

if (!secretKey) {
  throw new Error("SECRET_KEY is not defined in the environment variables.");
}

/**
 * Generates a pair of JWT tokens: access and refresh.
 *
 * @param {string} userId - The unique user identifier.
 * @param {object} options - Optional parameters for token expiration.
 * @param {string} options.accessTokenExpiresIn - Expiration time for the access token (default: "15m").
 * @param {string} options.refreshTokenExpiresIn - Expiration time for the refresh token (default: "10d").
 * @returns {Promise<{ token: string, refreshToken: string }>} The generated tokens.
 */
export default async function generateJwtTokens(
  userId,
  options = { accessTokenExpiresIn: "15m", refreshTokenExpiresIn: "10d" }
) {
  try {
    if (!userId) {
      throw new Error("User ID is required to generate tokens.");
    }

    const token = jwt.sign({ id: userId }, secretKey, {
      expiresIn: options.accessTokenExpiresIn,
      algorithm: "HS256",
    });

    const refreshToken = jwt.sign({ id: userId }, secretKey, {
      expiresIn: options.refreshTokenExpiresIn,
      algorithm: "HS256",
    });

    return { token, refreshToken };
  } catch (error) {
    throw new Error(`Error generating JWT tokens: ${error.message}`);
  }
}
