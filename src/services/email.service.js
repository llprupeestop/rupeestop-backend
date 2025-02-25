import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//* PYTHON SCRIPT TO EXTRACT TABLE FROM PDF
const extractTableFromPDF = async (pdfPath, passkey) => {
  console.log("PDF PATH:", pdfPath);
  console.log("PASSKEY:", passkey);
  return new Promise((resolve, reject) => {
    const pythonScript = path.join(
      __dirname,
      "../scripts/extract_data_emailpdf.py"
    );

    console.log(
      `⚙️ Running Python script: ${pythonScript} with PDF: ${pdfPath}`
    );

    const pythonProcess = spawn("python", [
      pythonScript,
      pdfPath,
      passkey,
      process.env.GEMINI_API_KEY,
    ]);

    console.log("🚀 PYTHON PROCESS:");

    let data = "";
    pythonProcess.stdout.on("data", (chunk) => (data += chunk.toString()));

    pythonProcess.stderr.on("data", (error) => {
      console.log("Python Error is:", error.toString("utf-8"));
      reject(error.toString("utf-8"));
    });

    pythonProcess.on("close", async (code) => {
      console.log("Code is:", code);

      if (code === 0) {
        try {
          console.log(":::::::EXTRACTION START OF EXTRACTION TABLE::::::::");
          console.log("RAW TABLE DATA FROM PYTHON:", data);
          console.log(":::::::EXTRACTION END OF EXTRACTION TABLE::::::::");
          resolve(data);
        } catch (err) {
          reject("Error parsing JSON output:", err);
        }
      } else {
        reject(`Process exited with code ${code}`);
      }
    });
  });
};

export { extractTableFromPDF };
