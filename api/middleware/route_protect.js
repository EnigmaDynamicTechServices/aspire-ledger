import jwt from "jsonwebtoken";
import generateJwtTokens from "../common/jwt_auth_utils.js";
const secretKey = process.env.SECRET_KEY;
import TokenModel from "../user-management/model/token_model.js";

export default async (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Check if the Authorization header exists
  if (authHeader) {
    try {
      const token = authHeader.split("Bearer ")[1]; // Extract the token from the Bearer header
      if (!token) {
        return res
          .status(401)
          .json({ message: "Token not found in authorization header" });
      }

      // Decode the JWT token
      const decodedToken = jwt.decode(token, secretKey);
      if (!decodedToken) {
        return res.status(401).json({ message: "Invalid token" });
      }

      // Check if the token has expired
      if (Date.now() >= decodedToken.exp * 1000) {
        console.log("Token expired");

        const userId = decodedToken.id;
        const tokenModel = await TokenModel.findOne({ user: userId }).populate({
          path: "user",
        });

        if (tokenModel) {
          const refreshToken = tokenModel.refreshToken;

          // Verify the refresh token
          jwt.verify(refreshToken, secretKey, async (err, payload) => {
            if (err) {
              await tokenModel.deleteOne({ _id: tokenModel.id });
              return res.status(401).json({
                message: "Invalid or expired refresh token!",
              });
            }

            // Check if the refresh token has expired
            if (Date.now() >= payload.exp * 1000) {
              console.log("Refresh token expired");
              await tokenModel.deleteOne({ _id: tokenModel.id });
              return res.status(401).json({
                message: "Refresh token expired! Please login again.",
              });
            } else {
              console.log("Refresh token valid");

              // Generate new tokens
              const generatedTokens = await generateJwtTokens(userId);

              // Update the refresh token and JWT in the database
              await TokenModel.findOneAndUpdate(
                { user: userId },
                {
                  token: generatedTokens.token,
                  refreshToken: generatedTokens.refreshToken,
                  user: userId,
                }
              );

              // Set the new token in the response header
              res.setHeader("Access-Control-Expose-Headers", "authorization");
              res.header("authorization", "Bearer " + generatedTokens.token);

              // Proceed to the next middleware
              return next();
            }
          });
        } else {
          console.log("Logged out or invalid token model");
          return res.status(401).json({
            message: "You are logged out. Please login again.",
            logout: true,
          });
        }
      } else {
        console.log("Token not expired, proceeding...");
        // If the token is valid and not expired, proceed to the next middleware
        return next();
      }
    } catch (e) {
      console.error("Error in token verification: ", e);
      return res.status(401).json({
        message: "Unauthorized access!",
      });
    }
  } else {
    return res.status(401).json({
      message: "Unauthorized access, no token provided!",
    });
  }
};
