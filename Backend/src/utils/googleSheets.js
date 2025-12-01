const { google } = require("googleapis");
const fs = require("fs");

// Updated to use new Google Auth API (fixes deprecated credentials option)
const auth = new google.auth.GoogleAuth({
  credentials: JSON.parse(fs.readFileSync("service-account.json", "utf8")),
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

const sheets = google.sheets({ version: "v4", auth });

async function addToGoogleSheet(vendorName, storeName, email, phone, notes) {
  const spreadsheetId = "1bpxf7Q4snJ37bdUZQ8t3Ll8QiWWghh4AHG9TNM7bieg";
  const range = "Sheet1!A1"; // ✅ safer and simpler

  const values = [[vendorName, storeName, email, phone, notes]];

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range,
    valueInputOption: "USER_ENTERED",
    requestBody: { values },
  });

  console.log("✅ Successfully added to Google Sheet");
}

// Example usage (for testing purposes)
addToGoogleSheet("Test User", "Test Store", "ben@gmail.com", "1234567890", "buyer")
  .then(() => console.log("User added to Google Sheet"))
  .catch((err) => console.error("Error adding to Google Sheet:", err));

module.exports = { addToGoogleSheet };
