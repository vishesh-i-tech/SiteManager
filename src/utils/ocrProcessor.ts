import { createWorker } from 'tesseract.js';
import type { LabourEntry } from '../types/index.ts';

export interface RegisterValidationStatus {
  isLikelyRegister: boolean;
  confidence: number;
  detectedSignals: {
    hasAttendanceTokens: boolean;
    hasRoleTokens: boolean;
    hasWageTokens: boolean;
    hasNumberedRows: boolean;
    validRowCount: number;
  };
  warningMessage?: string;
}

export interface OcrProcessingResult {
  rawText: string;
  confidence: number;
  extractedEntries: LabourEntry[];
  validation: RegisterValidationStatus;
}

// Preprocess image on canvas to enhance contrast for handwritten notes
export const preprocessImageForOcr = async (imageSrc: string): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(imageSrc);
        return;
      }

      canvas.width = img.width;
      canvas.height = img.height;

      // Draw image
      ctx.drawImage(img, 0, 0);

      // Convert to Grayscale & boost contrast
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;

      for (let i = 0; i < data.length; i += 4) {
        const avg = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
        // Contrast enhancement threshold
        const enhanced = avg > 140 ? 255 : avg < 90 ? 0 : avg;
        data[i] = enhanced; // Red
        data[i + 1] = enhanced; // Green
        data[i + 2] = enhanced; // Blue
      }

      ctx.putImageData(imgData, 0, 0);
      resolve(canvas.toDataURL('image/jpeg', 0.9));
    };
    img.onerror = () => resolve(imageSrc);
    img.src = imageSrc;
  });
};

/**
 * Validates whether the OCR text resembles a handwritten or printed attendance muster roll.
 * Evaluates multiple orthogonal signals: attendance tokens, role tokens, wage numbers,
 * numbered list structure, and plausible worker muster rows.
 */
export const validateRegisterContent = (
  rawText: string,
  confidence: number,
  extractedCount: number
): RegisterValidationStatus => {
  if (!rawText || !rawText.trim()) {
    return {
      isLikelyRegister: false,
      confidence: 0,
      detectedSignals: {
        hasAttendanceTokens: false,
        hasRoleTokens: false,
        hasWageTokens: false,
        hasNumberedRows: false,
        validRowCount: 0,
      },
      warningMessage: 'No text was detected in this image. Please ensure the handwritten register is clearly visible under good lighting.',
    };
  }

  // 1. Attendance marker tokens (P, A, H, Half, Present, Absent, Hindi muster tokens)
  const hasAttendanceTokens =
    /\b(present|absent|half|pre|abs|haajri|hajira|muster|roll|attendance|हाजिरी|हाजरी|उपस्थित|अनुपस्थित|आधा|दिन|खाता|मस्टर)\b/i.test(rawText) ||
    /(?:^|\s)[PAHpah](?:$|\s|[0-9\.\-\/])/m.test(rawText);

  // 2. Trade role tokens (Mason, Helper, Mistry, Carpenter, etc.)
  const hasRoleTokens =
    /\b(mason|helper|mistry|mistri|rajmistry|carpenter|plumber|electrician|painter|supervisor|welder|मिस्त्री|हेल्पर|राजमिस्त्री|बढ़ई|कारीगर|मजदूर|लेबर|बेलदार)\b/i.test(
      rawText
    );

  // 3. Realistic daily wage numbers (₹200 to ₹3000)
  const hasWageTokens = /\b([2-9]\d{2}|[1-2]\d{3})\b/.test(rawText);

  // 4. Tabular or numbered list structure (1., 2), 3 -, etc.)
  const hasNumberedRows = /(?:^|\n)\s*(?:\d{1,2}[\.\-\)]|[#\*\-•])\s+/m.test(rawText);

  // Conservative heuristic evaluation:
  // Requires at least 2 independent signals, or at least 2 parsed rows with at least 1 domain token.
  let isLikelyRegister = false;
  let signalScore = 0;
  if (hasAttendanceTokens) signalScore += 1;
  if (hasRoleTokens) signalScore += 1;
  if (hasWageTokens) signalScore += 1;
  if (hasNumberedRows) signalScore += 1;

  if (signalScore >= 2) {
    isLikelyRegister = true;
  } else if (extractedCount >= 2 && signalScore >= 1) {
    isLikelyRegister = true;
  } else if (extractedCount >= 3) {
    isLikelyRegister = true;
  }

  let warningMessage: string | undefined;
  if (!isLikelyRegister) {
    warningMessage =
      'This image does not appear to be an attendance register. No attendance markers, contractor trade roles, or structured muster rows were recognized.';
  } else if (confidence < 40) {
    warningMessage =
      'Low OCR confidence detected. Handwritten text may be faint or skewed. Please review all worker rows and wages carefully before saving.';
  }

  return {
    isLikelyRegister,
    confidence,
    detectedSignals: {
      hasAttendanceTokens,
      hasRoleTokens,
      hasWageTokens,
      hasNumberedRows,
      validRowCount: extractedCount,
    },
    warningMessage,
  };
};

// Parse raw OCR lines into structured labour entries
export const parseOcrTextToLabourEntries = (rawText: string, recordId: string): LabourEntry[] => {
  if (!rawText || !rawText.trim()) return [];

  const lines = rawText
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 2);
  const entries: LabourEntry[] = [];

  lines.forEach((line, index) => {
    // Strip leading serial numbers (e.g., "1.", "02 -", "3)")
    const cleaned = line.replace(/^[0-9]+[\.\-\)\s]+/, '').trim();
    if (cleaned.length < 2) return;

    // Check for domain muster tokens to prevent turning random text lines into worker rows
    const hasStatusToken =
      /\b(?:half|आधा|0\.5|absent|अनुपस्थित|abs|present|उपस्थित)\b/i.test(cleaned) ||
      /(?:^|\s)[PAHpah](?:$|\s|[0-9\.\-\/])/m.test(cleaned);
    const hasRoleToken =
      /mason|मिस्त्री|राज|mistry|mistri|helper|हेल्पर|electric|तार|बिजली|plumb|पाइप|नल|carpenter|बढ़ई|लकड़ी|painter|पेंट/i.test(
        cleaned
      );
    const wageMatches = cleaned.match(/\b([2-9]\d{2}|[1-2]\d{3})\b/);
    const hasWageToken = !!wageMatches;

    // If the line has no attendance status, no role, and no realistic wage number,
    // skip it as non-muster text (e.g. document headers, dates, ambient photo noise)
    if (!hasStatusToken && !hasRoleToken && !hasWageToken) {
      return;
    }

    // Detect attendance status
    let attendanceStatus: LabourEntry['attendanceStatus'] = 'full_day';
    if (/\b(?:half|आधा|0\.5)\b|\bH\b/i.test(cleaned)) {
      attendanceStatus = 'half_day';
    } else if (
      /\b(?:absent|अनुपस्थित|abs)\b|\bA\b/i.test(cleaned) &&
      !/mason|helper/i.test(cleaned)
    ) {
      attendanceStatus = 'absent';
    } else {
      attendanceStatus = 'full_day';
    }

    // Detect Role
    let role: LabourEntry['role'] = 'Helper';
    if (/mason|मिस्त्री|राज|mistry|mistri/i.test(cleaned)) role = 'Mason';
    else if (/electric|तार|बिजली/i.test(cleaned)) role = 'Electrician';
    else if (/plumb|पाइप|नल/i.test(cleaned)) role = 'Plumber';
    else if (/carpenter|बढ़ई|लकड़ी/i.test(cleaned)) role = 'Carpenter';
    else if (/painter|पेंट/i.test(cleaned)) role = 'Painter';

    // Daily wage: ONLY if explicitly extracted from the line.
    // NEVER silently guess or default to ₹550/₹900. If missing, set to 0 (unverified).
    const dailyWage = wageMatches ? parseInt(wageMatches[1], 10) : 0;

    // Clean name: remove numbers and recognized role/status keywords with word boundaries
    let workerName = cleaned
      .replace(/\b([2-9]\d{2}|[1-2]\d{3})\b/g, '')
      .replace(
        /\b(?:mason|helper|plumber|electrician|mistry|mistri|full|half|absent|present|[pah])\b/gi,
        ''
      )
      .replace(/(?:मिस्त्री|हेल्पर|राजमिस्त्री|बढ़ई|कारीगर|हाजिरी|उपस्थित|अनुपस्थित)/g, '')
      .replace(/[^\w\s\u0900-\u097F]/gi, '')
      .replace(/\s+/g, ' ')
      .trim();

    // If the remaining name is empty or gibberish, do NOT invent "Worker 1".
    // Set to empty string so the UI can prompt the contractor to enter a real name.
    if (workerName.length < 2) {
      workerName = '';
    }

    // Calculate paidAmount strictly from explicit wage and attendanceStatus
    let paidAmount = 0;
    if (dailyWage > 0) {
      if (attendanceStatus === 'half_day') paidAmount = Math.round(dailyWage * 0.5);
      else if (attendanceStatus === 'absent') paidAmount = 0;
      else paidAmount = dailyWage;
    }

    entries.push({
      id: `ocr-entry-${Date.now()}-${index}`,
      recordId,
      workerName,
      role,
      attendanceStatus,
      dailyWage,
      paidAmount,
      balanceDue: 0,
    });
  });

  // Never invent fictional template workers like Subhash Mistry or Ramu Helper.
  // Return actual parsed rows or empty array.
  return entries;
};

export const runLabourRegisterOcr = async (
  imageDataUrl: string,
  recordId: string,
  onProgress?: (progress: number) => void
): Promise<OcrProcessingResult> => {
  try {
    const preprocessed = await preprocessImageForOcr(imageDataUrl);
    const worker = await createWorker('eng+hin', 1, {
      logger: (m) => {
        if (m.status === 'recognizing text' && onProgress) {
          onProgress(Math.round((m.progress || 0) * 100));
        }
      },
    });

    const ret = await worker.recognize(preprocessed);
    await worker.terminate();

    const rawText = ret.data.text || '';
    const confidence = ret.data.confidence || 0;
    const extractedEntries = parseOcrTextToLabourEntries(rawText, recordId);
    const validation = validateRegisterContent(rawText, confidence, extractedEntries.length);

    return {
      rawText,
      confidence,
      extractedEntries,
      validation,
    };
  } catch (error) {
    console.error('OCR processing error:', error);
    return {
      rawText: '',
      confidence: 0,
      extractedEntries: [],
      validation: {
        isLikelyRegister: false,
        confidence: 0,
        detectedSignals: {
          hasAttendanceTokens: false,
          hasRoleTokens: false,
          hasWageTokens: false,
          hasNumberedRows: false,
          validRowCount: 0,
        },
        warningMessage: 'OCR processing failed to read this image. Please retry or enter workers manually.',
      },
    };
  }
};
