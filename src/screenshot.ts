import { environment } from "@raycast/api";
import { showFailureToast } from "@raycast/utils";
import util from "util";
import { execFile } from "child_process";
import path from "path";
import fs from "fs";

const execFilePromise = util.promisify(execFile);

export default async function takeScreenshot() {
  fs.mkdirSync(environment.supportPath, { recursive: true });
  const filePath = path.join(environment.supportPath, `${Date.now()}.png`);

  try {
    if (process.platform === "win32") {
      await takeWindowsScreenshot(filePath);
    } else if (process.platform === "darwin") {
      await execFilePromise("/usr/sbin/screencapture", ["-i", filePath]);
    } else {
      throw new Error("Easy OCR only supports Windows and macOS screenshots.");
    }
  } catch (e) {
    await showFailureToast(e, { title: "Failed to capture screenshot" });
    throw e;
  }

  return filePath;
}

async function takeWindowsScreenshot(filePath: string) {
  const script = `
$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

function Get-ClipboardImagePngBytes {
  try {
    if (-not [System.Windows.Forms.Clipboard]::ContainsImage()) {
      return $null
    }

    $image = [System.Windows.Forms.Clipboard]::GetImage()
    if ($null -eq $image) {
      return $null
    }

    $stream = New-Object System.IO.MemoryStream
    try {
      $image.Save($stream, [System.Drawing.Imaging.ImageFormat]::Png)
      return $stream.ToArray()
    } finally {
      $stream.Dispose()
      $image.Dispose()
    }
  } catch {
    return $null
  }
}

function Get-Sha256Base64($bytes) {
  if ($null -eq $bytes) {
    return $null
  }

  $sha = [System.Security.Cryptography.SHA256]::Create()
  try {
    return [Convert]::ToBase64String($sha.ComputeHash($bytes))
  } finally {
    $sha.Dispose()
  }
}

$outputPath = $env:RAYCAST_OCR_OUTPUT
$timeoutSeconds = 30
if ($env:RAYCAST_OCR_TIMEOUT) {
  $timeoutSeconds = [int]$env:RAYCAST_OCR_TIMEOUT
}

$initialBytes = Get-ClipboardImagePngBytes
$initialHash = Get-Sha256Base64 $initialBytes

try {
  Start-Process "ms-screenclip:"
} catch {
  Start-Process "explorer.exe" "ms-screenclip:"
}

$deadline = (Get-Date).AddSeconds($timeoutSeconds)
while ((Get-Date) -lt $deadline) {
  $bytes = Get-ClipboardImagePngBytes
  $hash = Get-Sha256Base64 $bytes

  if ($null -ne $bytes -and $hash -ne $initialHash) {
    [System.IO.File]::WriteAllBytes($outputPath, $bytes)
    exit 0
  }

  Start-Sleep -Milliseconds 250
}

Write-Error "Timed out waiting for a new screenshot in the clipboard. Capture an area after Screen Snip opens."
exit 2
`;

  const encodedCommand = Buffer.from(script, "utf16le").toString("base64");

  await execFilePromise(
    "powershell.exe",
    ["-NoProfile", "-ExecutionPolicy", "Bypass", "-Sta", "-EncodedCommand", encodedCommand],
    {
      env: {
        ...process.env,
        RAYCAST_OCR_OUTPUT: filePath,
        RAYCAST_OCR_TIMEOUT: "30",
      },
      timeout: 35_000,
      windowsHide: true,
    }
  );
}
