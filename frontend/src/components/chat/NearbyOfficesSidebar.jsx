import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiMapPin, FiNavigation } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';

const OFFICE_ICONS = {
  'VAO Office': '🏛',
  'Revenue Inspector Office': '📋',
  'Taluk Office': '🏢',
  'Sub Registrar Office': '📝',
  'District Court': '⚖️',
  'Police Station': '🚔',
  'District Collectorate': '🏛',
  'RTO Office': '🚗',
  'Municipality Office': '🏢',
  'Consumer Court': '🛍️',
  'Labour Court': '👷',
  'SP Office': '🚔',
  'Family Court': '👨‍👩‍👧‍👦',
  'High Court': '🏛️',
  'Income Tax Office': '💰',
  'Passport Office': '🛂',
  'Election Office': '🗳️',
  'All Women Police Station': '👩‍✈️',
  'Traffic Police Station': '🚦',
  'Cyber Crime Police Station': '💻',
  'Crime Branch (CB-CID)': '🔍',
  'Railway Police (RPF / GRP)': '🚆',
  'Special Task Force (STF)': '🔫',
  'Coastal Security Police': '🚤',
  'Supreme Court of India': '🏛️',
  'Sessions Court': '⚖️',
  'Magistrate Court': '⚖️',
  'Fast Track Court': '⚡',
  'Lok Adalat': '🤝',
  'Legal Services Authority': '📑',
  'Human Rights Commission': '🕊️',
  'State Human Rights Commission': '🕊️',
  'National Commission for Women': '👩',
  'State Commission for Women': '👩',
  'Child Welfare Committee (CWC)': '👶',
  'Juvenile Justice Board (JJB)': '🧒',
  'Lokpal': '🛡️',
  'Lokayukta': '🛡️',
  'Vigilance Commission': '👁️',
  'Land Survey Office': '🗺️',
  'Registration Department Office': '📂',
  'Central Bureau of Investigation (CBI)': '🕵️',
  'National Investigation Agency (NIA)': '🕵️',
  'Enforcement Directorate (ED)': '🕵️',
  'Narcotics Control Bureau (NCB)': '💊',
  'Directorate of Revenue Intelligence (DRI)': '🧐',
  'Border Security Force (BSF)': '💂',
  'Central Reserve Police Force (CRPF)': '👮',
  'Intelligence Bureau (IB)': '📡',
  'Research and Analysis Wing (RAW)': '🌍',
  'National Green Tribunal (NGT)': '🌳',
  'Income Tax Appellate Tribunal (ITAT)': '💰',
  'Debt Recovery Tribunal (DRT)': '💸',
  'Armed Forces Tribunal (AFT)': '🪖',
  'Central Jail': '⛓️',
  'Sub Jail': '⛓️',
  'Women Prison': '⛓️',
  'Juvenile Home': '🏠',
  'Notary Public Office': '🖊️',
  'Advocate / Lawyer Office': '💼',
  'Public Prosecutor Office': '📋',
  'Registrar General Office': '📜',
  'EB Office / TANGEDCO': '⚡',
  'Water Board': '🚰',
  'BDO Office / Panchayat Union': '🏘️',
  'Agriculture Office': '🚜',
  'Veterinary Hospital': '🐄',
  'Primary Health Centre (PHC)': '🏥',
  'Ration Shop / PDS': '🛒',
};

const NearbyOfficesSidebar = ({ query, response, location, isOpen, onClose, isLocationEnabled, hasGeneratedResponse }) => {
  const { t } = useTranslation();

  const offices = React.useMemo(() => {
    if (!isLocationEnabled || !location || !location.lat || !location.lng) return [];
    
    const lat = location.lat;
    const lng = location.lng;
    const combinedText = ((query || '') + ' ' + (response || '')).toLowerCase();

    const buildOffice = (label, searchName) => ({
      label,
      mapsSearchUrl: `https://www.google.com/maps/search/${encodeURIComponent(searchName)}/@${lat},${lng},13z`,
      directionsUrl: `https://www.google.com/maps/dir/?api=1&origin=${lat},${lng}&destination=${encodeURIComponent(searchName)}&travelmode=driving`,
    });

    const rules = [
      { label: 'Cyber Crime Police Station', searchName: 'Cyber Crime Police Station', kw: ['cyber', 'hacked', 'online fraud', 'phishing', 'social media crime', 'scam', 'internet', 'சைபர் கிரைம்'] },
      { label: 'All Women Police Station', searchName: 'All Women Police Station', kw: ['women police', 'awps', 'dowry', 'domestic violence', 'harrassment', 'molestation', 'female', 'பெண்கள் காவல் நிலையம்', 'வரதட்சணை'] },
      { label: 'Traffic Police Station', searchName: 'Traffic Police Station', kw: ['traffic', 'accident', 'fine', 'vehicle seizure', 'drink and drive', 'helmet', 'போக்குவரத்து காவல் நிலையம்'] },
      { label: 'Crime Branch (CB-CID)', searchName: 'CB-CID office', kw: ['cbcid', 'crime branch', 'special investigation', 'cidi', 'சிபிசிஐடி'] },
      { label: 'Railway Police (RPF / GRP)', searchName: 'Railway Police Station', kw: ['railway police', 'train', 'station', 'rpf', 'grp', 'railway station', 'ரயில்வே போலீஸ்'] },
      { label: 'Coastal Security Police', searchName: 'Coastal Security Police', kw: ['coastal', 'sea', 'beach', 'boat', 'fisherman', 'coast guard', 'கடலோர பாதுகாப்பு'] },
      { label: 'Special Task Force (STF)', searchName: 'Special Task Force STF', kw: ['stf', 'special task force', 'naxal', 'smuggling'] },
      { label: 'Police Station', searchName: 'Police Station', kw: ['police', 'fir', 'complaint', 'theft', 'robbery', 'murder', 'crime', 'pc', 'arrest', 'fight', 'காவல் நிலையம்', 'போலீஸ்'] },
      { label: 'SP Office', searchName: 'SP Office', kw: ['sp office', 'dsp office', 'superintendent', 'district police', 'murder', 'crime', 'commissioner', 'எஸ்பி அலுவலகம்'] },
      { label: 'Supreme Court of India', searchName: 'Supreme Court of India', kw: ['supreme court', 'sc', 'delhi court', 'ultimate', 'final appeal', 'உச்ச நீதிமன்றம்'] },
      { label: 'High Court', searchName: 'High Court', kw: ['high court', 'hc', 'madras high court', 'writ', 'quash', 'stay order', 'anticipatory bail', 'உயர் நீதிமன்றம்'] },
      { label: 'Family Court', searchName: 'Family Court', kw: ['family court', 'divorce', 'maintenance', 'custody', 'marriage dispute', 'alimony', 'குடும்ப நீதிமன்ரம்'] },
      { label: 'Consumer Court', searchName: 'Consumer Court', kw: ['consumer', 'fraud', 'product', 'service', 'compensation', 'complaint', 'நுகர்வோர் நீதிமன்றம்'] },
      { label: 'Labour Court', searchName: 'Labour Court', kw: ['labour', 'worker', 'salary', 'pf', 'esi', 'dismissal', 'தொழிலாளர் நீதிமன்றம்'] },
      { label: 'Sessions Court', searchName: 'Sessions Court', kw: ['sessions court', 'criminal trial', 'serious crime'] },
      { label: 'Magistrate Court', searchName: 'Magistrate Court', kw: ['magistrate', 'remand', 'bail', 'minor case'] },
      { label: 'Fast Track Court', searchName: 'Fast Track Court', kw: ['fast track', 'speedy trial'] },
      { label: 'Lok Adalat', searchName: 'Lok Adalat', kw: ['lok adalat', 'compromise', 'settlement', '🤝'] },
      { label: 'District Court', searchName: 'District Court', kw: ['district court', 'court', 'court case', 'judge', 'advocate', 'நீதிமன்ரம்'] },
      { label: 'Central Bureau of Investigation (CBI)', searchName: 'CBI office', kw: ['cbi', 'central bureau', 'corruption', 'high profile', '🕵️'] },
      { label: 'National Investigation Agency (NIA)', searchName: 'NIA office', kw: ['nia', 'terrorism', 'national security'] },
      { label: 'Enforcement Directorate (ED)', searchName: 'Enforcement Directorate office', kw: ['ed', 'money laundering', 'pmla', 'raid', 'fema'] },
      { label: 'Narcotics Control Bureau (NCB)', searchName: 'NCB office', kw: ['ncb', 'drugs', 'narcotics', 'marijuana', 'ganja', '💊'] },
      { label: 'Directorate of Revenue Intelligence (DRI)', searchName: 'DRI office', kw: ['dri', 'smuggling', 'customs fraud', 'gold smuggling'] },
      { label: 'VAO Office', searchName: 'VAO office', kw: ['vao', 'village', 'nativity', 'community', 'income', 'patta', 'chitta', 'vivasayam', 'நிலம்', 'பட்டா', 'சிட்டா', 'கிராம நிர்வாக அலுவலர்'] },
      { label: 'Revenue Inspector Office', searchName: 'Revenue Inspector office', kw: ['revenue inspector', 'ri office', 'survey', 'வருவாய் ஆய்வாளர்'] },
      { label: 'Taluk Office', searchName: 'Taluk Office', kw: ['taluk', 'tahsildar', 'certificate', 'legal heir', 'ration card', 'family card', 'pension', 'voter id', 'தாலுகா', 'வட்டாட்சியர்', 'வாரிசு சான்றிதழ்', 'ரேஷன் கார்டு'] },
      { label: 'BDO Office / Panchayat Union', searchName: 'BDO Office Panchayat Union', kw: ['bdo', 'panchayat union', '100 days work', 'mgnrega', 'rural development', 'village drainage', 'street light', 'housing scheme', 'panchayat', 'பஞ்சாயத்து', '100 நாள் வேலை', 'ஊராட்சி'] },
      { label: 'Agriculture Office', searchName: 'Agriculture Office', kw: ['agriculture', 'farmer', 'vivasaya', 'pm-kisan', 'seeds', 'fertilizer', 'crop insurance', 'horticulture', 'agriculture department', 'விவசாயம்', 'உரம்', 'விதை'] },
      { label: 'Veterinary Hospital', searchName: 'Veterinary Hospital Dispensary', kw: ['cow', 'goat', 'buffalo', 'livestock', 'animal sickness', 'veterinary', 'cattle', 'கால்நடை மருத்துவம்'] },
      { label: 'Primary Health Centre (PHC)', searchName: 'Primary Health Centre PHC', kw: ['health', 'phc', 'delivery', 'vaccine', 'doctor', 'medical', 'fever', 'government hospital', 'ஆரம்ப சுகாதார நிலையம்', 'மருத்துவமனை'] },
      { label: 'Ration Shop / PDS', searchName: 'Ration Shop PDS Center', kw: ['ration shop', 'pds center', 'rice', 'sugar', 'kerosene', 'ration shop issue', 'ரேஷன் கடை', 'ரேஷன் அரிசி'] },
      { label: 'District Collector Office', searchName: 'District Collector Office', kw: ['collector', 'collectorate', 'grievance', 'district collector', 'petition', 'மாவட்ட ஆட்சியர்', 'கலெக்டர்'] },
      { label: 'Sub-Registrar Office', searchName: 'Sub Registrar Office', kw: ['sub registrar', 'property', 'sale deed', 'marriage registration', 'encumbrance', 'ec', 'சார்பதிவாளர்'] },
      { label: 'Land Survey Office', searchName: 'Land Survey Office', kw: ['land survey', 'surveyor', 'map', 'fmb', 'நில அளவை'] },
      { label: 'Registration Department Office', searchName: 'Registration Department Office', kw: ['registration office', 'stamp duty', 'பதிவுத் துறை'] },
      { label: 'Municipality Office', searchName: 'Municipality Office', kw: ['municipality', 'corporation', 'birth certificate', 'death certificate', 'property tax', 'water tax', 'water supply', 'street light', 'drainage', 'garbage', 'நகராட்சி', 'மாநகராட்சி', 'தண்ணீர்', 'குப்பை', 'பிறப்பு சான்றிதழ்'] },
      { label: 'EB Office / TANGEDCO', searchName: 'EB Office TANGEDCO', kw: ['eb office', 'electricity', 'power cut', 'current', 'tangedco', 'meter', 'electricity bill', 'மின்சார வாரியம்', 'மின்சாரம்', 'கரண்ட்'] },
      { label: 'Water Board', searchName: 'Water Board office', kw: ['water board', 'drinking water', 'sewage', 'metro water', 'twad', 'water supply', 'leakage', 'தண்ணீர் வாரியம்', 'குடிநீர்'] },
      { label: 'Human Rights Commission', searchName: 'Human Rights Commission', kw: ['human rights', 'rights violation', 'police brutality', 'nhrc', 'shrc', 'மனித உரிமைகள்'] },
      { label: 'National Commission for Women', searchName: 'National Commission for Women', kw: ['women commission', 'ncw', 'women rights'] },
      { label: 'State Commission for Women', searchName: 'State Commission for Women', kw: ['women commission', 'scw', 'women rights'] },
      { label: 'Child Welfare Committee (CWC)', searchName: 'Child Welfare Committee CWC', kw: ['cwc', 'child safety', 'orphan', 'child abuse', 'குழந்தை நலக்குழு'] },
      { label: 'Juvenile Justice Board (JJB)', searchName: 'Juvenile Justice Board JJB', kw: ['jjb', 'juvenile', 'minor crime', 'child offender'] },
      { label: 'Legal Services Authority', searchName: 'Legal Services Authority', kw: ['legal aid', 'free lawyer', 'nalsa', 'talsa', 'சட்ட உதவி'] },
      { label: 'Vigilance Commission', searchName: 'Vigilance Commission', kw: ['vigilance', 'anti corruption', 'bribery', 'ஊழல் எதிர்ப்பு'] },
      { label: 'Lokpal', searchName: 'Lokpal', kw: ['lokpal', 'corruption'] },
      { label: 'Central Jail', searchName: 'Central Jail', kw: ['central jail', 'prison', 'jail', 'சிறை'] },
      { label: 'Sub Jail', searchName: 'Sub Jail', kw: ['sub jail', 'prison'] },
      { label: 'Women Prison', searchName: 'Women Prison', kw: ['women prison', 'female jail'] },
      { label: 'Juvenile Home', searchName: 'Juvenile Home', kw: ['juvenile home', 'minor jail', 'observation home'] },
      { label: 'Notary Public Office', searchName: 'Notary Public', kw: ['notary', 'attestation', 'affidavit', 'நோட்டரி'] },
      { label: 'Advocate / Lawyer Office', searchName: 'Advocate Office', kw: ['advocate', 'lawyer', 'legal consultation', 'வக்கீல்'] },
      { label: 'Public Prosecutor Office', searchName: 'Public Prosecutor office', kw: ['public prosecutor', 'government lawyer'] },
      { label: 'Registrar General Office', searchName: 'Registrar General Court office', kw: ['registrar general', 'court admin'] },
      { label: 'Income Tax Office', searchName: 'Income Tax office', kw: ['income tax', 'pan', 'taxation', 'it return', 'வருமான வரி'] },
      { label: 'Income Tax Appellate Tribunal (ITAT)', searchName: 'Income Tax Appellate Tribunal ITAT', kw: ['itat', 'tax appeal'] },
      { label: 'Debt Recovery Tribunal (DRT)', searchName: 'Debt Recovery Tribunal DRT', kw: ['drt', 'loan recovery', 'bank case'] },
      { label: 'Armed Forces Tribunal (AFT)', searchName: 'Armed Forces Tribunal AFT', kw: ['aft', 'army court', 'defense court'] },
      { label: 'Passport Office', searchName: 'Passport Office', kw: ['passport', 'visa', 'கடவுச்சீட்டு'] },
      { label: 'Election Office', searchName: 'Election office', kw: ['voter id', 'election', 'தேர்தல்'] },
      { label: 'National Green Tribunal (NGT)', searchName: 'National Green Tribunal NGT', kw: ['ngt', 'environment', 'pollution', 'green tribunal'] },
    ];

    const matched = [];
    
    for (const rule of rules) {
      const match = rule.kw.some(keyword => {
        const isTamil = /[^\x00-\x7F]/.test(keyword);
        if (isTamil) {
          return combinedText.includes(keyword);
        } else {
          const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const regex = new RegExp(`\\b${escapedKeyword}\\b`, 'i');
          return regex.test(combinedText);
        }
      });

      if (match) {
        matched.push(buildOffice(rule.label, rule.searchName));
      }
    }

    return matched.slice(0, 4);
  }, [query, response, location, isLocationEnabled]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.aside
          key="nearby-offices-sidebar"
          initial={{ x: 320, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 320, opacity: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="fixed right-0 top-0 h-full w-[300px] bg-slate-900/95 backdrop-blur-xl border-l border-white/10 flex flex-col z-50 shadow-2xl"
        >
          {/* Header */}
          <div className="p-4 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-emerald-500/10 to-transparent">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                <FiMapPin className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white">Nearby Offices</h2>
                <p className="text-xs text-white/50">Searching 1m to 10km radius</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10 text-white/70 hover:text-white transition-colors"
            >
              <FiX className="w-4 h-4" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {!isLocationEnabled ? (
              <div className="flex flex-col items-center justify-center h-full text-center gap-3 py-10">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-2xl">
                  📍
                </div>
                <p className="text-sm font-medium text-white">Location not enabled</p>
                <p className="text-xs text-white/70 leading-relaxed">
                  Enable your location using the button in the chat to see nearby offices within 10 km.
                </p>
              </div>
            ) : !hasGeneratedResponse ? (
              <div className="flex flex-col items-center justify-center h-full text-center gap-4 py-10 px-6">
                <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 flex items-center justify-center text-3xl animate-bounce">
                  💡
                </div>
                <p className="text-sm font-bold text-white">Ready to search!</p>
                <p className="text-xs text-white/70 leading-relaxed">
                  Please ask a legal question first (e.g. Community Certificate, Legal Notice). 
                </p>
                <div className="mt-2 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                  <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider mb-1">How it works:</p>
                  <p className="text-[11px] text-white/70">
                    Once the assistant responds, the location icon will <b>blink</b>. Click it then to see offices within <b>10 km</b>.
                  </p>
                </div>
              </div>
            ) : offices.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center gap-3 py-10">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-2xl">
                  🏛️
                </div>
                <p className="text-sm font-semibold text-white">No Nearby Offices</p>
                <p className="text-xs text-white/70 leading-relaxed">
                  Ask a legal question (e.g. community certificate, FIR, property registration) to see relevant offices within 10 km.
                </p>
                <div className="mt-2 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                  <p className="text-xs text-emerald-400 font-medium">📍 Location is active</p>
                  <p className="text-xs text-white/70 mt-0.5">Offices will appear after your question</p>
                </div>
              </div>
            ) : (
              <>
                <p className="text-xs text-white/50 px-1 pb-1">
                  {offices.length} office{offices.length > 1 ? 's' : ''} found near you
                </p>
                {offices.map((office, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.08, duration: 0.3 }}
                    className="group rounded-xl border border-white/10 bg-white/5 hover:border-emerald-500/40 transition-all p-4 shadow-sm"
                  >
                    {/* Office name */}
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-2xl">
                        {OFFICE_ICONS[office.label] || '🏢'}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-white leading-tight truncate">
                          {office.label}
                        </p>
                        <p className="text-xs text-white/50 mt-0.5">Tap for directions</p>
                      </div>
                    </div>

                    {/* Directions Button */}
                    <a
                      href={office.directionsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full py-2 px-3 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium transition-all active:scale-95 shadow-md"
                    >
                      <FiNavigation className="w-4 h-4" />
                      Get Directions
                    </a>
                  </motion.div>
                ))}
              </>
            )}
          </div>

          {/* Footer hint */}
          <div className="p-3 border-t border-white/10 mt-auto">
            <p className="text-center text-[10px] text-white/50 opacity-70">
              🗺️ Opens in Google Maps with driving route
            </p>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
};

export default NearbyOfficesSidebar;