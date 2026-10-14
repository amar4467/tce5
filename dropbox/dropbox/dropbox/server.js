require("dotenv").config();

const express = require("express");
const multer = require("multer");
const { Dropbox } = require("dropbox");
const path = require("path");

const app = express();
const port = process.env.PORT || 3000;

// Setup Multer (15MB file size limit)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 }
});

// Initialize Dropbox client
function getDropboxClient() {
  require("dotenv").config({ override: true });
  if (
    process.env.DROPBOX_REFRESH_TOKEN &&
    process.env.DROPBOX_APP_KEY &&
    process.env.DROPBOX_APP_SECRET
  ) {
    return new Dropbox({
      clientId: process.env.DROPBOX_APP_KEY,
      clientSecret: process.env.DROPBOX_APP_SECRET,
      refreshToken: process.env.DROPBOX_REFRESH_TOKEN
    });
  }

  return new Dropbox({
    accessToken: process.env.DROPBOX_ACCESS_TOKEN
  });
}

// Serve static assets from public/ folder using absolute path to prevent 'Cannot GET /'
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

// Fallback route for root to ensure index.html always loads
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

function getErrorMessage(err, defaultMsg = "An error occurred") {
  if (!err) return defaultMsg;
  if (typeof err.error === "string") return err.error;
  if (err.error?.user_message?.text) return err.error.user_message.text;
  if (err.error?.error_summary) return err.error.error_summary;
  if (err.message) return err.message;
  return defaultMsg;
}

// 1. Check Dropbox Status / Connection
app.get("/api/status", async (req, res) => {
  try {
    const dbx = getDropboxClient();
    const account = await dbx.usersGetCurrentAccount();
    res.json({
      connected: true,
      user: account.result.name.display_name,
      email: account.result.email
    });
  } catch (err) {
    const errorDetail = getErrorMessage(err, "Token error");
    res.status(500).json({
      connected: false,
      error: errorDetail
    });
  }
});

// 2. Upload any file to Dropbox
app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: "Please select a file to upload." });
    }

    const dbx = getDropboxClient();
    const safeName = req.file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
    const dropboxPath = "/" + Date.now() + "_" + safeName;

    await dbx.filesUpload({
      path: dropboxPath,
      contents: req.file.buffer,
      mode: { ".tag": "add" },
      autorename: true
    });

    res.json({ success: true, message: `"${req.file.originalname}" uploaded successfully!` });
  } catch (err) {
    console.error("Upload error:", err);
    const detail = getErrorMessage(err, "Upload failed");
    res.status(500).json({ success: false, error: detail });
  }
});

// 3. List all files from Dropbox
app.get("/files", async (req, res) => {
  try {
    const dbx = getDropboxClient();
    let result = await dbx.filesListFolder({ path: "" });
    let entries = [...result.result.entries];

    while (result.result.has_more) {
      result = await dbx.filesListFolderContinue({
        cursor: result.result.cursor
      });
      entries.push(...result.result.entries);
    }

    const files = entries
      .filter(item => item[".tag"] === "file")
      .map(file => {
        const isImage = /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(file.name);
        return {
          id: file.id,
          name: file.name,
          path: file.path_lower,
          size: file.size,
          modified: file.server_modified,
          isImage
        };
      })
      .sort((a, b) => new Date(b.modified) - new Date(a.modified));

    res.json(files);
  } catch (err) {
    console.error("List files error:", err);
    const detail = getErrorMessage(err, "Could not load files");
    res.status(500).json({ error: detail });
  }
});

// 4. Download / View a file
app.get("/download", async (req, res) => {
  try {
    const filePath = req.query.path;
    if (!filePath || typeof filePath !== "string" || !filePath.startsWith("/")) {
      return res.status(400).send("Invalid file path.");
    }

    const dbx = getDropboxClient();
    const downloadRes = await dbx.filesDownload({ path: filePath });
    const file = downloadRes.result;

    const fileData = file.fileBinary || file.fileBlob;
    const buffer = Buffer.isBuffer(fileData)
      ? fileData
      : Buffer.from(await fileData.arrayBuffer());

    if (req.query.download === "1") {
      res.attachment(file.name);
    } else {
      res.setHeader("Content-Disposition", `inline; filename="${file.name}"`);
    }

    res.send(buffer);
  } catch (err) {
    console.error("Download error:", err);
    res.status(500).send("Failed to retrieve file from Dropbox: " + getErrorMessage(err));
  }
});

// 5. Delete a file
app.delete("/delete", async (req, res) => {
  try {
    const filePath = req.query.path;
    if (!filePath || typeof filePath !== "string" || !filePath.startsWith("/")) {
      return res.status(400).json({ success: false, error: "Invalid path" });
    }

    const dbx = getDropboxClient();
    await dbx.filesDeleteV2({ path: filePath });
    res.json({ success: true, message: "File deleted successfully" });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ success: false, error: getErrorMessage(err, "Delete failed") });
  }
});

app.listen(port, () => {
  console.log(`Dropbox App server running at http://localhost:${port}`);
});