import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      // App
      appName: 'AlphaLegalGPT',
      appSubtitle: 'AI Legal Assistant',
      
      // Auth
      welcomeBack: 'Welcome Back',
      loginSubtitle: 'Sign in to your AlphaLegalGPT account',
      email: 'Email',
      password: 'Password',
      enterEmail: 'Enter your email',
      enterPassword: 'Enter your password',
      signingIn: 'Signing in...',
      signIn: 'Sign In',
      orContinueWith: 'Or continue with',
      noAccount: "Don't have an account?",
      signUp: 'Sign up',
      invalidCredentials: 'Invalid email or password',
      
      createAccount: 'Create Account',
      signupSubtitle: 'Join AlphaLegalGPT today',
      fullName: 'Full Name',
      enterFullName: 'Enter your full name',
      confirmPassword: 'Confirm Password',
      passwordsMismatch: 'Passwords do not match',
      creatingAccount: 'Creating Account...',
      createAccountBtn: 'Create Account',
      alreadyHaveAccount: 'Already have an account?',
      verifyOTP: 'Verify OTP',
      otpSentTo: 'We sent a 6-digit code to',
      verifyOTPBtn: 'Verify OTP',
      
      // Sidebar
      newChat: 'New Chat',
      chatHistory: 'Chat History',
      settings: 'Settings',
      logout: 'Logout',
      noChats: 'No previous chats',
      clearAllHistory: 'Clear All History',
      confirmClearAll: 'Are you sure you want to clear all chat history? This cannot be undone.',
      
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
      locationAccess: 'Location Access',
      getDirections: 'Get Directions',
      locationOn: 'Location On',
      locationOff: 'Location Off',
      
      // Welcome
      welcomeTitle: 'Welcome to AlphaLegalGPT',
      welcomeMessage: 'Your comprehensive AI legal assistant. I am equipped to guide you through the intricacies of Indian Law, including the Constitution, civil procedures, penal codes, corporate law, legal drafting, and case analysis.',
      exampleQuestionsText: 'Example questions:',
      examples: [
        'What is IPC Section 420?',
        'What are the punishments for theft?',
        'Explain Section 498A.',
        'What does the law say about assault?',
        'What is the punishment for cyberbullying?',
        'How to file a domestic violence case?',
        'What is the legal process for divorce in India?',
        'Explain the Right to Information (RTI) Act.',
        'What are the rights of an arrested person?',
        'What constitutes criminal intimidation under IPC 503?',
        'What is the legal procedure for defamation?',
        'What are the child custody laws in India?'
      ],
      
      // Errors
      errorOccurred: 'An error occurred',
      tryAgain: 'Please try again',
      connectionError: 'Connection error. Please check your internet.',
      signupError: 'Signup failed. Please try again.',
      
      // Footer
      poweredBy: 'Powered by',
      legalDisclaimer: 'This is an AI assistant and not a substitute for professional legal advice.',
      
      // Boost Features
      legalReferences: 'Legal References',
      quickDraft: 'Quick Draft',
      rentalAgreement: 'Rental Agreement',
      legalNotice: 'Legal Notice',
      affidavit: 'Affidavit',
      openLaws: 'Open Law References',
      will: 'Will (Testament)',
      powerOfAttorney: 'Power of Attorney',
      consumerComplaint: 'Consumer Complaint',
      promissoryNote: 'Promissory Note',
    },
  },
  ta: {
    translation: {
      // App
      appName: 'AlphaLegalGPT',
      appSubtitle: 'AI சட்ட உதவியாளர்',
      
      // Auth
      welcomeBack: 'வரவேற்கிறோம்',
      loginSubtitle: 'உங்கள் AlphaLegalGPT கணக்கில் உள்நுழையவும்',
      email: 'மின்னஞ்சல்',
      password: 'பாஸ்வேர்ட்',
      enterEmail: 'உங்கள் மின்னஞ்சலை உள்ளிடவும்',
      enterPassword: 'உங்கள் பாஸ்வேர்டை உள்ளிடவும்',
      signingIn: 'உள்நுழைகிறது...',
      signIn: 'உள்நுழையவும்',
      orContinueWith: 'அல்லது இதன் மூலம் தொடரவும்',
      noAccount: 'கணக்கு இல்லையா?',
      signUp: 'பதிவு செய்யவும்',
      invalidCredentials: 'தவறான மின்னஞ்சல் அல்லது பாஸ்வேர்ட்',
      
      createAccount: 'கணக்கு உருவாக்கு',
      signupSubtitle: 'இன்று AlphaLegalGPT-ல் சேருங்கள்',
      fullName: 'முழு பெயர்',
      enterFullName: 'உங்கள் முழு பெயரை உள்ளிடவும்',
      confirmPassword: 'பாஸ்வேர்டை உறுதிப்படுத்தவும்',
      passwordsMismatch: 'பாஸ்வேர்டுகள் ஒத்துப்போகவில்லை',
      creatingAccount: 'கணக்கு உருவாக்கப்படுகிறது...',
      createAccountBtn: 'கணக்கு உருவாக்கு',
      alreadyHaveAccount: 'இதற்கு முன் கணக்கு உள்ளதா?',
      verifyOTP: 'OTP ஐ உறுதிப்படுத்தவும்',
      otpSentTo: '6-எண் குறியீடு அனுப்பப்பட்டது',
      verifyOTPBtn: 'OTP ஐ உறுதிப்படுத்தவும்',
      
      // Sidebar
      newChat: 'புதிய உரையாடல்',
      chatHistory: 'உரையாடல் வரலாறு',
      settings: 'அமைப்புகள்',
      logout: 'வெளியேறு',
      noChats: 'முந்தைய உரையாடல்கள் இல்லை',
      clearAllHistory: 'அனைத்து வரலாற்றையும் அழி',
      confirmClearAll: 'அனைத்து உரையாடல் வரலாற்றையும் அழிக்க வேண்டுமா? இதைத் தவிர்க்க முடியாது.',
      
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
      locationAccess: 'இருப்பிட அணுகல்',
      getDirections: 'வழிமுறைகளைப் பெறுங்கள்',
      locationOn: 'இருப்பிடம் ஆன்',
      locationOff: 'இருப்பிடம் ஆஃப்',
      
      // Welcome
      welcomeTitle: 'AlphaLegalGPT-க்கு வரவேற்கிறோம்',
      welcomeMessage: 'உங்களது விரிவான AI சட்ட உதவியாளர். இந்திய அரசியலமைப்பு, சிவில் நடைமுறைகள், தண்டனைச் சட்டங்கள், கார்ப்பரேட் சட்டம், சட்ட வரைவுகள் மற்றும் வழக்கு பகுப்பாய்வு உள்ளிட்ட இந்திய சட்டத்தின் நுணுக்கங்களை உங்களுக்கு வழிகாட்ட நான் தயாராக உள்ளேன்.',
      exampleQuestionsText: 'உதாரணமான கேள்விகள்:',
      examples: [
        'IPC பிரிவு 420 என்றால் என்ன?',
        'திருட்டுக்கு தண்டனைகள் எவை?',
        'பிரிவு 498A-ஐ விளக்குங்கள்.',
        'தாக்குதல் பற்றி சட்டம் என்ன கூறுகிறது?',
        'இணைய அச்சுறுத்தலுக்கான தண்டனை என்ன?',
        'குடும்ப வன்முறை வழக்கை எவ்வாறு பதிவு செய்வது?',
        'இந்தியாவில் விவாகரத்துக்கான சட்ட நடைமுறை என்ன?',
        'தகவல் அறியும் உரிமைச் சட்டம் (RTI) விளக்குங்கள்.',
        'கைது செய்யப்பட்ட நபரின் உரிமைகள் என்ன?',
        'IPC 503-இன் கீழ் குற்றவியல் மிரட்டல் என்றால் என்ன?',
        'அவதூறு வழக்குக்கான சட்ட நடைமுறை என்ன?',
        'இந்தியாவில் குழந்தை காப்பகச் சட்டங்கள் என்ன?'
      ],
      
      // Errors
      errorOccurred: 'பிழை ஏற்பட்டது',
      tryAgain: 'மீண்டும் முயற்சிக்கவும்',
      connectionError: 'இணைப்புப் பிழை. உங்கள் இணையத்தைச் சரிபார்க்கவும்.',
      signupError: 'பதிவு தோல்வியடைந்தது. மீண்டும் முயற்சிக்கவும்.',
      
      // Footer
      poweredBy: 'இயக்கப்படுகிறது',
      legalDisclaimer: 'இது ஒரு AI உதவியாளர் மற்றும் தொழில்முறை சட்ட ஆலோசனைக்கு மாற்று அல்ல.',
      
      // Boost Features
      legalReferences: 'சட்டக் குறிப்புகள்',
      quickDraft: 'விரைவு வரைவு',
      rentalAgreement: 'வாடகை ஒப்பந்தம்',
      legalNotice: 'சட்ட நோட்டீஸ்',
      affidavit: 'உறுதிமொழிப் பத்திரம்',
      openLaws: 'சட்டக் குறிப்புகள்',
      will: 'உயில் (Will)',
      powerOfAttorney: 'பவர் ஆஃப் அட்டர்னி',
      consumerComplaint: 'நுகர்வோர் புகார்',
      promissoryNote: 'புராமிசரி நோட்',
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

