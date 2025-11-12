/**
 * Electron Preload Script
 * 
 * Safe bridge between main process and renderer process
 */

const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process
// to use ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Handle .eml file drops
  handleEmlFile: async (filePath) => {
    console.log("📧 handleEmlFile called with path:", filePath);
    try {
      const result = await ipcRenderer.invoke('read-eml-file', filePath);
      console.log("📧 IPC result:", result.success ? "SUCCESS" : "FAILED");
      if (result.success) {
        console.log("📧 Dispatching email-dropped event (eml)");
        // Send email content to React app
        window.dispatchEvent(new CustomEvent('email-dropped', {
          detail: {
            type: 'eml',
            content: result.content,
          }
        }));
      } else {
        console.error("❌ Failed to read .eml file:", result.error);
        window.dispatchEvent(new CustomEvent('email-error', {
          detail: { error: result.error }
        }));
      }
    } catch (error) {
      console.error("❌ Error in handleEmlFile:", error);
      window.dispatchEvent(new CustomEvent('email-error', {
        detail: { error: error.message }
      }));
    }
  },

  // Handle Outlook drag data
  handleOutlookDrag: async (outlookData) => {
    console.log("📬 handleOutlookDrag called");
    console.log("📬 Data length:", outlookData ? outlookData.length : 0);
    console.log("📬 Data preview:", outlookData ? outlookData.substring(0, 200) : "NO DATA");
    try {
      console.log("📬 Invoking IPC process-outlook-email...");
      const result = await ipcRenderer.invoke('process-outlook-email', outlookData);
      console.log("📬 IPC result:", result.success ? "SUCCESS" : "FAILED");
      console.log("📬 Email data:", result.emailData ? "PRESENT" : "MISSING");
      
      if (result.success && result.emailData) {
        console.log("📬 Email from:", result.emailData.from);
        console.log("📬 Email subject:", result.emailData.subject);
        console.log("📬 Dispatching email-dropped event (outlook)");
        // Send email data to React app
        window.dispatchEvent(new CustomEvent('email-dropped', {
          detail: {
            type: 'outlook',
            emailData: result.emailData,
          }
        }));
      } else {
        console.error("❌ Failed to process Outlook email:", result.error);
        window.dispatchEvent(new CustomEvent('email-error', {
          detail: { error: result.error || 'Failed to process Outlook email' }
        }));
      }
    } catch (error) {
      console.error("❌ Error in handleOutlookDrag:", error);
      window.dispatchEvent(new CustomEvent('email-error', {
        detail: { error: error.message }
      }));
    }
  },

  // Check if running in Electron
  isElectron: true,
});

