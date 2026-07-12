import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { 
  FiSend, 
  FiMic, 
  FiFile as FiFileIcon, 
  FiX,
  FiMapPin as FiMapPinIcon
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

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px';
    }
  }, [message]);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      
      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setMessage((prev) => prev ? prev + ' ' + transcript : transcript);
      };
      
      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        setIsRecording(false);
      };
      
      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
    }
  }, [setMessage]);

  const toggleRecording = () => {
    if (disabled) return;
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    } else {
      if (recognitionRef.current) {
        const currentLang = i18n.language === 'ta' ? 'ta-IN' : 'en-US';
        recognitionRef.current.lang = currentLang;
        recognitionRef.current.start();
        setIsRecording(true);
      } else {
        alert('Speech recognition is not supported in this browser.');
      }
    }
  };

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
    setMessage(selectedPrompt);
    setTimeout(() => {
      onSendMessage(selectedPrompt);
    }, 100);
  };

  const handleDocumentClick = () => {
    if (disabled || isUploading) return;
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsUploading(true);
    try {
      const data = await uploadDocument(file);
      if (data && data.text) {
        const docContext = `\n\n[Attached Document: ${file.name}]\n${data.text}\n`;
        setMessage((prev) => prev + docContext);
      }
    } catch (error) {
      console.error(error);
      alert('Failed to upload document: ' + error.message);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message);
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
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
      className="sticky bottom-0 bg-white border-t border-[#E7E9F3] p-4"
    >
      <div className="max-w-[900px] mx-auto">
        
        {/* Quick Templates Bar */}
        <div className="flex flex-wrap items-center gap-2 mb-3 px-1 overflow-x-auto no-scrollbar">
          <span className="text-[10px] font-mono font-semibold text-[#9AA0B4] uppercase tracking-widest mr-1">
            {t('quickDraft') || 'Quick Draft'}:
          </span>
          {[
            { id: 'rental', label: t('rentalAgreement'), icon: '🏠' },
            { id: 'notice', label: t('legalNotice'), icon: '✉️' },
            { id: 'affidavit', label: t('affidavit'), icon: '📜' },
            { id: 'will', label: t('will'), icon: '✍️' },
            { id: 'poa', label: t('powerOfAttorney'), icon: '🤝' },
            { id: 'consumer', label: t('consumerComplaint'), icon: '🛍️' },
            { id: 'note', label: t('promissoryNote'), icon: '💵' },
          ].map((item) => (
            <motion.button
              key={item.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleTemplateClick(item.id)}
              disabled={disabled}
              className="px-3 py-1.5 bg-white border border-[#E7E9F3] rounded-full text-xs font-body font-medium text-[#5C6178] flex items-center gap-2 transition-all whitespace-nowrap disabled:opacity-50 hover:bg-[#F6F7FB] hover:text-[#0B0D1C]"
            >
              <span>{item.icon}</span>
              {item.label}
            </motion.button>
          ))}
        </div>

        <form
          onSubmit={handleSubmit}
          className="relative flex items-end gap-2 bg-white rounded-2xl border border-[#E7E9F3] shadow-sm focus-within:border-[#2541D6]/50 transition-all"
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
          <div className="flex items-center gap-1 pr-2 pb-2">
            
            {/* Hidden File Input */}
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept=".pdf,.txt" 
              className="hidden" 
            />

            {/* Location Toggle with Status Label */}
            <div className="flex flex-col items-center">
              <button
                type="button"
                onClick={onLocationToggle}
                disabled={disabled || isLocationLoading}
                className={`p-2.5 rounded-xl transition-all duration-300 ${
                  isLocationEnabled
                    ? 'text-[#10B981] bg-white border border-[#10B981]/30'
                    : 'text-[#9AA0B4] hover:text-[#0B0D1C] hover:bg-[#F6F7FB]'
                } disabled:opacity-40 disabled:cursor-not-allowed`}
                title={t('locationAccess')}
              >
                {isLocationLoading ? (
                  <div className="w-5 h-5 border-2 border-[#10B981]/30 border-t-[#10B981] rounded-full animate-spin" />
                ) : (
                  <FiMapPinIcon className="w-5 h-5" />
                )}
              </button>
              {isLocationEnabled && !isLocationLoading && (
 <span className="text-[9px] font-mono font-semibold text-[#10B981] uppercase tracking-tight mt-0.5 animate-pulse">
                  {t('locationOn')}
                </span>
              )}
            </div>

            {/* Voice Input */}
            <div className="relative">
              <button
                type="button"
                onClick={toggleRecording}
                disabled={disabled}
                className={`p-2.5 rounded-xl transition-all duration-300 ${
                  isRecording 
                    ? 'text-white bg-red-500 shadow-lg scale-110'
                    : 'text-[#9AA0B4] hover:text-[#0B0D1C] hover:bg-[#F6F7FB]'
                } disabled:opacity-40 disabled:cursor-not-allowed`}
                title={t('voiceInput')}
              >
                {isRecording ? (
                  <FiMic className="w-5 h-5 animate-bounce" />
                ) : (
                  <FiMic className="w-5 h-5" />
                )}
              </button>
              {isRecording && (
                <span className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-red-500 text-white text-[10px] font-mono font-semibold rounded-md animate-pulse whitespace-nowrap">
                  Listening...
                </span>
              )}
            </div>

            {/* PDF Upload */}
            <button
              type="button"
              onClick={handleDocumentClick}
              disabled={disabled || isUploading}
              className={`p-2.5 rounded-xl transition-colors font-body ${
isUploading ? 'text-[#2541D6] animate-pulse' : 'text-[#9AA0B4] hover:text-[#0B0D1C] hover:bg-[#F6F7FB]'
              } disabled:opacity-40 disabled:cursor-not-allowed`}
              title={t('pdfUpload')}
            >
              <FiFileIcon className="w-5 h-5" />
            </button>

            {/* Send Button */}
            <motion.button
              type="submit"
              disabled={disabled || !message.trim()}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`p-2.5 rounded-xl transition-all duration-300 font-body ${
message.trim() && !disabled
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

        {/* Disclaimer */}
        <p className="text-center text-xs text-[#9AA0B4] mt-2 font-body">
          {t('legalDisclaimer')}
        </p>
      </div>
    </motion.div>
  );
};

export default ChatInput;