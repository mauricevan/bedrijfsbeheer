/**
 * Outlook Helper for Windows COM API
 * 
 * Uses Windows COM API to extract email content from Outlook
 * when an email is dragged from Outlook.
 */

const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

/**
 * Extract email content from Outlook using PowerShell and COM API
 * @param {Object} metadata - Outlook drag metadata containing entryId or other identifiers
 * @returns {Promise<Object>} Email data object
 */
async function getOutlookEmailContent(metadata) {
  try {
    // Try to use PowerShell to access Outlook COM API
    const script = `
      Add-Type -AssemblyName "Microsoft.Office.Interop.Outlook"
      $outlook = New-Object -ComObject Outlook.Application
      $namespace = $outlook.GetNamespace("MAPI")
      
      # Try to find the email by subject or entryId
      $folder = $namespace.GetDefaultFolder(6) # olFolderInbox
      $items = $folder.Items
      
      # Search for recent email matching the metadata
      $foundItem = $null
      foreach ($item in $items) {
        if ($item.Class -eq 43) { # olMail
          # Check if this matches (simplified - might need EntryID for exact match)
          if ($item.Subject -like "*${metadata.subject || ''}*" -or 
              $item.SenderEmailAddress -like "*${metadata.from || ''}*") {
            $foundItem = $item
            break
          }
        }
      }
      
      if ($foundItem) {
        $result = @{
          from = $foundItem.SenderEmailAddress
          to = $foundItem.To
          subject = $foundItem.Subject
          body = $foundItem.Body
          date = $foundItem.ReceivedTime.ToString("yyyy-MM-ddTHH:mm:ss")
          htmlBody = $foundItem.HTMLBody
        }
        $result | ConvertTo-Json
      } else {
        Write-Output '{"error": "Email not found"}'
      }
    `;

    const { stdout, stderr } = await execPromise(`powershell -Command "${script.replace(/"/g, '\\"')}"`);
    
    if (stderr && !stderr.includes('Warning')) {
      throw new Error(stderr);
    }

    const result = JSON.parse(stdout.trim());
    if (result.error) {
      throw new Error(result.error);
    }

    return result;
  } catch (error) {
    console.error('Error getting Outlook email content:', error);
    
    // Fallback: return what we can from metadata
    return {
      from: metadata.from || '',
      subject: metadata.subject || metadata.itemType || 'Geen onderwerp',
      body: metadata.body || '',
      date: metadata.date || new Date().toISOString(),
      htmlBody: metadata.htmlBody || '',
    };
  }
}

/**
 * Alternative: Use VBScript (more reliable for COM)
 */
async function getOutlookEmailContentVBScript(metadata) {
  try {
    const vbScript = `
      Set objOutlook = CreateObject("Outlook.Application")
      Set objNamespace = objOutlook.GetNamespace("MAPI")
      Set objFolder = objNamespace.GetDefaultFolder(6) ' olFolderInbox
      Set objItems = objFolder.Items
      
      ' Sort by received time (newest first)
      objItems.Sort "[ReceivedTime]", True
      
      ' Get the most recent email that matches
      Set objMail = Nothing
      For i = 1 To objItems.Count
        Set objItem = objItems.Item(i)
        If objItem.Class = 43 Then ' olMail
          If InStr(objItem.Subject, "${metadata.subject || ''}") > 0 Or _
             InStr(objItem.SenderEmailAddress, "${metadata.from || ''}") > 0 Then
            Set objMail = objItem
            Exit For
          End If
        End If
      Next
      
      If Not objMail Is Nothing Then
        WScript.Echo "{"
        WScript.Echo """from"": """ & objMail.SenderEmailAddress & ""","
        WScript.Echo """to"": """ & objMail.To & ""","
        WScript.Echo """subject"": """ & Replace(objMail.Subject, """", "\\""") & ""","
        WScript.Echo """body"": """ & Replace(Replace(objMail.Body, """", "\\"""), vbCrLf, "\\n") & ""","
        WScript.Echo """date"": """ & Year(objMail.ReceivedTime) & "-" & Right("0" & Month(objMail.ReceivedTime), 2) & "-" & Right("0" & Day(objMail.ReceivedTime), 2) & "T" & Right("0" & Hour(objMail.ReceivedTime), 2) & ":" & Right("0" & Minute(objMail.ReceivedTime), 2) & ":00"","
        WScript.Echo """htmlBody"": """ & Replace(Replace(objMail.HTMLBody, """", "\\"""), vbCrLf, "\\n") & """"
        WScript.Echo "}"
      Else
        WScript.Echo "{\"error\": \"Email not found\"}"
      End If
    `;

    // Write temp VBS file
    const fs = require('fs');
    const path = require('path');
    const tempFile = path.join(require('os').tmpdir(), `outlook_${Date.now()}.vbs`);
    fs.writeFileSync(tempFile, vbScript);

    try {
      const { stdout } = await execPromise(`cscript //nologo "${tempFile}"`);
      fs.unlinkSync(tempFile); // Clean up
      
      const result = JSON.parse(stdout.trim());
      if (result.error) {
        throw new Error(result.error);
      }
      return result;
    } catch (err) {
      // Clean up on error
      if (fs.existsSync(tempFile)) {
        fs.unlinkSync(tempFile);
      }
      throw err;
    }
  } catch (error) {
    console.error('Error with VBScript method:', error);
    // Fallback
    return {
      from: metadata.from || '',
      subject: metadata.subject || 'Geen onderwerp',
      body: metadata.body || '',
      date: metadata.date || new Date().toISOString(),
    };
  }
}

module.exports = {
  getOutlookEmailContent,
  getOutlookEmailContentVBScript,
};







