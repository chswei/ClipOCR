# ClipOCR

ClipOCR is a Raycast extension that extracts text from a selected screen area on Windows. It opens Windows Screen Snip, saves the captured image from the clipboard, runs local Tesseract OCR, and copies the recognized text back to your clipboard.

This extension is a Windows-friendly port inspired by the original ClipOCR extension for macOS.

## Features

- Area OCR with Windows Screen Snip
- Local OCR through Tesseract
- Mixed-language OCR such as `chi_tra+eng`
- Configurable Tesseract page segmentation mode
- Optional cleanup for Chinese punctuation and common OCR punctuation mistakes
- Newline handling for plain text, preserved newlines, or `<br>` output

## Requirements

- Raycast for Windows
- Tesseract OCR installed locally
- Tesseract language data for every language you want to recognize

## Install Tesseract

Install Tesseract on Windows:

```powershell
winget install UB-Mannheim.TesseractOCR
```

The default Tesseract binary path is:

```text
C:\Program Files\Tesseract-OCR\tesseract.exe
```

Verify the installation:

```powershell
& "C:\Program Files\Tesseract-OCR\tesseract.exe" -v
```

## Install Language Data

Tesseract usually installs English by default. For Traditional Chinese, download `chi_tra.traineddata` and place it in:

```text
C:\Program Files\Tesseract-OCR\tessdata
```

Recommended language data:

- Fast, smaller, quicker: https://github.com/tesseract-ocr/tessdata_fast
- Best, larger, usually more accurate: https://github.com/tesseract-ocr/tessdata_best

For mixed Traditional Chinese and English OCR, install both:

```text
C:\Program Files\Tesseract-OCR\tessdata\chi_tra.traineddata
C:\Program Files\Tesseract-OCR\tessdata\eng.traineddata
```

Verify available languages:

```powershell
& "C:\Program Files\Tesseract-OCR\tesseract.exe" --list-langs
```

## Recommended Settings

For Traditional Chinese and English:

```text
Tesseract language: chi_tra+eng
```

For Simplified Chinese and English:

```text
Tesseract language: chi_sim+eng
```

Page segmentation mode:

- `Single uniform block of text`: best default for selected paragraphs and most snippets
- `Single text line`: best for one-line titles, labels, buttons, or table cells
- `Fully automatic page segmentation`: useful for larger, more complex screenshots
- `Sparse text`: useful when text is scattered across the selected image

Keep `Chinese punctuation cleanup` enabled for Chinese or mixed Chinese-English text. It normalizes common half-width punctuation around Chinese text and fixes a few frequent OCR punctuation mistakes.

## Usage

1. Run the `Area OCR` command in Raycast.
2. Select a screen area using Windows Screen Snip.
3. Wait for the success toast.
4. Paste the recognized text from the clipboard.

## Development

Install dependencies:

```powershell
npm install
```

Start the extension in development mode:

```powershell
npm run dev
```

Validate before publishing:

```powershell
npm run lint
npm run build
```

Publish:

```powershell
npm run publish
```

## Troubleshooting

If Tesseract is not found, set `Tesseract binary path` in Raycast preferences to:

```text
C:\Program Files\Tesseract-OCR\tesseract.exe
```

If Chinese is not recognized, make sure `chi_tra.traineddata` or `chi_sim.traineddata` exists in the Tesseract `tessdata` folder and appears in `tesseract --list-langs`.

If punctuation or OCR accuracy is poor, try replacing `tessdata_fast` files with `tessdata_best` files.
