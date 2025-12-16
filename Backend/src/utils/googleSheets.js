const { google } = require("googleapis");
const fs = require("fs");

let sheets;
try {
  if (fs.existsSync("service-account.json")) {
    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(fs.readFileSync("service-account.json", "utf8")),
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
    sheets = google.sheets({ version: "v4", auth });
  } else {
    console.warn("⚠️ service-account.json not found. Google Sheets integration disabled.");
  }
} catch (error) {
  console.error("⚠️ Failed to initialize Google Sheets:", error.message);
}

async function addToGoogleSheet(vendorName, storeName, email, phone, notes) {
  const spreadsheetId = process.env.GOOGLE_SHEET_ID;
  const range = "Sheet1!A1"; // ✅ safer and simpler

  const values = [[vendorName, storeName, email, phone, notes]];

  if (!sheets) {
    console.warn("⚠️ Google Sheets not initialized. Skipping addToGoogleSheet.");
    return;
  }

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range,
    valueInputOption: "USER_ENTERED",
    requestBody: { values },
  });

  console.log("✅ Successfully added to Google Sheet");
}

// Example usage (for testing purposes)
// addToGoogleSheet("Test User", "Test Store", "ben@gmail.com", "1234567890", "buyer")
//   .then(() => console.log("User added to Google Sheet"))
//   .catch((err) => console.error("Error adding to Google Sheet:", err));

module.exports = { addToGoogleSheet };
