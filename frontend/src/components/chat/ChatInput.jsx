import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { 
  FiSend, 
  FiMic, 
  FiFile as FiFileIcon, 
  FiX,
  FiMapPin as FiMapPinIcon,
  FiPlus,
  FiFileText,
  FiMail,
  FiClipboard,
  FiEdit3,
  FiUsers,
  FiShoppingBag,
  FiCreditCard
} from 'react-icons/fi';
import { uploadDocument } from '../../services/api';

const ChatInput = ({
  value: message,
  onChange: setMessage,
  onSendMessage,
  isLoading,
  disabled,
  isLocationEnabled,
  isLocationLoading,
  onLocationToggle
}) => {
  const { t, i18n } = useTranslation();
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const recognitionRef = useRef(null);
  
  const [isRecording, setIsRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const [attachment, setAttachment] = useState(null); // { name, size, text }
  const [uploadError, setUploadError] = useState(null);
  const [voiceError, setVoiceError] = useState(null);
  const [voiceSupported] = useState(
    () => typeof window !== 'undefined' && Boolean(window.SpeechRecognition || window.webkitSpeechRecognition)
  );
  const optionsRef = useRef(null);
  const optionsToggleRef = useRef(null);
  const baseTextRef = useRef('');
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB (matches backend limit)

  const quickDrafts = [
    { id: 'rental', label: t('rentalAgreement'), icon: FiFileText },
    { id: 'notice', label: t('legalNotice'), icon: FiMail },
    { id: 'affidavit', label: t('affidavit'), icon: FiClipboard },
    { id: 'will', label: t('will'), icon: FiEdit3 },
    { id: 'poa', label: t('powerOfAttorney'), icon: FiUsers },
    { id: 'consumer', label: t('consumerComplaint'), icon: FiShoppingBag },
    { id: 'note', label: t('promissoryNote'), icon: FiCreditCard },
  ];

  // Close options menu on outside click or Escape
  useEffect(() => {
    if (!isOptionsOpen) return;
    const handlePointer = (e) => {
      const inMenu = optionsRef.current && optionsRef.current.contains(e.target);
      const inToggle = optionsToggleRef.current && optionsToggleRef.current.contains(e.target);
      if (!inMenu && !inToggle) {
        setIsOptionsOpen(false);
      }
    };
    const handleKey = (e) => {
      if (e.key === 'Escape') setIsOptionsOpen(false);
    };
    document.addEventListener('mousedown', handlePointer);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handlePointer);
      document.removeEventListener('keydown', handleKey);
    };
  }, [isOptionsOpen]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px';
    }
  }, [message]);

  // Create a speech recognition instance configured for the current language
  const getRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return null;

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = i18n.language === 'ta' ? 'ta-IN' : 'en-US';

    recognition.onresult = (event) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          baseTextRef.current = `${baseTextRef.current} ${transcript}`.trim();
        } else {
          interim += transcript;
        }
      }
      setMessage(`${baseTextRef.current} ${interim}`.trim());
    };

    recognition.onerror = (event) => {
      const errorMessages = {
        'not-allowed': 'Microphone permission denied. Enable it in your browser settings.',
        'service-not-allowed': 'Microphone service is blocked. Check your browser permissions.',
        'no-speech': 'No speech detected. Please try again.',
        'audio-capture': 'No microphone found. Please connect one and try again.',
        'network': 'Speech service network error. Please check your connection.',
      };
      setVoiceError(errorMessages[event.error] || `Voice input error: ${event.error}`);
      setIsRecording(false);
    };

    recognition.onend = () => setIsRecording(false);
    return recognition;
  };

  const toggleRecording = () => {
    if (disabled || isLoading) return;
    setVoiceError(null);

    if (isRecording) {
      recognitionRef.current?.stop();
      return;
    }

    if (!voiceSupported) {
      setVoiceError('Voice input is not supported in this browser. Try Chrome or Edge.');
      return;
    }

    // Remember what the user had already typed; dictation appends to it
    baseTextRef.current = message;
    recognitionRef.current = getRecognition();
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (err) {
        console.error('Speech recognition failed to start:', err);
        setVoiceError('Could not start voice input. Please try again.');
      }
    }
  };

  // Stop any active recognition when the component unmounts
  useEffect(() => () => {
    recognitionRef.current?.abort?.();
  }, []);

  // Auto-dismiss transient errors
  useEffect(() => {
    if (!uploadError && !voiceError) return;
    const id = setTimeout(() => {
      setUploadError(null);
      setVoiceError(null);
    }, 6000);
    return () => clearTimeout(id);
  }, [uploadError, voiceError]);

  const handleTemplateClick = (type) => {
    if (disabled) return;
    const isTamil = i18n.language && i18n.language.startsWith('ta');
    const prompts = {
      rental: isTamil ? 'வாடகை ஒப்பந்தம் (Rental Agreement) மாதிரி ஒன்றை உருவாக்கி தாருங்கள்.' : 'Please draft a basic Rental Agreement template.',
      notice: isTamil ? 'தவறான விளம்பரத்திற்கு எதிராக ஒரு சட்ட நோட்டீஸ் (Legal Notice) மாதிரி ஒன்றை உருவாக்கி தாருங்கள்.' : 'Please draft a standard Legal Notice template for a consumer complaint.',
      affidavit: isTamil ? 'பெயர் மாற்றத்திற்கான ஒரு உறுதிமொழிப் பத்திரம் (Affidavit) மாதிரி ஒன்றை உருவாக்கி தாருங்கள்.' : 'Please draft a basic Affidavit template for name change.',
      openLaws: isTamil ? 'சட்டக் குறிப்புகள் பற்றி எனக்குத் தெரியப்படுத்துங்கள்.' : 'Tell me about open law references.',
      will: isTamil ? 'சொத்து பகிர்விற்கான ஒரு உயில் (Will) மாதிரி ஒன்றை உருவாக்கி தாருங்கள்.' : 'Please draft a basic Will (testament) template for property distribution.',
      poa: isTamil ? 'சட்டப்பூர்வமான பவர் ஆஃப் அட்டர்னி (Power of Attorney) மாதிரி ஒன்றை உருவாக்கி தாருங்கள்.' : 'Please draft a General Power of Attorney template.',
      consumer: isTamil ? 'நுகர்வோர் புகார் (Consumer Complaint) மாதிரி ஒன்றை உருவாக்கி தாருங்கள்.' : 'Please draft a Consumer Complaint template.',
      note: isTamil ? 'புராமிசரி நோட் (Promissory Note) மாதிரி ஒன்றை உருவாக்கி தாருங்கள்.' : 'Please draft a basic Promissory Note template.',
    };
    
    const selectedPrompt = prompts[type];
    setIsOptionsOpen(false);
    composeAndSend(selectedPrompt);
  };

  const handleDocumentClick = () => {
    if (disabled || isUploading) return;
    setUploadError(null);
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);

    // Client-side validation (mirrors backend rules)
    const extension = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
    if (!['.pdf', '.txt'].includes(extension)) {
      setUploadError('Invalid file type. Only PDF and TXT files are allowed.');
      e.target.value = '';
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setUploadError('File size exceeds the 10MB limit. Please upload a smaller file.');
      e.target.value = '';
      return;
    }

    setIsUploading(true);
    try {
      const data = await uploadDocument(file);
      if (data && data.success && data.text) {
        setAttachment({
          name: data.filename || file.name,
          size: data.fileSize,
          text: data.text,
        });
      } else {
        setUploadError('Could not extract text from this document. It may be empty or scanned.');
      }
    } catch (error) {
      console.error('Document upload failed:', error);
      setUploadError(error?.message || 'Failed to upload document. Please try again.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Default prompt used when a document is sent without any typed message
  const buildDocPrompt = () => {
    const isTamil = i18n.language && i18n.language.startsWith('ta');
    return isTamil
      ? 'இணைக்கப்பட்ட ஆவணத்தை பகுப்பாய்வு செய்து அதன் முக்கியமான சட்ட விவரங்களை சுருக்கமாகத் தெரிவிக்கவும்.'
      : 'Please analyze the attached document and summarize its key legal points.';
  };

  // Compose the outgoing message: typed text (or auto prompt) + extracted document text
  const composeAndSend = (text) => {
    let finalText = text;
    if (attachment) {
      const docBlock = `\n\n[Attached Document: ${attachment.name}]\n${attachment.text}\n`;
      finalText = (text && text.trim() ? text : buildDocPrompt()) + docBlock;
    }
    setAttachment(null);
    setMessage('');
    onSendMessage(finalText);
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    const text = message.trim();
    if ((!text && !attachment) || disabled || isLoading) return;
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    composeAndSend(text);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      className="sticky bottom-0 glass-panel border-t border-white/60 px-3 py-3 md:p-4 bg-white/70 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
    >
      <div className="max-w-[900px] mx-auto">
        <div className="relative">

          {/* Options dropdown list (Quick Draft + Tools) */}
          <div
            ref={optionsRef}
            id="chat-input-options"
            className={`absolute bottom-full left-0 right-0 mb-3 z-30 bg-white rounded-2xl border border-[#E7E9F3] shadow-[0_12px_40px_rgba(11,13,28,0.12)] overflow-hidden transition-all duration-200 ease-out origin-bottom ${
              isOptionsOpen
                ? 'opacity-100 translate-y-0 scale-100'
                : 'opacity-0 translate-y-2 scale-95 pointer-events-none'
            }`}
            aria-hidden={!isOptionsOpen}
          >
            {/* Quick Draft section */}
            <div className="px-3 pt-3 pb-1">
              <span className="text-[10px] font-mono font-semibold text-[#9AA0B4] uppercase tracking-widest px-1">
                {t('quickDraft') || 'Quick Draft'}
              </span>
            </div>
            <div className="px-2 pb-2 max-h-[240px] overflow-y-auto scrollbar-thin">
              {quickDrafts.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleTemplateClick(item.id)}
                    disabled={disabled}
                    className="w-full flex items-center gap-3 px-2.5 py-2.5 rounded-xl text-left text-sm font-body font-medium text-[#0B0D1C] hover:bg-[#F6F7FB] active:bg-[#EDEFF7] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="w-8 h-8 shrink-0 rounded-lg bg-gradient-to-br from-[#2541D6]/10 to-[#6B21D9]/10 flex items-center justify-center">
                      <Icon className="w-4 h-4 text-[#2541D6]" />
                    </span>
                    {item.label}
                  </button>
                );
              })}
            </div>

            {/* Tools section */}
            <div className="px-3 pt-2 pb-1 border-t border-[#E7E9F3]">
              <span className="text-[10px] font-mono font-semibold text-[#9AA0B4] uppercase tracking-widest px-1">
                Tools
              </span>
            </div>
            <div className="p-2">
              {/* PDF Upload */}
              <button
                type="button"
                onClick={handleDocumentClick}
                disabled={disabled || isUploading}
                className="w-full flex items-center gap-3 px-2.5 py-2.5 rounded-xl text-left text-sm font-body font-medium text-[#0B0D1C] hover:bg-[#F6F7FB] active:bg-[#EDEFF7] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="w-8 h-8 shrink-0 rounded-lg bg-[#F6F7FB] flex items-center justify-center">
                  {isUploading ? (
                    <div className="w-4 h-4 border-2 border-[#2541D6]/30 border-t-[#2541D6] rounded-full animate-spin" />
                  ) : (
                    <FiFileIcon className="w-4 h-4 text-[#5C6178]" />
                  )}
                </span>
                <span className="flex-1">{t('pdfUpload')}</span>
                {isUploading && (
                  <span className="text-[10px] font-mono font-semibold text-[#2541D6] uppercase tracking-tight animate-pulse">
                    Uploading…
                  </span>
                )}
              </button>

              {/* Voice Input */}
              <button
                type="button"
                onClick={toggleRecording}
                disabled={disabled || !voiceSupported}
                title={voiceSupported ? undefined : 'Voice input is not supported in this browser'}
                className={`w-full flex items-center gap-3 px-2.5 py-2.5 rounded-xl text-left text-sm font-body font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  isRecording
                    ? 'bg-red-500/10 text-red-500'
                    : 'text-[#0B0D1C] hover:bg-[#F6F7FB] active:bg-[#EDEFF7]'
                }`}
              >
                <span
                  className={`w-8 h-8 shrink-0 rounded-lg flex items-center justify-center ${
                    isRecording ? 'bg-red-500 text-white' : 'bg-[#F6F7FB] text-[#5C6178]'
                  }`}
                >
                  <FiMic className="w-4 h-4" />
                </span>
                <span className="flex-1">{t('voiceInput')}</span>
                {!voiceSupported && (
                  <span className="text-[10px] font-mono font-semibold text-[#9AA0B4] uppercase tracking-tight">
                    Not supported
                  </span>
                )}
                {isRecording && (
                  <span className="text-[10px] font-mono font-semibold text-red-500 uppercase tracking-tight animate-pulse">
                    Recording
                  </span>
                )}
              </button>

              {/* Location Access */}
              <button
                type="button"
                onClick={onLocationToggle}
                disabled={disabled || isLocationLoading}
                className="w-full flex items-center gap-3 px-2.5 py-2.5 rounded-xl text-left text-sm font-body font-medium text-[#0B0D1C] hover:bg-[#F6F7FB] active:bg-[#EDEFF7] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span
                  className={`w-8 h-8 shrink-0 rounded-lg flex items-center justify-center ${
                    isLocationEnabled ? 'bg-[#10B981]/10' : 'bg-[#F6F7FB]'
                  }`}
                >
                  {isLocationLoading ? (
                    <div className="w-4 h-4 border-2 border-[#10B981]/30 border-t-[#10B981] rounded-full animate-spin" />
                  ) : (
                    <FiMapPinIcon className={`w-4 h-4 ${isLocationEnabled ? 'text-[#10B981]' : 'text-[#5C6178]'}`} />
                  )}
                </span>
                <span className="flex-1">{t('locationAccess')}</span>
                {isLocationEnabled && !isLocationLoading && (
                  <span className="text-[10px] font-mono font-semibold text-[#10B981] bg-[#10B981]/10 px-2 py-0.5 rounded-full uppercase tracking-tight">
                    {t('locationOn')}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Upload / Voice error banners */}
          {(uploadError || voiceError) && (
            <div className="flex items-start gap-2 mb-2 px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-xl">
              <span className="w-1.5 h-1.5 mt-1.5 rounded-full bg-red-500 shrink-0" />
              <p className="flex-1 text-xs text-red-500 font-body">{uploadError || voiceError}</p>
              <button
                type="button"
                onClick={() => { setUploadError(null); setVoiceError(null); }}
                className="p-0.5 rounded-full hover:bg-red-500/10 transition-colors shrink-0"
                aria-label="Dismiss error"
              >
                <FiX className="w-3.5 h-3.5 text-red-500" />
              </button>
            </div>
          )}

          {/* Attached document chip */}
          {attachment && (
            <div className="flex items-center gap-2.5 mb-2 px-3 py-2 bg-[#2541D6]/5 border border-[#2541D6]/20 rounded-xl">
              <span className="w-8 h-8 shrink-0 rounded-lg bg-gradient-to-br from-[#2541D6] to-[#6B21D9] flex items-center justify-center">
                <FiFileIcon className="w-4 h-4 text-white" />
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-body font-medium text-[#0B0D1C] truncate">{attachment.name}</p>
                <p className="text-[11px] font-mono text-[#10B981]">
                  {attachment.size ? `${attachment.size} MB · ` : ''}Ready to send
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAttachment(null)}
                className="p-1.5 rounded-full hover:bg-[#2541D6]/10 transition-colors shrink-0"
                aria-label="Remove attachment"
                title="Remove attachment"
              >
                <FiX className="w-4 h-4 text-[#5C6178]" />
              </button>
            </div>
          )}

          {/* Recording banner */}
          {isRecording && (
            <div className="flex items-center justify-between gap-2 mb-2 px-4 py-2.5 bg-red-500/10 border border-red-500/20 rounded-2xl">
              <div className="flex items-center gap-2 text-red-500 text-sm font-body font-medium">
                <span className="relative flex w-2.5 h-2.5">
                  <span className="absolute inline-flex w-full h-full rounded-full bg-red-500 opacity-75 animate-ping"></span>
                  <span className="relative inline-flex w-2.5 h-2.5 rounded-full bg-red-500"></span>
                </span>
                Listening…
              </div>
              <button
                type="button"
                onClick={toggleRecording}
                className="px-3 py-1 rounded-full bg-red-500 text-white text-xs font-body font-medium hover:bg-red-600 transition-colors"
              >
                Stop
              </button>
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="relative flex items-center gap-2 bg-white/70 glass-input rounded-2xl border border-[#E7E9F3] shadow-sm focus-within:border-[#2541D6]/50 focus-within:ring-2 focus-within:ring-[#2541D6]/10 transition-all"
          >
          {/* Textarea */}
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t('typeMessage')}
              disabled={disabled}
              rows={1}
              className="w-full bg-transparent px-4 py-3 text-[15px] text-[#0B0D1C] placeholder:text-[#9AA0B4] resize-none disabled:opacity-50 font-body"
              style={{ minHeight: '24px', maxHeight: '200px' }}
            />
            
            {/* Clear button */}
            {message && (
              <button
                type="button"
                onClick={() => setMessage('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-[#F6F7FB] rounded-full transition-colors"
              >
                <FiX className="w-4 h-4 text-[#9AA0B4]" />
              </button>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5 pr-3 shrink-0">

            {/* Hidden File Input */}
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept=".pdf,.txt" 
              className="hidden" 
            />

            {/* Options toggle (+) */}
            <button
              type="button"
              ref={optionsToggleRef}
              onClick={() => setIsOptionsOpen((v) => !v)}
              className={`p-2.5 rounded-full transition-all duration-300 ${
                isOptionsOpen
                  ? 'text-white bg-gradient-to-br from-[#2541D6] to-[#6B21D9] shadow-[0_6px_16px_rgba(37,65,214,0.25)] rotate-45'
                  : 'text-[#5C6178] bg-[#F6F7FB] hover:bg-[#EDEFF7] rotate-0'
              }`}
              aria-label={isOptionsOpen ? 'Close options menu' : 'Open options menu'}
              aria-expanded={isOptionsOpen}
              aria-controls="chat-input-options"
              title={isOptionsOpen ? 'Close options menu' : 'Quick Draft & Tools'}
            >
              <FiPlus className="w-5 h-5" />
            </button>

            {/* Send Button */}
            <motion.button
              type="submit"
              disabled={disabled || isLoading || (!message.trim() && !attachment)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`p-2.5 rounded-full transition-all duration-300 font-body ${
                (message.trim() || attachment) && !disabled
                  ? 'bg-gradient-to-r from-[#2541D6] to-[#6B21D9] text-white shadow-[0_8px_28px_rgba(37,65,214,0.3)]'
                  : 'bg-[#F6F7FB] text-[#9AA0B4] shadow-sm'
              } disabled:cursor-not-allowed`}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <FiSend className="w-5 h-5" />
              )}
            </motion.button>
          </div>
        </form>
        </div>

        {/* Disclaimer */}
        <p className="text-center text-xs text-[#9AA0B4] mt-2 font-body">
          {t('legalDisclaimer')}
        </p>
      </div>
    </motion.div>
  );
};

export default ChatInput;