import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      // App
      appName: 'AlphaLegalGPT',
      appSubtitle: 'AI Legal Assistant',
      
      // Sidebar
      newChat: 'New Chat',
      chatHistory: 'Chat History',
      settings: 'Settings',
      noChats: 'No previous chats',
      
      // Chat
      basedOnIPC: 'Based on IPC',
      citations: 'Citations',
      confidence: 'Confidence',
      typeMessage: 'Type your message...',
      sendMessage: 'Send message',
      voiceInput: 'Voice input (coming soon)',
      pdfUpload: 'PDF upload (coming soon)',
      
      // Status
      thinking: 'Thinking...',
      loading: 'Loading...',
      connected: 'Connected',
      disconnected: 'Disconnected',
      
      // Welcome
      welcomeTitle: 'Welcome to AlphaLegalGPT',
      welcomeMessage: 'Your AI-powered legal assistant for Indian Penal Code queries. Ask me anything about IPC sections, criminal law, or legal procedures.',
      exampleQuestions: 'Example questions:',
      example1: 'What is IPC Section 420?',
      example2: 'What are the punishments for theft?',
      example3: 'Explain Section 498A',
      example4: 'What does the law say about assault?',
      
      // Errors
      errorOccurred: 'An error occurred',
      tryAgain: 'Please try again',
      connectionError: 'Connection error. Please check your internet.',
      
      // Footer
      poweredBy: 'Powered by',
      legalDisclaimer: 'This is an AI assistant and not a substitute for professional legal advice.',
    },
  },
  ta: {
    translation: {
      // App
      appName: 'அல்பாஎல்கல்ஜிபிடி',
      appSubtitle: 'AI சட்ட உதவியாளர்',
      
      // Sidebar
      newChat: 'புதிய உரையாடல்',
      chatHistory: 'உரையாடல் வரலாறு',
      settings: 'அமைப்புகள்',
      noChats: 'முந்தைய உரையாடல்கள் இல்லை',
      
      // Chat
      basedOnIPC: 'IPC அடிப்படையில்',
      citations: 'மேற்கோள்கள்',
      confidence: 'நம்பக்கூடியது',
      typeMessage: 'உங்கள் செய்தியைத் தட்டச்சு செய்யுங்கள்...',
      sendMessage: 'செய்தி அனுப்பு',
      voiceInput: 'குரல் உள்ளிடல் (விரைவில்)',
      pdfUpload: 'PDF பதிவேற்றம் (விரைவில்)',
      
      // Status
      thinking: 'சிந்திக்கிறது...',
      loading: 'ஏற்றுகிறது...',
      connected: 'இணைக்கப்பட்டது',
      disconnected: 'துண்டிக்கப்பட்டது',
      
      // Welcome
      welcomeTitle: 'அல்பாஎல்கல்ஜிபிடி-க்கு வரவேற்கிறோம்',
      welcomeMessage: 'இந்திய தண்டனைச் சட்டத்திற்கான உங்கள் AI-ஆற்றல் சட்ட உதவியாளர். IPC பிரிவுகள், குற்றவியல் சட்டம் அல்லது சட்ட நடைமுறைகள் பற்றி என்னிடம் கேளுங்கள்.',
      exampleQuestions: 'உதாரணமான கேள்விகள்:',
      example1: 'IPC பிரிவு 420 என்றால் என்ன?',
      example2: 'திருட்டுக்கு தண்டனைகள் எவை?',
      example3: 'பிரிவு 498A-ஐ விளக்குங்கள்',
      example4: 'தாக்குதல் பற்றி சட்டம் என்ன கூறுகிறது?',
      
      // Errors
      errorOccurred: 'பிழை ஏற்பட்டது',
      tryAgain: 'மீண்டும் முயற்சிக்கவும்',
      connectionError: 'இணைப்புப் பிழை. உங்கள் இணையத்தைச் சரிபார்க்கவும்.',
      
      // Footer
      poweredBy: 'இயக்கப்படுகிறது',
      legalDisclaimer: 'இது ஒரு AI உதவியாளர் மற்றும் தொழில்முறை சட்ட ஆலோசனைக்கு மாற்று அல்ல.',
    },
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem('language') || 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;

