import { useState, useEffect, useCallback } from 'react';
import type { StudentProfileData } from '../services/apiClient';
import { INDIAN_STATES } from '../constants/states';

// TypeScript declarations for Web Speech API
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

interface VoiceSearchProps {
  onFiltersExtracted: (filters: Partial<StudentProfileData>) => void;
  onTranscript?: (transcript: string) => void;
  t: (en: string, hi: string, ta: string, te: string) => string;
  compact?: boolean;
}

// Parse speech and extract filter values
function parseVoiceInput(transcript: string): Partial<StudentProfileData> {
  const text = transcript.toLowerCase();
  const filters: Partial<StudentProfileData> = {};

  // Match state
  for (const state of INDIAN_STATES) {
    if (text.includes(state.en.toLowerCase())) {
      filters.state = state.en;
      break;
    }
  }

  // Match gender
  if (text.includes('female') || text.includes('woman') || text.includes('girl')) {
    filters.gender = 'female';
  } else if (text.includes('male') || text.includes('man') || text.includes('boy')) {
    filters.gender = 'male';
  }

  // Match category
  if (text.includes('scheduled caste') || text.match(/\bsc\b/)) {
    filters.category = 'SC';
  } else if (text.includes('scheduled tribe') || text.match(/\bst\b/)) {
    filters.category = 'ST';
  } else if (text.includes('obc') || text.includes('other backward')) {
    filters.category = 'OBC';
  } else if (text.includes('general')) {
    filters.category = 'General';
  }

  // Match education level
  if (text.includes('postgraduate') || text.includes('post graduate') || text.match(/\bpg\b/) || text.includes('masters')) {
    filters.educationLevel = 'postgraduate';
  } else if (text.includes('undergraduate') || text.includes('under graduate') || text.match(/\bug\b/) || text.includes('bachelor') || text.includes('degree')) {
    filters.educationLevel = 'undergraduate';
  } else if (text.includes('class 12') || text.includes('12th') || text.includes('twelfth')) {
    filters.educationLevel = 'class_12';
  } else if (text.includes('class 11') || text.includes('11th') || text.includes('eleventh')) {
    filters.educationLevel = 'class_11';
  } else if (text.includes('class 10') || text.includes('10th') || text.includes('tenth')) {
    filters.educationLevel = 'class_10';
  } else if (text.includes('class 9') || text.includes('9th') || text.includes('ninth')) {
    filters.educationLevel = 'class_9';
  } else if (text.includes('professional')) {
    filters.educationLevel = 'professional';
  }

  // Match course/field
  if (text.includes('engineering') || text.includes('engineer') || text.includes('btech') || text.includes('b.tech')) {
    filters.course = 'engineering';
  } else if (text.includes('medical') || text.includes('medicine') || text.includes('mbbs') || text.includes('doctor')) {
    filters.course = 'medical';
  } else if (text.includes('science') || text.includes('bsc') || text.includes('b.sc')) {
    filters.course = 'science';
  } else if (text.includes('commerce') || text.includes('bcom') || text.includes('b.com') || text.includes('accounting')) {
    filters.course = 'commerce';
  } else if (text.includes('law') || text.includes('legal') || text.includes('llb')) {
    filters.course = 'law';
  } else if (text.includes('management') || text.includes('mba') || text.includes('business')) {
    filters.course = 'management';
  } else if (text.includes('arts') || text.includes('humanities') || text.includes('ba ') || text.includes('b.a')) {
    filters.course = 'arts';
  }

  // Match income (approximate matching)
  if (text.includes('below 1 lakh') || text.includes('less than 1 lakh') || text.includes('under 1 lakh')) {
    filters.income = '100000';
  } else if (text.includes('1 to 2 lakh') || text.includes('1-2 lakh') || text.includes('one to two')) {
    filters.income = '200000';
  } else if (text.includes('2 to 3 lakh') || text.includes('2-3 lakh') || text.includes('two to three')) {
    filters.income = '300000';
  } else if (text.includes('3 to 5 lakh') || text.includes('3-5 lakh') || text.includes('three to five')) {
    filters.income = '500000';
  } else if (text.includes('5 to 8 lakh') || text.includes('5-8 lakh') || text.includes('five to eight')) {
    filters.income = '800000';
  } else if (text.includes('above 8 lakh') || text.includes('more than 8') || text.includes('over 8 lakh')) {
    filters.income = '1000000';
  }

  // Match area
  if (text.includes('rural') || text.includes('village')) {
    filters.area = 'rural';
  } else if (text.includes('urban') || text.includes('city')) {
    filters.area = 'urban';
  }

  // Match religion
  if (text.includes('hindu')) {
    filters.religion = 'Hindu';
  } else if (text.includes('muslim') || text.includes('islam')) {
    filters.religion = 'Muslim';
  } else if (text.includes('christian')) {
    filters.religion = 'Christian';
  } else if (text.includes('sikh')) {
    filters.religion = 'Sikh';
  } else if (text.includes('buddhist')) {
    filters.religion = 'Buddhist';
  } else if (text.includes('jain')) {
    filters.religion = 'Jain';
  }

  // Match disability
  if (text.includes('disability') || text.includes('disabled') || text.includes('handicap')) {
    filters.disability = true;
  }

  return filters;
}

export default function VoiceSearch({ onFiltersExtracted, onTranscript, t, compact = false }: VoiceSearchProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(true);

  useEffect(() => {
    // Check if Web Speech API is supported
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setIsSupported(false);
    }
  }, []);

  const startListening = useCallback(() => {
    setError(null);
    setTranscript('');

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-IN'; // Indian English

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
        } else {
          interimTranscript += result[0].transcript;
        }
      }

      const currentTranscript = finalTranscript || interimTranscript;
      setTranscript(currentTranscript);

      // When we have final results, parse and apply filters
      if (finalTranscript) {
        onTranscript?.(finalTranscript);
        const filters = parseVoiceInput(finalTranscript);
        if (Object.keys(filters).length > 0) {
          onFiltersExtracted(filters);
        }
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      setIsListening(false);
      if (event.error === 'no-speech') {
        setError(t('No speech detected', 'कोई आवाज़ नहीं मिली', 'பேச்சு கண்டறியப்படவில்லை', 'మాట గుర్తించబడలేదు'));
      } else if (event.error === 'not-allowed') {
        setError(t('Microphone access denied', 'माइक्रोफ़ोन अनुमति अस्वीकृत', 'மைக்ரோஃபோன் அணுகல் மறுக்கப்பட்டது', 'మైక్రోఫోన్ యాక్సెస్ నిరాకరించబడింది'));
      } else {
        setError(t('Error occurred', 'त्रुटि हुई', 'பிழை ஏற்பட்டது', 'లోపం సంభవించింది'));
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  }, [onFiltersExtracted, t]);

  if (!isSupported) {
    return null; // Don't render if not supported
  }

  // Compact mode - just a button
  if (compact) {
    return (
      <button
        onClick={startListening}
        disabled={isListening}
        title={isListening
          ? t('Listening...', 'सुन रहा हूं...', 'கேட்கிறேன்...', 'వింటున్నాను...')
          : t('Search by Voice', 'आवाज़ से खोजें', 'குரல் மூலம் தேடுங்கள்', 'వాయిస్ ద్వారా శోధించండి')
        }
        className={`
          flex items-center justify-center p-3 rounded-xl font-medium
          transition-all duration-200
          ${isListening
            ? 'bg-red-500 text-white animate-pulse'
            : 'bg-teal-600 text-white hover:bg-teal-700'
          }
        `}
      >
        <svg
          className={`w-5 h-5 ${isListening ? 'animate-pulse' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
          />
        </svg>
      </button>
    );
  }

  // Full mode with transcript display
  return (
    <div className="relative">
      <button
        onClick={startListening}
        disabled={isListening}
        className={`
          flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl font-medium
          transition-all duration-200
          ${isListening
            ? 'bg-red-500 text-white animate-pulse'
            : 'bg-gradient-to-r from-teal-600 to-teal-700 text-white hover:from-teal-700 hover:to-teal-800 shadow-lg hover:shadow-xl'
          }
        `}
      >
        {/* Microphone Icon */}
        <svg
          className={`w-5 h-5 ${isListening ? 'animate-pulse' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
          />
        </svg>

        {isListening
          ? t('Listening...', 'सुन रहा हूं...', 'கேட்கிறேன்...', 'వింటున్నాను...')
          : t('Search by Voice', 'आवाज़ से खोजें', 'குரல் மூலம் தேடுங்கள்', 'వాయిస్ ద్వారా శోధించండి')
        }
      </button>

      {/* Transcript display */}
      {(transcript || isListening) && (
        <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-xs text-gray-500 mb-1">
            {t('You said:', 'आपने कहा:', 'நீங்கள் சொன்னது:', 'మీరు చెప్పింది:')}
          </p>
          <p className="text-sm text-gray-800 italic">
            {transcript || (
              <span className="text-gray-400">
                {t('Speak now...', 'अब बोलें...', 'இப்போது பேசுங்கள்...', 'ఇప్పుడు మాట్లాడండి...')}
              </span>
            )}
          </p>
        </div>
      )}

      {/* Error display */}
      {error && (
        <div className="mt-2 p-2 bg-red-50 text-red-600 text-xs rounded-lg">
          {error}
        </div>
      )}

      {/* Help text */}
      <p className="mt-2 text-xs text-gray-500 text-center">
        {t(
          'Try: "Engineering student from Tamil Nadu"',
          'कहें: "तमिलनाडु से इंजीनियरिंग छात्र"',
          'சொல்லுங்கள்: "தமிழ்நாட்டில் இருந்து பொறியியல் மாணவர்"',
          'చెప్పండి: "తమిళనాడు నుండి ఇంజినీరింగ్ విద్యార్థి"'
        )}
      </p>
    </div>
  );
}
