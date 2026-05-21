import { Clipboard, closeMainWindow, getPreferenceValues, showToast, Toast } from "@raycast/api";
import { showFailureToast } from "@raycast/utils";
import { unlink } from "fs/promises";
import tesseractOcr from "./ocr";
import utils from "./utils";
import takeScreenshot from "./screenshot";
import { detect, LanguageCodeFormat } from "raycast-language-detector";
import type { Preferences } from "./preferences";

export default async function main() {
  const isTesseractInstalled = await utils.isTesseractInstalled();

  if (!isTesseractInstalled) {
    await showToast({
      style: Toast.Style.Failure,
      title: "Tesseract not found, check README!",
      message: "Tesseract path not found or it is not installed, check README for more info!",
    });
    return;
  }

  let defaultLangCode = getPreferenceValues<Preferences>().tesseract_lang.toLowerCase().replace(/\s+/g, "");

  // Fall back to English if the configured language code is invalid.
  if (!utils.isValidLanguage(defaultLangCode)) {
    defaultLangCode = "eng";
  }

  await closeMainWindow();

  await showToast({
    style: Toast.Style.Animated,
    title: "Select an area",
    message: "Use Windows Screen Snip to capture the text area.",
  });

  const filePath = await takeScreenshot();

  try {
    let text = await tesseractOcr(filePath, defaultLangCode);
    text = utils.normalizeChinesePunctuation(text);
    text = utils.handleNewLines(text);

    let languageUsed = defaultLangCode;

    if (!text.trim()) {
      await showToast({
        style: Toast.Style.Failure,
        title: `No text found on image!`,
        message: `No text found on image!`,
      });
      return;
    }

    const autodetectLanguage = defaultLangCode.includes("+") ? undefined : await autoDetectedLanguage(text);

    if (
      autodetectLanguage?.languageCode &&
      utils.isValidLanguage(autodetectLanguage?.languageCode) &&
      autodetectLanguage?.languageCode !== defaultLangCode
    ) {
      try {
        let detectedText = await tesseractOcr(filePath, autodetectLanguage.languageCode);
        detectedText = utils.normalizeChinesePunctuation(detectedText);
        detectedText = utils.handleNewLines(detectedText);

        if (detectedText.trim()) {
          text = detectedText;
          languageUsed = autodetectLanguage.languageName ?? autodetectLanguage.languageCode;
        }
      } catch {
        languageUsed = defaultLangCode;
      }
    }

    await Clipboard.copy(text);
    await showToast({
      style: Toast.Style.Success,
      title: `Text copied to clipboard! Language: ${languageUsed}`,
      message: `Text copied to clipboard! Language: ${languageUsed}`,
    });
  } catch (e) {
    await showFailureToast(e, { title: "Failed to OCR the image" });
  } finally {
    await removeTemporaryFile(filePath);
  }
}

async function autoDetectedLanguage(text: string) {
  if (!getPreferenceValues<Preferences>().autodetect_lang) {
    return;
  }

  // Detect language
  return detect(text, {
    languageCodeFormat: LanguageCodeFormat.ISO_639_3,
  });
}

async function removeTemporaryFile(filePath: string) {
  try {
    await unlink(filePath);
  } catch {
    // The OCR result is more important than failing on best-effort cleanup.
  }
}
