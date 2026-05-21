# ClipOCR Changelog

## [Enhancements] - {PR_MERGE_DATE}

- Added Windows support using Windows Screen Snip and clipboard image capture.
- Added support for mixed Tesseract language codes such as `chi_tra+eng`.
- Added configurable Tesseract page segmentation mode.
- Added Chinese punctuation cleanup for mixed Chinese-English OCR.
- Replaced shell-based OCR wrapper with direct `execFile` calls to Tesseract.
- Added English and Traditional Chinese documentation.

## [Enhancements] - 2025-04-15

- Added automatic language detection option with either Raycast AI, Franc, LanguageDetect or Tinyld
- Language used for OCR is now being displayed on successful OCR toast
- Added fallback language (english) if user types wrong language code in options

## [Bug Fixes] - 2025-03-26

- Fixed error when running command twice in short time (not visible to user)
- Updated extension description

## [Enhancements] - 2023-11-13

- Add support for additional Tesseract languages

## [Initial Version] - 2023-10-19
