/**
 * Outlook Helper for Windows COM API
 */

const { exec } = require("child_process");
const util = require("util");
const execPromise = util.promisify(exec);
const fs = require("fs");
const path = require("path");
const os = require("os");

/**
 * Extract email from Outlook using VBScript
 */
async function getOutlookEmailContentVBScript(metadata) {
  try {
    // Extract data
    const latestItemIds = metadata.latestItemIds || [];
    const subjects = metadata.subjects || [];
    const tableViewId = metadata.tableViewId || "";
    
    const entryId = latestItemIds[0] || "";
    
    // CRITICAL: Clean FolderID - remove everything after semicolon
    const folderIdMatch = tableViewId.match(/folderId:([^;]+)/);
    const rawFolderId = folderIdMatch ? folderIdMatch[1] : "";
    const cleanFolderId = rawFolderId.split(';')[0]; // Extra safety
    
    const cleanSubject = subjects[0] 
      ? subjects[0].trim().toLowerCase()
      : "";

    console.log("📬 EntryID:", entryId);
    console.log("📬 FolderID (cleaned):", cleanFolderId);
    console.log("📬 Subject:", cleanSubject);

    if (!entryId || !cleanSubject) {
      throw new Error("Missing required metadata");
    }

    // Generate VBScript
    const vbScript = generateVBScript(entryId, cleanFolderId, cleanSubject);
    
    // Write to temp file
    const tempFile = path.join(os.tmpdir(), `outlook_${Date.now()}.vbs`);
    fs.writeFileSync(tempFile, vbScript, "utf8");
    console.log("📬 VBScript written:", tempFile);

    try {
      // Execute
      const { stdout, stderr } = await execPromise(`cscript //nologo "${tempFile}"`);

      // Cleanup temp file
      if (fs.existsSync(tempFile)) {
        fs.unlinkSync(tempFile);
      }

      if (stderr && stderr.trim()) {
        console.log("❌ VBScript stderr:", stderr);
        throw new Error(`VBScript execution error: ${stderr}`);
      }

      // Parse output
      const output = stdout.trim();
      console.log("📬 VBScript output length:", output.length);

      // Find JSON (skip DEBUG lines)
      const lines = output.split("\n");
      let jsonLine = "";
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.startsWith("{") && line.includes('"from"')) {
          jsonLine = line;
          break;
        }
      }

      if (!jsonLine) {
        console.log("❌ No JSON found. Full output:", output);
        throw new Error("No valid JSON in VBScript output");
      }

      const result = JSON.parse(jsonLine);

      if (result.error) {
        throw new Error(result.error);
      }

      console.log("✅ Email retrieved:", result.subject || "No subject");
      return result;
      
    } catch (err) {
      // Cleanup on error
      if (fs.existsSync(tempFile)) {
        fs.unlinkSync(tempFile);
      }
      throw err;
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
    
    // Return fallback
    return {
      from: "",
      to: [],
      subject: "Geen onderwerp",
      body: "",
      date: new Date().toISOString(),
      error: error.message,
    };
  }
}

/**
 * Generate VBScript
 */
function generateVBScript(entryId, folderId, subject) {
  // Escape double quotes for VBScript
  const esc = (str) => str.replace(/"/g, '""');
  
  return `Option Explicit
On Error Resume Next

Dim objOutlook, objNamespace, objMail, objFolder, objItems, item
Dim found

Set objOutlook = CreateObject("Outlook.Application")
Set objNamespace = objOutlook.GetNamespace("MAPI")
Set objMail = Nothing
found = False

' --- METHOD 1: Try EntryID only ---
WScript.Echo "DEBUG: Trying Method 1 - EntryID only"
Set objMail = objNamespace.GetItemFromID("${esc(entryId)}")
If Not objMail Is Nothing And Err.Number = 0 Then
  found = True
  WScript.Echo "DEBUG: Method 1 SUCCESS - Found by EntryID"
Else
  WScript.Echo "DEBUG: Method 1 FAILED - Error: " & Err.Number & " - " & Err.Description
  Err.Clear
  Set objMail = Nothing
End If

' --- METHOD 2: Try EntryID + FolderID ---
If Not found Then
  WScript.Echo "DEBUG: Trying Method 2 - EntryID + FolderID"
  Set objMail = objNamespace.GetItemFromID("${esc(entryId)}", "${esc(folderId)}")
  If Not objMail Is Nothing And Err.Number = 0 Then
    found = True
    WScript.Echo "DEBUG: Method 2 SUCCESS - Found by EntryID + FolderID"
  Else
    WScript.Echo "DEBUG: Method 2 FAILED - Error: " & Err.Number & " - " & Err.Description
    Err.Clear
    Set objMail = Nothing
  End If
End If

' --- METHOD 3: Search by Subject in Inbox ---
If Not found Then
  WScript.Echo "DEBUG: Trying Method 3 - Subject search in Inbox"
  Set objFolder = objNamespace.GetDefaultFolder(6) ' Inbox
  If Not objFolder Is Nothing And Err.Number = 0 Then
    WScript.Echo "DEBUG: Inbox found: " & objFolder.Name
    Set objItems = objFolder.Items
    objItems.Sort "[ReceivedTime]", True
    WScript.Echo "DEBUG: Searching " & objItems.Count & " emails for: ${esc(subject)}"
    
    Dim matchCount
    matchCount = 0
    For Each item In objItems
      On Error Resume Next
      If item.Class = 43 Then ' olMail
        matchCount = matchCount + 1
        Dim itemSubj
        itemSubj = LCase(Trim(item.Subject))
        If Err.Number = 0 Then
          If matchCount <= 5 Then
            WScript.Echo "DEBUG: Email " & matchCount & ": " & itemSubj
          End If
          If itemSubj = "${esc(subject)}" Then
            Set objMail = item
            found = True
            WScript.Echo "DEBUG: Method 3 SUCCESS - Subject match!"
            Exit For
          End If
        End If
      End If
      If Err.Number <> 0 Then Err.Clear
    Next
    If Not found Then
      WScript.Echo "DEBUG: Method 3 FAILED - No match in " & matchCount & " emails"
    End If
  Else
    WScript.Echo "DEBUG: Method 3 FAILED - Cannot open Inbox"
  End If
  Err.Clear
End If

' --- METHOD 4: Get most recent email (fallback) ---
If objMail Is Nothing Then
  WScript.Echo "DEBUG: Using Method 4 - Most recent email (FALLBACK)"
  Set objFolder = objNamespace.GetDefaultFolder(6) ' Inbox
  If Not objFolder Is Nothing Then
    Set objItems = objFolder.Items
    objItems.Sort "[ReceivedTime]", True
    For Each item In objItems
      If item.Class = 43 Then
        Set objMail = item
        WScript.Echo "DEBUG: Method 4 - Using: " & item.Subject
        Exit For
      End If
    Next
  End If
End If

' --- Extract Data ---
If objMail Is Nothing Then
  WScript.Echo "{""error"":""Email not found""}"
  WScript.Quit
End If

Dim fromVal, toVal, subjectVal, bodyVal, dateVal
fromVal = ""
toVal = ""
subjectVal = ""
bodyVal = ""
dateVal = ""

On Error Resume Next
fromVal = objMail.SenderEmailAddress
If Err.Number <> 0 Or fromVal = "" Then fromVal = objMail.SenderName
If Err.Number <> 0 Or fromVal = "" Then fromVal = "unknown"
Err.Clear

toVal = objMail.To
If Err.Number <> 0 Or IsNull(toVal) Then toVal = ""
Err.Clear

subjectVal = objMail.Subject
If Err.Number <> 0 Or IsNull(subjectVal) Then subjectVal = ""
Err.Clear

bodyVal = objMail.Body
If Err.Number <> 0 Or IsNull(bodyVal) Then bodyVal = ""
Err.Clear

dateVal = objMail.ReceivedTime
If Err.Number <> 0 Or IsNull(dateVal) Then dateVal = Now
Err.Clear
On Error Goto 0

' Format date as ISO
Dim isoDate
isoDate = Year(dateVal) & "-" & Right("00" & Month(dateVal), 2) & "-" & Right("00" & Day(dateVal), 2) & "T" & Right("00" & Hour(dateVal), 2) & ":" & Right("00" & Minute(dateVal), 2) & ":00"

' Escape JSON
Function EscapeJSON(txt)
  If IsNull(txt) Or txt = "" Then
    EscapeJSON = ""
    Exit Function
  End If
  Dim result, i, ch
  result = ""
  For i = 1 To Len(txt)
    ch = Mid(txt, i, 1)
    If ch = Chr(34) Then ' "
      result = result & "\\" & Chr(34)
    ElseIf ch = Chr(92) Then ' \\
      result = result & "\\\\"
    ElseIf ch = Chr(10) Then ' LF
      result = result & "\\n"
    ElseIf ch = Chr(13) Then ' CR
      result = result & "\\r"
    ElseIf ch = Chr(9) Then ' Tab
      result = result & "\\t"
    ElseIf Asc(ch) >= 32 And Asc(ch) <= 126 Then
      result = result & ch
    Else
      result = result & " "
    End If
  Next
  EscapeJSON = result
End Function

' Parse To field
Dim toArray, toJSON, j
toJSON = ""
If toVal <> "" Then
  toArray = Split(toVal, ";")
  For j = 0 To UBound(toArray)
    If j > 0 Then toJSON = toJSON & ","
    toJSON = toJSON & """" & EscapeJSON(Trim(toArray(j))) & """"
  Next
End If

' Output single-line JSON
WScript.Echo "{""from"":""" & EscapeJSON(fromVal) & """,""to"":[" & toJSON & "],""subject"":""" & EscapeJSON(subjectVal) & """,""body"":""" & EscapeJSON(bodyVal) & """,""date"":""" & isoDate & """}"
`;
}

/**
 * Legacy PowerShell method (not used)
 */
async function getOutlookEmailContent(metadata) {
  return {
    from: "",
    subject: metadata.subject || "Geen onderwerp",
    body: "",
    date: new Date().toISOString(),
  };
}

module.exports = {
  getOutlookEmailContent,
  getOutlookEmailContentVBScript,
};
