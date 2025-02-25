import { oauth2Client } from "../services/googleAuth.service.js";
import { ApiError } from "./ApiError.js";

const refreshAccessToken = async (email, refreshToken) => {
  try {
    const { tokens } = await oauth2Client.refreshToken(refreshToken);
    console.log("🔐 Access & Refresh Tokens:", tokens);

    // await updateToknesInDB(email, tokens);

    return tokens.access_token;
  } catch (error) {
    console.error("❌ Refresh Token Error:", error.message);
    throw new ApiError(500, " Refresh Token Error: ", error.message);
  }
};

export { refreshAccessToken };
