import { saveTokenToDB } from "../services/dynamoDb.service.js";
import { oauth2Client } from "../services/googleAuth.service";
import { ApiError } from "../utils/ApiError.js";
import { google } from "googleapis";

const storeEmailToken = async (req, res) => {
  const code = req.query.code;
  try {
    if (!code) {
      throw new ApiError(404, "Authorization code not found");
    }
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const userEmail = await getUserEmail(oauth2Client);

    await saveTokenToDB(userEmail, tokens);

    res.send("Authorization successful! You can close this page.");
  } catch (error) {
    console.error("❌ OAuth Callback Error:", error.message);
    res.status(500).send("❌ OAuth Callback Error: " + error.message);
  }
};

//* GET-USER-EMAIL
const getUserEmail = async (auth) => {
  const gmail = google.gmail({ version: "v1", auth });
  const profile = await gmail.users.getProfile({ userId: "me" });
  return profile.data.emailAddress;
};

export { storeEmailToken };
