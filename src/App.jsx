import React, { useState, useEffect, useRef } from 'react';
import { Camera, Upload, FileText, Clock, AlertCircle, CheckCircle, Share2, Volume2, History, Trash2, Moon, Sun, BarChart3, X, Shield, Bell, Download, Eye, EyeOff, MessageSquare, Gauge, CheckSquare, AlertTriangle, ExternalLink } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('upload');
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [language, setLanguage] = useState('ta');
  const [documentHistory, setDocumentHistory] = useState([]);
  const [darkMode, setDarkMode] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState('');
  const [showStats, setShowStats] = useState(false);
  const [privacyMode, setPrivacyMode] = useState(false);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [reminderPhone, setReminderPhone] = useState('');
  const [checklist, setChecklist] = useState([]);
  const [showFamilyExplain, setShowFamilyExplain] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!privacyMode) {
      const saved = localStorage.getItem('legalSaralHistory');
      if (saved) setDocumentHistory(JSON.parse(saved));
    }
  }, [privacyMode]);

  const stats = {
    total: documentHistory.length,
    highUrgency: documentHistory.filter(d => d.explanation?.urgency === 'high').length,
    saved: documentHistory.length * 300,
    thisMonth: documentHistory.filter(d => new Date(d.date).getMonth() === new Date().getMonth()).length
  };

  const showToast = (msg) => {
    setNotificationMsg(msg);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  const saveToHistory = (data) => {
    if (privacyMode) {
      showToast(language === 'ta' ? '🔒 தனியுரிமை - சேமிக்கப்படவில்லை' : '🔒 Not saved');
      return;
    }
    const newHistory = [{ id: Date.now(), date: new Date().toISOString(), ...data }, ...documentHistory].slice(0, 20);
    setDocumentHistory(newHistory);
    localStorage.setItem('legalSaralHistory', JSON.stringify(newHistory));
    showToast(language === 'ta' ? '✓ சேமிக்கப்பட்டது!' : '✓ Saved!');
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setActiveTab('result');
      processDocument(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const processDocument = (imageData) => {
    setProcessing(true);
    setResult(null);
    setTimeout(() => {
      const demoResult = {
        documentType: language === 'ta' ? 'மின்சார கட்டண அறிவிப்பு' : 'Electricity Bill Notice',
        summary: language === 'ta' ? 'உங்கள் மின் கட்டணம் 3 மாதமாக செலுத்தப்படவில்லை. மொத்தம் ₹4,500 நிலுவையில் உள்ளது.' : 'Your electricity bill has not been paid for 3 months. Total outstanding: ₹4,500.',
        actionRequired: language === 'ta' ? '15 நாட்களுக்குள் ₹4,500 செலுத்தவும். இல்லையெனில் மின்சாரம் துண்டிக்கப்படும்.' : 'Pay ₹4,500 within 15 days or electricity will be disconnected.',
        deadline: '2026-01-17',
        urgency: 'high',
        consequences: language === 'ta' ? 'கட்டணம் செலுத்தாவிட்டால்: மின்சாரம் துண்டிப்பு + ₹1,000 கட்டணம்' : 'If not paid: Disconnection + ₹1,000 fee',
        nextSteps: language === 'ta' ? ['TNEB அலுவலகம் செலுத்தவும்', 'ரசீதை பாதுகாக்கவும்', 'ஆட்டோ-பே அமைக்கவும்'] : ['Pay at TNEB office', 'Keep receipt', 'Set up auto-pay'],
        estimatedCost: '₹4,500',
        professionalHelpNeeded: false,
        confidenceScore: 94,
        isScam: false,
        officialLinks: [{ name: 'TNEB Payment', url: 'https://www.tnebnet.org/' }],
        familySummary: language === 'ta' ? 'மின் கட்டணம் 3 மாதம் கட்டவில்லை. ₹4,500 செலுத்த வேண்டும். 15 நாட்களுக்குள் செலுத்தாவிட்டால் மின்சாரம் துண்டிக்கப்படும்.' : 'Bill not paid for 3 months. Pay ₹4,500 in 15 days or power will be cut.'
      };
      setResult(demoResult);
      setChecklist(demoResult.nextSteps.map((step, idx) => ({ id: idx, text: step, completed: false })));
      saveToHistory({ imageUrl: imageData, explanation: demoResult, language });
      setProcessing(false);
    }, 2000);
  };

  const toggleChecklistItem = (id) => {
    setChecklist(checklist.map(item => item.id === id ? { ...item, completed: !item.completed } : item));
  };

  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === 'ta' ? 'ta-IN' : 'en-IN';
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const shareWhatsApp = () => {
    if (!result) return;
    const msg = `📄 ${result.documentType}\n\n🎯 ${result.actionRequired}\n\n⏰ ${result.deadline}\n💰 ${result.estimatedCost}\n\nLegalSaral App`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const getUrgencyColor = (urgency) => {
    const colors = { high: darkMode ? 'bg-red-500/20 text-red-300 border-red-500' : 'bg-red-50 text-red-700 border-red-200', medium: darkMode ? 'bg-orange-500/20 text-orange-300 border-orange-500' : 'bg-orange-50 text-orange-700 border-orange-200', low: darkMode ? 'bg-green-500/20 text-green-300 border-green-500' : 'bg-green-50 text-green-700 border-green-200' };
    return colors[urgency] || '';
  };

  const getConfidenceColor = (score) => {
    if (score >= 90) return darkMode ? 'text-green-400' : 'text-green-600';
    if (score >= 70) return darkMode ? 'text-yellow-400' : 'text-yellow-600';
    return darkMode ? 'text-red-400' : 'text-red-600';
  };

  const bg = darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50';
  const card = darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white/90 backdrop-blur-xl shadow-2xl border-white/50';
  const text = darkMode ? 'text-gray-100' : 'text-gray-900';
  const muted = darkMode ? 'text-gray-400' : 'text-gray-600';

  return (
    <div className={`min-h-screen ${bg} p-4 transition-colors duration-500`}>
      {showNotification && (
        <div className="fixed top-4 right-4 z-50 animate-bounce">
          <div className={`${card} px-6 py-4 rounded-2xl border-2 flex items-center gap-3`}>
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span className={text}>{notificationMsg}</span>
          </div>
        </div>
      )}

      {showReminderModal && result?.deadline && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`${card} rounded-3xl p-8 max-w-md w-full border-2`}>
            <div className="flex justify-between items-center mb-6">
              <h3 className={`text-2xl font-bold ${text}`}><Bell className="w-6 h-6 inline mr-2" />{language === 'ta' ? 'நினைவூட்டல்' : 'Reminder'}</h3>
              <button onClick={() => setShowReminderModal(false)}><X className={`w-6 h-6 ${muted}`} /></button>
            </div>
            <div className="space-y-4">
              <p className={`text-xl font-bold ${text}`}>{result.deadline}</p>
              <input type="tel" value={reminderPhone} onChange={(e) => setReminderPhone(e.target.value)} placeholder="+91 9876543210" className={`w-full px-4 py-3 rounded-xl border-2 ${darkMode ? 'bg-gray-700 text-white' : 'bg-white'}`} />
              <button onClick={() => { showToast('✓ Reminder set'); setShowReminderModal(false); }} className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-xl font-bold">Set</button>
            </div>
          </div>
        </div>
      )}

      {showFamilyExplain && result && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`${card} rounded-3xl p-8 max-w-2xl w-full border-2`}>
            <div className="flex justify-between items-center mb-6">
              <h3 className={`text-2xl font-bold ${text}`}><MessageSquare className="w-6 h-6 inline mr-2" />{language === 'ta' ? 'குடும்பம்' : 'Family'}</h3>
              <button onClick={() => setShowFamilyExplain(false)}><X className={`w-6 h-6 ${muted}`} /></button>
            </div>
            <div className={`p-6 rounded-2xl ${darkMode ? 'bg-blue-900/20' : 'bg-blue-50'}`}>
              <p className={`text-lg ${text}`}>{result.familySummary}</p>
            </div>
            <div className="mt-6 flex gap-3">
              <button onClick={() => { navigator.clipboard.writeText(result.familySummary); showToast('✓ Copied'); }} className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold">Copy</button>
              <button onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(result.familySummary)}`, '_blank')} className="flex-1 bg-green-600 text-white py-3 rounded-xl font-bold">WhatsApp</button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8 pt-6">
          <div className="flex items-center justify-center gap-4 mb-4">
            <Shield className="w-14 h-14 text-indigo-600 animate-pulse" />
            <h1 className={`text-5xl font-black ${text}`}>LegalSaral Ultra</h1>
          </div>
          <p className={`${muted} text-xl mb-4`}>{language === 'ta' ? '🛡️ பாதுகாப்பான சட்ட உதவி' : '🛡️ Safe Legal Help'}</p>
          
          <div className="flex justify-center gap-2 flex-wrap">
            <button onClick={() => setLanguage('ta')} className={`px-4 py-2 rounded-xl font-bold ${language === 'ta' ? 'bg-indigo-600 text-white' : darkMode ? 'bg-gray-700 text-gray-300' : 'bg-white text-gray-700'}`}>தமிழ்</button>
            <button onClick={() => setLanguage('en')} className={`px-4 py-2 rounded-xl font-bold ${language === 'en' ? 'bg-indigo-600 text-white' : darkMode ? 'bg-gray-700 text-gray-300' : 'bg-white text-gray-700'}`}>English</button>
            <button onClick={() => setShowStats(!showStats)} className={`px-4 py-2 rounded-xl font-bold ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-white text-gray-700'}`}><BarChart3 className="w-5 h-5" /></button>
            <button onClick={() => setPrivacyMode(!privacyMode)} className={`px-4 py-2 rounded-xl font-bold ${privacyMode ? 'bg-green-600 text-white' : darkMode ? 'bg-gray-700 text-gray-300' : 'bg-white text-gray-700'}`}>{privacyMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
            <button onClick={() => setDarkMode(!darkMode)} className={`px-4 py-2 rounded-xl font-bold ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-white text-gray-700'}`}>{darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}</button>
          </div>
        </div>

        {showStats && (
          <div className={`${card} rounded-3xl p-6 mb-6 border-2`}>
            <h3 className={`text-2xl font-bold ${text} mb-6`}>📊 {language === 'ta' ? 'புள்ளிவிவரம்' : 'Statistics'}</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-2xl text-white"><p className="text-sm opacity-80">Total</p><p className="text-4xl font-black">{stats.total}</p></div>
              <div className="bg-gradient-to-br from-red-500 to-red-600 p-6 rounded-2xl text-white"><p className="text-sm opacity-80">Urgent</p><p className="text-4xl font-black">{stats.highUrgency}</p></div>
              <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-2xl text-white"><p className="text-sm opacity-80">Saved</p><p className="text-4xl font-black">₹{stats.saved}</p></div>
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-2xl text-white"><p className="text-sm opacity-80">Month</p><p className="text-4xl font-black">{stats.thisMonth}</p></div>
            </div>
          </div>
        )}

        <div className={`${card} rounded-3xl p-2 mb-6 border-2 flex gap-2`}>
          <button onClick={() => setActiveTab('upload')} className={`flex-1 py-4 px-4 rounded-2xl font-bold flex items-center justify-center gap-2 ${activeTab === 'upload' ? 'bg-indigo-600 text-white' : muted}`}><Upload className="w-5 h-5" /><span className="hidden md:inline">{language === 'ta' ? 'பதிவேற்று' : 'Upload'}</span></button>
          <button onClick={() => setActiveTab('result')} disabled={!result && !processing} className={`flex-1 py-4 px-4 rounded-2xl font-bold flex items-center justify-center gap-2 ${activeTab === 'result' ? 'bg-indigo-600 text-white' : muted}`}><FileText className="w-5 h-5" /><span className="hidden md:inline">{language === 'ta' ? 'முடிவு' : 'Result'}</span></button>
          <button onClick={() => setActiveTab('history')} className={`flex-1 py-4 px-4 rounded-2xl font-bold flex items-center justify-center gap-2 ${activeTab === 'history' ? 'bg-indigo-600 text-white' : muted}`}><History className="w-5 h-5" /><span className="hidden md:inline">{language === 'ta' ? 'வரலாறு' : 'History'}</span>{documentHistory.length > 0 && <span className="bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">{documentHistory.length}</span>}</button>
        </div>

        {activeTab === 'upload' && (
          <div className={`${card} rounded-3xl p-12 border-2`}>
            <Camera className="w-24 h-24 text-indigo-600 mx-auto mb-6 animate-bounce" />
            <h2 className={`text-3xl font-black ${text} text-center mb-4`}>{language === 'ta' ? 'ஆவணம் பதிவேற்று' : 'Upload Document'}</h2>
            <input ref={fileInputRef} type="file" accept="image/*" capture="environment" onChange={handleImageUpload} className="hidden" />
            <div onClick={() => fileInputRef.current?.click()} className={`border-4 border-dashed border-indigo-400 rounded-3xl p-20 cursor-pointer hover:scale-105 transition-all ${darkMode ? 'bg-indigo-900/20' : 'bg-gradient-to-br from-indigo-50 to-purple-50'}`}>
              <Upload className="w-20 h-20 text-indigo-600 mx-auto mb-4" />
              <p className="text-indigo-600 font-bold text-2xl text-center">{language === 'ta' ? 'கிளிக் செய்யவும்' : 'Click to Upload'}</p>
            </div>
          </div>
        )}

        {activeTab === 'result' && (
          <div className={`${card} rounded-3xl p-8 border-2`}>
            {processing ? (
              <div className="text-center py-20">
                <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-indigo-600 mx-auto mb-6"></div>
                <p className={`${text} text-2xl font-bold`}>{language === 'ta' ? 'பகுப்பாய்வு...' : 'Analyzing...'}</p>
              </div>
            ) : result ? (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div><h2 className={`text-3xl font-black ${text}`}>{result.documentType}</h2></div>
                  <div className="flex items-center gap-2"><Gauge className={`w-8 h-8 ${getConfidenceColor(result.confidenceScore)}`} /><p className={`text-2xl font-black ${getConfidenceColor(result.confidenceScore)}`}>{result.confidenceScore}%</p></div>
                </div>

                {result.isScam && (
                  <div className="bg-red-500/20 border-4 border-red-500 rounded-2xl p-6">
                    <div className="flex items-center gap-4"><AlertTriangle className="w-12 h-12 text-red-600" /><h3 className="text-2xl font-black text-red-600">{language === 'ta' ? '⚠️ மோசடி!' : '⚠️ SCAM!'}</h3></div>
                  </div>
                )}

                <div className={`p-6 rounded-2xl ${darkMode ? 'bg-blue-900/20' : 'bg-blue-50'}`}><p className={`${text} text-lg`}>{result.summary}</p></div>

                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-8 rounded-3xl"><h3 className="text-2xl font-black mb-3">🎯 {language === 'ta' ? 'என்ன செய்ய வேண்டும்?' : 'What to Do?'}</h3><p className="text-xl">{result.actionRequired}</p></div>

                {result.deadline && (
                  <div className={`border-4 p-6 rounded-3xl ${getUrgencyColor(result.urgency)} flex justify-between items-center`}>
                    <div><Clock className="w-8 h-8 mb-2" /><h3 className="text-xl font-black">⏰ Deadline</h3><p className="text-2xl font-black mt-2">{result.deadline}</p></div>
                    <button onClick={() => setShowReminderModal(true)} className="bg-white/20 px-6 py-3 rounded-xl font-bold"><Bell className="w-5 h-5" /></button>
                  </div>
                )}

                <div className={`p-6 rounded-2xl ${darkMode ? 'bg-red-900/20' : 'bg-red-50'}`}><h3 className={`text-xl font-black mb-3 ${darkMode ? 'text-red-400' : 'text-red-700'}`}>⚠️ Consequences</h3><p className={`${text}`}>{result.consequences}</p></div>

                <div className={`p-8 rounded-3xl ${darkMode ? 'bg-green-900/20' : 'bg-green-50'}`}>
                  <h3 className={`text-2xl font-black mb-6 ${darkMode ? 'text-green-300' : 'text-green-800'}`}>💡 Checklist</h3>
                  <div className="space-y-3">
                    {checklist.map(item => (
                      <div key={item.id} onClick={() => toggleChecklistItem(item.id)} className={`flex items-start gap-4 p-4 rounded-xl cursor-pointer ${item.completed ? 'bg-green-200 opacity-60' : darkMode ? 'bg-gray-700' : 'bg-white'}`}>
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold ${item.completed ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-700'}`}>{item.completed ? '✓' : item.id + 1}</div>
                        <span className={`${text} pt-1 ${item.completed && 'line-through'}`}>{item.text}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {result.officialLinks?.length > 0 && (
                  <div className={`p-6 rounded-2xl ${darkMode ? 'bg-blue-900/20' : 'bg-blue-50'}`}>
                    <h3 className={`text-xl font-black mb-4 ${darkMode ? 'text-blue-300' : 'text-blue-800'}`}>🔗 Official Links</h3>
                    {result.officialLinks.map((link, idx) => (
                      <a key={idx} href={link.url} target="_blank" rel="noopener noreferrer" className={`flex items-center justify-between p-4 rounded-xl mt-2 ${darkMode ? 'bg-gray-700' : 'bg-white'}`}><span className={text}>{link.name}</span><ExternalLink className="w-5 h-5 text-blue-600" /></a>
                    ))}
                  </div>
                )}

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <button onClick={shareWhatsApp} className="bg-green-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2"><Share2 className="w-5 h-5" /><span className="hidden md:inline">Share</span></button>
                  <button onClick={() => isSpeaking ? window.speechSynthesis.cancel() : speakText(result.summary)} className="bg-blue-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2"><Volume2 className="w-5 h-5" /><span className="hidden md:inline">Listen</span></button>
                  <button onClick={() => setShowFamilyExplain(true)} className="bg-purple-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2"><MessageSquare className="w-5 h-5" /><span className="hidden md:inline">Family</span></button>
                  <button onClick={() => showToast('PDF Ready')} className="bg-red-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2"><Download className="w-5 h-5" /><span className="hidden md:inline">PDF</span></button>
                </div>
              </div>
            ) : (
              <div className="text-center py-20"><FileText className={`w-24 h-24 ${muted} mx-auto mb-4 opacity-30`} /><p className={muted}>Upload a document first</p></div>
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div className={`${card} rounded-3xl p-8 border-2`}>
            <h2 className={`text-3xl font-black ${text} mb-6`}>{language === 'ta' ? 'வரலாறு' : 'History'}</h2>
            {documentHistory.length === 0 ? (
              <div className="text-center py-20"><History className={`w-24 h-24 ${muted} mx-auto mb-4 opacity-30`} /><p className={muted}>No documents yet</p></div>
            ) : (
              <div className="space-y-4">
                {documentHistory.map(doc => (
                  <div key={doc.id} className={`border-2 rounded-2xl p-6 ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <div className="flex justify-between items-start">
                      <div><h3 className={`font-black ${text} text-lg`}>{doc.explanation.documentType}</h3><p className={`${muted} text-sm mt-1`}>{doc.explanation.summary}</p></div>
                      <button onClick={() => { const newHistory = documentHistory.filter(d => d.id !== doc.id); setDocumentHistory(newHistory); localStorage.setItem('legalSaralHistory', JSON.stringify(newHistory)); }} className="text-red-600"><Trash2 className="w-5 h-5" /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="text-center mt-8"><p className={`${muted} text-sm`}>🛡️ Powered by Google Technologies</p><p className={`${muted} text-xs mt-1`}>Gemini AI • Firebase • Google Cloud</p></div>
      </div>
    </div>
  );
}