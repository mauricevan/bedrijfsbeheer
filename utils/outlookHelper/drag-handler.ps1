# PowerShell script voor Outlook drag-and-drop detectie
# Dit script moet worden uitgevoerd als Windows service of via Task Scheduler

# Vereist: Windows PowerShell 5.1+
# Functie: Detecteert wanneer email uit Outlook wordt gesleept

Write-Host "Outlook Drag Handler - Monitoring Outlook voor drag events..."

# Check if Outlook is running
$outlookRunning = Get-Process -Name "OUTLOOK" -ErrorAction SilentlyContinue

if (-not $outlookRunning) {
    Write-Host "Outlook is niet actief. Start Outlook eerst."
    exit
}

# TODO: Implementeer Windows Shell drag-and-drop monitoring
# Dit vereist:
# - Windows COM interface voor Outlook
# - Shell drag-and-drop event handling
# - Data doorsturen naar helper server (localhost:8765)

Write-Host "Monitor actief. Wachtend op drag events..."
Write-Host "N.B.: Volledige implementatie vereist Windows native code (C#)"

# Placeholder - vereist native Windows implementatie
# Voor nu: gebruik de .eml export methode of clipboard detectie







