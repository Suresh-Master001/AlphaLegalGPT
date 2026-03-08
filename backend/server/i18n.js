/**
 * Backend Internationalization (i18n) Support
 * Provides translations for backend prompts, error messages, and responses
 * 
 * Supported Languages:
 * - English (en)
 * - Tamil (ta)
 */

// Translation strings for backend
const translations = {
  en: {
    // System prompt for Gemini
    systemPrompt: `You are AttorneyGPT, a helpful AI legal assistant. Based on the following legal context, provide a clear and user-friendly answer to the user's question.`,
    
    // Instructions for response generation
    instructions: `Instructions:
- Explain the law in simple terms
- Include the relevant section number
- Provide the legal title
- Keep it concise and helpful
- If no relevant law found, say so`,
    
    // Greeting responses
    greetings: {
      hello: "Hello! I'm AttorneyGPT, your AI legal assistant. I can help you understand the Indian Penal Code (IPC), Bharatiya Nyaya Sanhita 2023 (BNS), and case judgments. Feel free to ask any legal question!",
      thank: "You're welcome! If you have any more legal questions about IPC, BNS, or case judgments, feel free to ask.",
      help: "I can help you understand IPC sections (like 'What is IPC 420?'), BNS 2023 provisions, and case judgments. Just ask your legal question!"
    },
    
    // Error messages
    errors: {
      noReference: "I could not find an exact IPC reference for your question. Please consult a legal professional.",
      apiError: "I could not find an exact IPC reference for your question. Please consult a legal professional.",
      quotaExceeded: "AI enhancement is temporarily unavailable due to API quota/rate limits. Showing retrieval-based result:"
    },
    
    // Response format description
    responseFormat: `Response Format (JSON):
{
  "answer": "Your explanation in simple terms",
  "citations": ["Relevant sections"],
  "section_title": "Legal title of the section",
  "confidence": 0.0-1.0
}`
  },
  
  ta: {
    // System prompt for Gemini (Tamil)
    systemPrompt: `நீங்கள் AttorneyGPT ஆகும், உதவிகரமான AI சட்ட உதவியாளர். பின்வரும் சட்ட சூழலின் அடிப்படையில், பயனரின் கேள்விக்கு தெளிவான மற்றும் பயனர்-நட்பு பதிலை வழங்குங்கள்.`,
    
    // Instructions for response generation (Tamil)
    instructions: `வழிமுறைகள்:
- சட்டத்தை எளிய முறையில் விளக்குங்கள்
- தொடர்புடைய பிரிவு எண்ணைச் சேர்க்குங்கள்
- சட்டத் தலைப்பை வழங்குங்கள்
- சுருக்கமாகவும் உதவியாகவும் வைத்துக்கொள்ளுங்கள்
- தொடர்புடைய சட்டம் கிடைக்கவில்லை எனில் அதைக் கூடுங்கள்`,
    
    // Greeting responses (Tamil)
    greetings: {
      hello: "வணக்கம்! நான் AttorneyGPT, உங்கள் AI சட்ட உதவியாளர். இந்தியத் தண்டனைச் சட்டம் (IPC), பாரதிய நாயக சமிதா 2023 (BNS), மற்றும் வழக்குத் தீர்ப்புகளைப் புரிந்துகொள்ள உதவ முடியும். எந்த சட்ட கேள்வியையும் கேட்கலாம்!",
      thank: "மீண்டும் வருக! IPC, BNS அல்லது வழக்குத் தீர்ப்புகள் பற்றிய மேலும் சட்ட கேள்விகள் இருந்தால் கேட்கலாம்.",
      help: "IPC பிரிவுகள் (எ.கா. 'IPC 420 என்றால் என்ன?'), BNS 2023 விதிமுறைகள் மற்றும் வழக்குத் தீர்ப்புகளைப் புரிந்துகொள்ள உதவ முடியும். உங்கள் சட்ட கேள்வியைக் கேட்குங்கள்!"
    },
    
    // Error messages (Tamil)
    errors: {
      noReference: "உங்கள் கேள்விக்கு சரியான IPC குறிப்பைக் காண முடியவில்லை. தயவுசெய்து ஒரு சட்ட நிபுணரைக் கேளுங்கள்.",
      apiError: "உங்கள் கேள்விக்கு சரியான IPC குறிப்பைக் காண முடியவில்லை. தயவுசெய்து ஒரு சட்ட நிபுணரைக் கேளுங்கள்.",
      quotaExceeded: "API ஒதுக்கீடு/வீத வரம்பு பிரச்சினைகள் காரணமாக AI மேம்பாடு தற்காலிகமாக கிடைக்கவில்லை. மீட்டெடுப்பு-மட்டும் முடிவைக் காட்டுகிறது:"
    },
    
    // Response format description (Tamil)
    responseFormat: `பதில் வடிவம் (JSON):
{
  "answer": "எளிய முறையில் உங்கள் விளக்கம்",
  "citations": ["தொடர்புடைய பிரிவுகள்"],
  "section_title": "பிரிவின் சட்டத் தலைப்பு",
  "confidence": 0.0-1.0
}`
  }
};

/**
 * Get translation for a specific key
 * @param {string} language - Language code ('en' or 'ta')
 * @param {string} key - Translation key (dot notation supported, e.g., 'greetings.hello')
 * @param {object} params - Optional parameters for interpolation
 * @returns {string} - Translated string
 */
export function t(language, key, params = {}) {
  const lang = translations[language] || translations['en'];
  
  // Support dot notation for nested keys
  const keys = key.split('.');
  let value = lang;
  
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      // Fallback to English if key not found
      let fallback = translations['en'];
      for (const fk of keys) {
        if (fallback && typeof fallback === 'object' && fk in fallback) {
          fallback = fallback[fk];
        } else {
          return key; // Return key if not found
        }
      }
      return fallback;
    }
  }
  
  // Simple interpolation support
  if (typeof value === 'string' && Object.keys(params).length > 0) {
    return value.replace(/\{\{(\w+)\}\}/g, (match, paramKey) => {
      return params[paramKey] !== undefined ? params[paramKey] : match;
    });
  }
  
  return value;
}

/**
 * Get the full system prompt with instructions
 * @param {string} language - Language code ('en' or 'ta')
 * @returns {string} - Complete system prompt
 */
export function getSystemPrompt(language) {
  const lang = translations[language] || translations['en'];
  return `${lang.systemPrompt}\n\n${lang.instructions}\n\n${lang.responseFormat}`;
}

/**
 * Get greeting response based on query type
 * @param {string} query - User query
 * @param {string} language - Language code ('en' or 'ta')
 * @returns {string|null} - Greeting response or null if not a greeting
 */
export function getGreetingResponse(query, language) {
  const lang = translations[language] || translations['en'];
  const queryLower = query.toLowerCase();
  
  if (queryLower.includes('hello') || queryLower.includes('hi') || queryLower.includes('hey') || queryLower.includes('வணக்கம்') || queryLower.includes('ஹலோ')) {
    return {
      answer: lang.greetings.hello,
      citations: [],
      section_title: language === 'ta' ? 'வரவேற்பு' : 'Welcome',
      confidence: 1.0
    };
  }
  
  if (queryLower.includes('thank') || queryLower.includes('thanks') || queryLower.includes('நன்றி')) {
    return {
      answer: lang.greetings.thank,
      citations: [],
      section_title: language === 'ta' ? 'நன்றி' : 'Thanks',
      confidence: 1.0
    };
  }
  
  if (queryLower.includes('help') || queryLower.includes('what can you do') || queryLower.includes('உதவி')) {
    return {
      answer: lang.greetings.help,
      citations: [],
      section_title: language === 'ta' ? 'உதவி' : 'Help',
      confidence: 1.0
    };
  }
  
  return null;
}

/**
 * Get error response
 * @param {string} errorType - Type of error ('noReference', 'apiError', 'quotaExceeded')
 * @param {string} language - Language code ('en' or 'ta')
 * @param {string} fallbackContent - Optional fallback content for quota errors
 * @returns {object} - Error response object
 */
export function getErrorResponse(errorType, language, fallbackContent = '') {
  const lang = translations[language] || translations['en'];
  
  if (errorType === 'quotaExceeded' && fallbackContent) {
    return {
      answer: `${lang.errors.quotaExceeded}\n\n${fallbackContent}`,
      citations: [],
      section_title: "",
      confidence: 0.7
    };
  }
  
  return {
    answer: lang.errors[errorType] || lang.errors.noReference,
    citations: [],
    section_title: "",
    confidence: 0
  };
}

/**
 * Check if a language is supported
 * @param {string} language - Language code
 * @returns {boolean} - True if language is supported
 */
export function isSupportedLanguage(language) {
  return language in translations;
}

/**
 * Get list of supported languages
 * @returns {string[]} - Array of supported language codes
 */
export function getSupportedLanguages() {
  return Object.keys(translations);
}

export default {
  t,
  getSystemPrompt,
  getGreetingResponse,
  getErrorResponse,
  isSupportedLanguage,
  getSupportedLanguages
};

