import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//* PYTHON SCRIPT TO EXTRACT TABLE FROM PDF
const extractTableFromPDF = async (pdfPath, passkey) => {
  return new Promise((resolve, reject) => {
    const pythonScript = path.join(
      __dirname,
      "../scripts/extract_data_emailpdf.py"
    );

    const pythonProcess = spawn("python", [pythonScript, pdfPath, passkey]);

    let data = "";
    pythonProcess.stdout.on("data", (chunk) => (data += chunk.toString()));

    pythonProcess.on("close", async (code) => {
      if (code === 0) {
        try {
          console.log(":::::::EXTRACTION START OF EXTRACTION TABLE::::::::");
          console.log("RAW TABLE DATA FROM PYTHON:", data);
          console.log(":::::::EXTRACTION END OF EXTRACTION TABLE::::::::");
          resolve(JSON.parse(data));
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
