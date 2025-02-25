import { saveTokenToDB } from "../services/dynamoDb.service.js";
import { getTokens, oauth2Client } from "../services/googleAuth.service.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { google } from "googleapis";
import fs from "fs";
import { extractTableFromPDF } from "../services/email.service.js";
import { refreshAccessToken } from "../utils/tokenGen.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//* STORE-EMAIL-TOKEN
const storeEmailToken = async (req, res) => {
  const { code } = req.query;

  try {
    if (!code) {
      throw new ApiError(404, "Authorization code not found");
    }

    const tokens = await getTokens(code);
    console.log("🔐 Access & Refresh Tokens:", tokens);

    oauth2Client.setCredentials(tokens); //Temperory
    console.log("🔐 OAuth2 Client Credentials:", oauth2Client.credentials);

    const userEmail = await getUserEmail(oauth2Client);
    console.log("📧 User Email:", userEmail);

    // await saveTokenToDB(userEmail, tokens);

    res.send("Authorization successful! You can close this page.");
  } catch (error) {
    console.error("❌ OAuth Callback Error:", error.message);
    res.status(500).send("❌ OAuth Callback Error: " + error.message);
  }
};

//* GET-USER-EMAIL
const getUserEmail = async (auth) => {
  console.log("🔍 Fetching user email...");
  const gmail = google.gmail({ version: "v1", auth });
  const profile = await gmail.users.getProfile({ userId: "me" });
  return profile.data.emailAddress;
};

//* GET ALL EMIALS DATA
const getAllEmailData = async (req, res) => {
  const email = "shubhamkumar7112002@gmail.com";

  // const response = await getEmailDataFromDB(email);

  // if (!response.Item) {
  //   return res.status(404).json(new ApiError(404, "Email not found"));
  // }

  // let tokens = response.Item.tokens;

  //Refresh Token if Expired
  // if (Date.now() >= tokens.expiry_date) {
  //   tokens.access_token = await refreshAccessToken(email, tokens.refresh_token);
  // }

  // await saveTokenToDB(email, tokens);

  // oauth2Client.setCredentials(tokens);
  const portfolioData = await fetchEmailWithPDFs(email);

  console.log("📧 Portfolio Data:", portfolioData);

  if (!portfolioData) {
    return res
      .status(200)
      .json(new ApiResponse(200, "No new emails with PDFs found", []));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Email data fetched", portfolioData));
};

//* FETCH EMAIL WITH PDFS
const fetchEmailWithPDFs = async (email) => {
  const tokens = {
    access_token:
      "ya29.a0AeXRPp4Ldj-d2ocIANNOyPYkiZ3GXwETJ_JnAY8oYQErgbnrrVS7wR0PcvHp3-20_Ju2SWwpWsexewN1on94TR44ZOBhNlwO50YW_d0pAsG0-FgGn2Y8Qjc7q_mNhumYDUHsoOYE7wUiMRpqt4iZAxBNh9aJkIKR8hDSpscgaCgYKAQkSARISFQHGX2MiflkI8BAPUqazydcK-SWzCA0175",
    refresh_token:
      "1//0gqg7MZdhizKMCgYIARAAGBASNwF-L9IrwcYBzvKO2L6tvi2aAbkF5QfEGLD5zjI1tah8W-0LRQRua9Wicvlh_iRkhSDoQxWadL4",
    scope: "https://www.googleapis.com/auth/gmail.readonly",
    token_type: "Bearer",
    refresh_token_expires_in: 604799,
    expiry_date: 1740477741802,
  };
  oauth2Client.setCredentials(tokens);

  console.log("Fetching pdf data.....");

  const gmail = google.gmail({ version: "v1", auth: oauth2Client });

  const messages = await gmail.users.messages.list({
    userId: "me",
    q: "has:attachment CAS_30112024_50431295_0859299:pdf (from:shubh.11222333@gmail.com OR from:nsdl.co.in OR from:zerodha.com)",
  });

  if (!messages.data.messages) {
    console.log("📭 No new emails with PDFs found.");
    return [];
  }

  for (let msg of messages.data.messages) {
    let emailData = await gmail.users.messages.get({
      userId: "me",
      id: msg.id,
    });

    let sender = emailData.data.payload.headers.find(
      (header) => header.name === "From"
    ).value;

    console.log(`📩 PDF received from: ${sender}`);

    let parts = emailData.data.payload.parts || [];
    for (let part of parts) {
      if (part.filename && part.filename.endsWith(".pdf")) {
        let attachmentId = part.body.attachmentId;
        let attachment = await gmail.users.messages.attachments.get({
          userId: "me",
          messageId: msg.id,
          id: attachmentId,
        });

        let pdfBuffer = Buffer.from(attachment.data.data, "base64");

        const docsDir = path.join(__dirname, "../../docs");
        if (!fs.existsSync(docsDir)) {
          fs.mkdirSync(docsDir, { recursive: true });
        }
        const filePath = path.join(docsDir, part.filename);
        fs.writeFileSync(filePath, pdfBuffer);

        console.log(`📥 PDF Downloaded: ${part.filename}`);

        let extractedData;
        let password = "DFLPS1544Q";
        try {
          extractedData = await extractTableFromPDF(filePath, password);
          console.log("📄 Extracted Data:", extractedData);
          return extractedData;
        } catch (error) {
          console.error("❌ Error extracting data from PDF:", error);
          return extractedData || [];
        } finally {
          fs.unlinkSync(filePath);
          console.log("🗑️ Deleted PDF file:", filePath);
        }
      }
    }
  }
};

export { storeEmailToken, getAllEmailData };
