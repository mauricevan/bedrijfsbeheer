/**
 * Electron Main Process
 *
 * Handles Outlook email drag-and-drop by intercepting Windows
 * drag-and-drop events and extracting email data.
 */

const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const fs = require("fs");
const { getOutlookEmailContentVBScript } = require("./outlookHelper.cjs");

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      enableRemoteModule: false,
      webSecurity: true,
    },
  });

  // Set Content Security Policy for development
  if (process.env.NODE_ENV === "development" || !app.isPackaged) {
    mainWindow.webContents.session.webRequest.onHeadersReceived(
      (details, callback) => {
        callback({
          responseHeaders: {
            ...details.responseHeaders,
            "Content-Security-Policy": [
              "default-src 'self' 'unsafe-inline' 'unsafe-eval' http://localhost:* https://* data: blob:; script-src 'self' 'unsafe-inline' 'unsafe-eval' http://localhost:* https://*; style-src 'self' 'unsafe-inline' https://*;",
            ],
          },
        });
      }
    );
  }

  // Load the app
  const isDev = process.env.NODE_ENV === "development" || !app.isPackaged;

  if (isDev) {
    // Development: Load from Vite dev server
    mainWindow.loadURL("http://localhost:5173");
    mainWindow.webContents.openDevTools();
  } else {
    // Production: Load from build
    mainWindow.loadFile(path.join(__dirname, "../dist/index.html"));
  }

  // Enable drag-and-drop from Outlook
  // Note: We let React handle the drop events, but we enable global drag support
  mainWindow.webContents.on("did-finish-load", () => {
    console.log("✅ Page loaded, Electron ready for drag-and-drop");
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

// Handle .eml file drops
ipcMain.handle("read-eml-file", async (event, filePath) => {
  console.log("📄 IPC: read-eml-file called with path:", filePath);
  try {
    const content = await fs.promises.readFile(filePath, "utf-8");
    console.log("📄 File read successfully, length:", content.length);
    return { success: true, content };
  } catch (error) {
    console.error("❌ Error reading .eml file:", error);
    return { success: false, error: error.message };
  }
});

// Handle Outlook drag data (Windows COM API approach)
ipcMain.handle("process-outlook-email", async (event, outlookData) => {
  console.log("📬 IPC: process-outlook-email called");
  console.log("📬 Data type:", typeof outlookData);
  console.log("📬 Data length:", outlookData ? outlookData.length : 0);
  console.log("📬 Platform:", process.platform);

  try {
    // Try to parse Outlook data
    let emailData = null;

    if (typeof outlookData === "string") {
      console.log("📬 Attempting to parse JSON...");
      try {
        const parsed = JSON.parse(outlookData);
        console.log("📬 JSON parsed successfully");
        console.log("📬 Parsed keys:", Object.keys(parsed));
        console.log("📬 tableViewId:", parsed.tableViewId);
        console.log("📬 itemType:", parsed.itemType);
        console.log("📬 rowKeys:", parsed.rowKeys);
        console.log("📬 latestItemIds:", parsed.latestItemIds);
        console.log("📬 subjects:", parsed.subjects);
        console.log("📬 Full parsed data:", JSON.stringify(parsed, null, 2));

        // This is the metadata we saw in the test
        // Use Windows COM API to get actual email content
        if (process.platform === "win32") {
          console.log("📬 Windows detected, using VBScript COM API...");
          // Try VBScript method first (more reliable)
          try {
            emailData = await getOutlookEmailContentVBScript(parsed);
            console.log("📬 COM API result:", emailData ? "SUCCESS" : "FAILED");
            if (emailData) {
              console.log("📬 Email from:", emailData.from);
              console.log("📬 Email subject:", emailData.subject);
              console.log(
                "📬 Email body length:",
                emailData.body ? emailData.body.length : 0
              );
              if (emailData.error) {
                console.error("❌ VBScript returned error:", emailData.error);
              }
            } else {
              console.error("❌ VBScript returned null/undefined");
            }
          } catch (err) {
            console.error("❌ Error calling VBScript:", err);
            console.error("❌ Error stack:", err.stack);
            throw err;
          }
        } else {
          console.log("📬 Non-Windows platform, using fallback");
          // Fallback for non-Windows
          emailData = {
            from: parsed.from || "",
            subject: parsed.subject || parsed.itemType || "Geen onderwerp",
            body: parsed.body || "",
            date: parsed.date || new Date().toISOString(),
          };
        }
      } catch (e) {
        console.log("📬 JSON parse failed, treating as raw data:", e.message);
        // Not JSON, might be raw data
        emailData = {
          from: "",
          subject: "Outlook Email",
          body: outlookData,
          date: new Date().toISOString(),
        };
      }
    } else {
      console.log("❌ Outlook data is not a string:", typeof outlookData);
    }

    console.log("📬 Returning emailData:", emailData ? "PRESENT" : "NULL");
    return { success: true, emailData };
  } catch (error) {
    console.error("❌ Error processing Outlook email:", error);
    console.error("❌ Error stack:", error.stack);
    return { success: false, error: error.message };
  }
});

// App event handlers
app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// Handle file opens (when app is already running)
app.on("open-file", (event, filePath) => {
  event.preventDefault();
  if (mainWindow) {
    mainWindow.webContents.send("file-opened", filePath);
  }
});
