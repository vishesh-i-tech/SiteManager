// Speech Recognition Utility with NLU / Keyword extraction for Hindi and English

export interface ExtractedSiteData {
  name: string;
  location: string;
  budget: number;
  siteType: 'Building' | 'Residential' | 'Commercial' | 'Road' | 'Dam' | 'Bridge' | 'Renovation' | 'Industrial' | 'Apartment' | 'Other';
  notes: string;
  rawTranscript: string;
}

// Check if browser supports Web Speech API
export const isSpeechSupported = (): boolean => {
  return typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
};

export const parseSiteVoiceTranscript = (transcript: string): ExtractedSiteData => {
  const clean = transcript.toLowerCase();
  let name = '';
  let location = '';
  let budget = 0;
  let siteType: ExtractedSiteData['siteType'] = 'Residential';
  let notes = transcript;

  // 1. Extract Budget (Handles "5 lakh", "12 लाख", "50 hazar", "50 हजार", "400000", etc.)
  const lakhMatch = transcript.match(/(\d+(?:\.\d+)?)\s*(?:lakh|lac|लाख)/i);
  const hazarMatch = transcript.match(/(\d+(?:\.\d+)?)\s*(?:hazar|thousand|हजार)/i);
  const directNumberMatch = transcript.match(/(?:budget|बजट|rupees|रुपये|cost|amount)?\s*(?:of|is|:)?\s*(\d{4,9})/i);

  if (lakhMatch) {
    budget = parseFloat(lakhMatch[1]) * 100000;
  } else if (hazarMatch) {
    budget = parseFloat(hazarMatch[1]) * 1000;
  } else if (directNumberMatch) {
    budget = parseInt(directNumberMatch[1], 10);
  }

  // 2. Extract Location
  const locMatchHi = transcript.match(/(?:लोकेशन|जगह|स्थान|एड्रेस)\s*(?:है|:)?\s*([^,\.]+)/i);
  const locMatchEn = transcript.match(/(?:location|address|at|in|near)\s*(?:is|:)?\s*([^,\.]+)/i);
  if (locMatchHi) {
    location = locMatchHi[1].trim();
  } else if (locMatchEn) {
    location = locMatchEn[1].trim();
  }

  // 3. Extract Site Name
  const nameMatchHi = transcript.match(/(?:साइट का नाम|नाम)\s*(?:है|:)?\s*([^,\.]+)/i);
  const nameMatchEn = transcript.match(/(?:site name|name)\s*(?:is|:)?\s*([^,\.]+)/i);
  if (nameMatchHi) {
    name = nameMatchHi[1].trim();
  } else if (nameMatchEn) {
    name = nameMatchEn[1].trim();
  } else {
    // If no explicit keyword, take the first segment
    const parts = transcript.split(/,|बजट|लोकेशन|budget|location/i);
    if (parts.length > 0 && parts[0].trim().length > 2) {
      name = parts[0].replace(/साइट/i, '').replace(/site/i, '').trim();
    }
  }

  // 4. Extract Site Type
  if (/commercial|दुकान|प्लाजा|कॉम्प्लेक्स|होटल/i.test(clean)) {
    siteType = 'Commercial';
  } else if (/road|सड़क|हाईवे/i.test(clean)) {
    siteType = 'Road';
  } else if (/bridge|पुल|फ्लाईओवर/i.test(clean)) {
    siteType = 'Bridge';
  } else if (/apartment|फ्लैट|सोसायटी/i.test(clean)) {
    siteType = 'Apartment';
  } else if (/renovation|रिपेयर|मरम्मत/i.test(clean)) {
    siteType = 'Renovation';
  } else if (/dam|बाँध|डैम/i.test(clean)) {
    siteType = 'Dam';
  } else {
    siteType = 'Residential';
  }

  return {
    name: name || 'New Construction Site',
    location: location || 'Main Site Area',
    budget: budget || 500000,
    siteType,
    notes,
    rawTranscript: transcript,
  };
};

export class VoiceAssistantSession {
  private recognition: any = null;
  public isListening = false;
  private onResult: (text: string) => void;
  private onError: (err: string) => void;
  private onEnd: () => void;
  private lang: string;

  constructor(
    onResult: (text: string) => void,
    onError: (err: string) => void,
    onEnd: () => void,
    lang: string = 'hi-IN'
  ) {
    this.onResult = onResult;
    this.onError = onError;
    this.onEnd = onEnd;
    this.lang = lang;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = this.lang;

      this.recognition.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          finalTranscript += event.results[i][0].transcript;
        }
        this.onResult(finalTranscript);
      };

      this.recognition.onerror = (event: any) => {
        this.isListening = false;
        this.onError(event.error || 'Voice recognition error');
      };

      this.recognition.onend = () => {
        this.isListening = false;
        this.onEnd();
      };
    }
  }


  start() {
    if (this.recognition && !this.isListening) {
      try {
        this.isListening = true;
        this.recognition.start();
      } catch (err) {
        console.warn('SpeechRecognition already started or failed', err);
      }
    }
  }

  stop() {
    if (this.recognition && this.isListening) {
      this.isListening = false;
      try {
        this.recognition.stop();
      } catch (err) {
        console.warn('SpeechRecognition stop error', err);
      }
    }
  }
}
