import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiMessageSquare, 
  FiX, 
  FiSend, 
  FiMic, 
  FiMicOff, 
  FiCpu, 
  FiRefreshCw, 
  FiHelpCircle 
} from 'react-icons/fi';
import { aiAPI } from '../../services/api';
import { getOfflineAiResponse } from '../../services/offlineAi';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import aiBotIcon from '../../assets/ai-bot-icon.png';
import './GlobalQueryBot.css';

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

export default function GlobalQueryBot() {
  const location = useLocation();
  const navigate = useNavigate();
  const { login, logout } = useAuth();
  const [chatOpen, setChatOpen] = useState(false);
  const [showGreeting, setShowGreeting] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatSessionId, setChatSessionId] = useState(null);
  const [chatHistory, setChatHistory] = useState([
    {
      sender: 'ai',
      text: '≡ƒæï **Welcome to MedAstraQ!** I am your 24/7 Platform Assistant.\n\nI can help you with:\n- ≡ƒôà [Booking an appointment](/dashboard) with a doctor\n- ≡ƒô¥ [Creating an account](/signup) or [logging in](/login)\n- ≡ƒÆè [Buying & ordering medicines](/my-prescriptions)\n- ≡ƒÄÖ∩╕Å Using AI clinical tools or diagnostic bookings\n- ≡ƒ⌐║ General health and wellness questions\n\n*How can I help you today? You can type your query or click the microphone button next to me to ask with your voice!*'
    }
  ]);
  const [sendingChat, setSendingChat] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const chatBodyRef = useRef(null);

  const isPatientDashboard = !location.pathname.includes('/doctor') &&
                             !location.pathname.includes('/pharmacy') &&
                             !location.pathname.includes('/lab') &&
                             !location.pathname.includes('/hospital') &&
                             !location.pathname.includes('/admin') &&
                             location.pathname !== '/login' &&
                             location.pathname !== '/signup' &&
                             location.pathname !== '/';

  const quickTags = [
    { label: '≡ƒôà Book Appointment', query: 'How do I book a doctor appointment on the platform?' },
    { label: '≡ƒô¥ Sign Up Guide', query: 'How can I register an account as a patient or doctor?' },
    { label: '≡ƒÆè Buy Medicines', query: 'How can I order medicines online using my prescriptions?' },
    { label: '≡ƒÅå Earn Rewards', query: 'How does the EXP checklist and streak rewards program work?' }
  ];

  useEffect(() => {
    if (!SpeechRecognition) return;
    const rec = new SpeechRecognition();
    rec.continuous = false; // Stop listening once user pauses speaking
    rec.interimResults = false;
    rec.lang = 'en-US';

    rec.onstart = () => {
      setIsListening(true);
      toast.success('≡ƒÄÖ∩╕Å Voice assistant listening... Speak now!', { id: 'voice-active' });
    };

    rec.onresult = (event) => {
      const resultText = event.results[0][0].transcript;
      if (resultText && resultText.trim()) {
        handleSendVoiceQuery(resultText);
      }
    };

    rec.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'not-allowed') {
        toast.error('Microphone permission denied! Please allow access in browser settings.', { id: 'voice-active' });
      } else {
        toast.error('Voice input error. Please try again.', { id: 'voice-active' });
      }
      setIsListening(false);
    };

    rec.onend = () => {
      setIsListening(false);
    };

    setRecognition(rec);
  }, []);

  useEffect(() => {
    const handleVoiceQueryEvent = (e) => {
      const query = e.detail?.query;
      if (query) {
        setChatOpen(true);
        handleSendChat(query);
      }
    };
    window.addEventListener('medastraq_voice_query', handleVoiceQueryEvent);
    return () => window.removeEventListener('medastraq_voice_query', handleVoiceQueryEvent);
  }, []);

  useEffect(() => {
    if (location.pathname === '/') {
      const timer = setTimeout(() => {
        setShowGreeting(true);
      }, 1500);
      return () => clearTimeout(timer);
    } else {
      setShowGreeting(false);
    }
  }, [location.pathname]);

  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [chatHistory, sendingChat, chatOpen]);

  const handleToggleListening = () => {
    if (!SpeechRecognition) {
      toast.error('Speech recognition is not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    if (isListening) {
      recognition.stop();
    } else {
      try {
        recognition.start();
      } catch (err) {
        console.error('Failed to start speech recognition:', err);
      }
    }
  };

  const handleSendVoiceQuery = (text) => {
    toast.success(`Captured: "${text}"`, { icon: '≡ƒÄÖ∩╕Å', id: 'voice-captured' });
    setChatOpen(true);
    handleSendChat(text);
  };

  const performNavigation = (route, messageText) => {
    if (messageText) {
      setChatHistory(prev => [...prev, { sender: 'ai', text: messageText }]);
    }
    setChatOpen(true);
    setSendingChat(false);

    window.scrollTo({ top: 0, behavior: 'smooth' });
    navigate(route);

    setTimeout(() => {
      const currentPath = window.location.pathname;
      const targetPath = route.split('?')[0];
      if (currentPath !== targetPath && targetPath !== '/') {
        window.location.href = route;
      }
    }, 450);
  };

  const handleSendChat = async (textToSend) => {
    const msg = textToSend || chatMessage;
    if (!msg.trim() || sendingChat) return;

    setChatHistory(prev => [...prev, { sender: 'user', text: msg }]);
    if (!textToSend) setChatMessage('');
    setSendingChat(true);

    const lowerMsg = msg.toLowerCase();

    const isLoginCommand = lowerMsg.includes('login') || lowerMsg.includes('log in') || lowerMsg.includes('sign in');
    if (isLoginCommand) {
      const roleMap = {
        'doctor': { role: 'DOCTOR', path: '/doctor/dashboard', name: 'Dr. Smith' },
        'admin': { role: 'ADMIN', path: '/admin/dashboard', name: 'Admin User' },
        'hospital': { role: 'HOSPITAL', path: '/hospital/dashboard', name: 'City Hospital' },
        'pharmacy': { role: 'PHARMACY', path: '/pharmacy/dashboard', name: 'Health Pharmacy' },
        'lab': { role: 'LAB', path: '/lab/dashboard', name: 'Central Lab' },
        'student': { role: 'PATIENT', path: '/dashboard', name: 'RASHIKA POONIA' },
        'patient': { role: 'PATIENT', path: '/dashboard', name: 'RASHIKA POONIA' }
      };

      let matchedRole = null;
      for (const [key, data] of Object.entries(roleMap)) {
        if (lowerMsg.includes(key)) {
          matchedRole = data;
          break;
        }
      }

      if (matchedRole) {
        setChatHistory(prev => [...prev, { 
          sender: 'ai', 
          text: `≡ƒöÉ **Logging into ${matchedRole.role} Dashboard...**` 
        }]);
        logout();
        setTimeout(() => {
          login({
            token: 'voice-mock-jwt-token',
            id: '24BCF10024',
            name: matchedRole.name,
            email: 'test@example.com',
            role: matchedRole.role,
            phone: '9999999999'
          });
          localStorage.setItem('user_type', matchedRole.role);
          performNavigation(matchedRole.path, null);
        }, 800);
        return;
      } else {
        performNavigation('/login', '≡ƒöÉ **Navigating to Login page...**\n\nPlease sign in to access your account.');
        return;
      }
    }

    if (lowerMsg.includes('logout') || lowerMsg.includes('log out') || lowerMsg.includes('sign out')) {
      setChatHistory(prev => [...prev, { 
        sender: 'ai', 
        text: '≡ƒæï **Logging out...**' 
      }]);
      setTimeout(() => {
        logout();
        performNavigation('/', '≡ƒÅá **You have been logged out.**');
      }, 800);
      return;
    }
    
    const routeIntents = [
      { keywords: ['about us', 'about', 'who we are', 'jaankari'], route: '/about', message: 'Γä╣∩╕Å **Navigating to About Us page...**\n\nHere you can learn about our campus care mission and team.' },
      { keywords: ['contact us', 'contact', 'reach us', 'helpline', 'sampark', 'support line'], route: '/contact', message: '≡ƒô₧ **Navigating to Contact Us page...**\n\nHere you can send a message or get campus helpline contact details.' },
      { keywords: ['signup', 'sign up', 'register', 'create account', 'naya account', 'registration'], route: '/signup', message: '≡ƒô¥ **Navigating to Sign Up page...**\n\nChoose your profile type to register.' },
      { keywords: ['help center', 'help desk', 'support desk'], route: '/help', message: '≡ƒ¢ƒ **Opening Help Center...**\n\nFind guides, tutorials, and support resources.' },
      { keywords: ['faq', 'faqs', 'frequently asked', 'sawal'], route: '/faq', message: 'Γ¥ô **Opening FAQs...**\n\nView common questions and answers.' },
      { keywords: ['emergency', 'sos', 'ambulance', 'urgent'], route: '/emergency', message: '≡ƒÜ¿ **Triggering Emergency Protocols...**\n\nConnecting you with campus emergency care.' },
      { keywords: ['book appointment', 'doctor appointment', 'book doctor', 'consultation', 'book', 'appointment', 'doctor', 'doctors', 'hospital', 'hospitals', 'booking', 'checkup'], route: '/book/HOS101?autoPilot=true', message: '≡ƒñû **Navigating to Doctor & Hospital Booking...**\n\nSelect a verified doctor or hospital to schedule your appointment.' },
      { keywords: ['my bookings', 'my appointments', 'schedule', 'booking status'], route: '/my-bookings', message: '≡ƒôà **Opening your Bookings...**' },
      { keywords: ['prescription', 'prescriptions', 'medicine', 'pharmacy', 'pill', 'dawai', 'order medicine'], route: '/my-prescriptions', message: '≡ƒÆè **Opening your Prescriptions & Order Medicines...**' },
      { keywords: ['medical leave', 'leave certificate', 'sick leave', 'chutti', 'leave'], route: '/dashboard?tab=medical-leave', message: '≡ƒô¥ **Opening Medical Leave Portal...**' },
      { keywords: ['symptom checker', 'symptom', 'diagnos', 'bimari', 'health check'], route: '/dashboard?tab=symptom-checker', message: '≡ƒ⌐║ **Opening AI Symptom Checker...**' },
      { keywords: ['dashboard', 'my profile', 'portal', 'home page', 'main page'], route: '/dashboard', message: '≡ƒÅá **Taking you to your Dashboard...**' },
      { keywords: ['vaccination', 'vaccine', 'immunization', 'tika'], route: '/dashboard?tab=vaccinations', message: '≡ƒÆë **Opening Vaccination Records...**' },
      { keywords: ['wellness score', 'wellbeing'], route: '/dashboard?tab=wellness-score', message: '≡ƒºÿΓÇìΓÖÇ∩╕Å **Checking your Wellness Score...**' },
      { keywords: ['health map', 'map', 'nearby', 'location', 'rasta'], route: '/dashboard?tab=health-map', message: '≡ƒù║∩╕Å **Opening the Health Map...**' },
      { keywords: ['care plan', 'care'], route: '/dashboard?tab=care-plan', message: '≡ƒôï **Opening your Personalized Care Plan...**' },
      { keywords: ['complementary checkup', 'free checkup', 'full body checkup'], route: '/dashboard?tab=full-body-checkup', message: '≡ƒÄü **Opening Complementary Checkup...**' },
      { keywords: ['rewards', 'points', 'leaderboard', 'rank'], route: '/dashboard?tab=rewards', message: '≡ƒÅå **Opening Rewards Leaderboard...**' },
      { keywords: ['refer', 'referral', 'invite dost'], route: '/dashboard?tab=refer-a-student', message: '≡ƒñ¥ **Opening Student Referral...**' },
      { keywords: ['student health portal', 'health portal'], route: '/dashboard?tab=student-health-portal', message: '≡ƒÄô **Opening Student Health Portal...**' },
      { keywords: ['wellness center', 'mental health', 'counselor', 'stress'], route: '/dashboard?tab=wellness-center', message: '≡ƒÆå **Opening Wellness Center...**' },
      { keywords: ['medicine trends', 'trend'], route: '/dashboard?tab=medicine-trends', message: '≡ƒôê **Opening Medicine Trends...**' },
      { keywords: ['analytics', 'stats', 'statistics', 'graph'], route: '/dashboard?tab=analytics', message: '≡ƒôè **Opening Health Analytics...**' },
      { keywords: ['faculty portal', 'faculty', 'teacher'], route: '/dashboard?tab=faculty-portal', message: '≡ƒæ⌐ΓÇì≡ƒÅ½ **Opening Faculty Portal...**' },
    ];

    let matchedIntent = null;
    for (const intent of routeIntents) {
      if (intent.keywords.some(keyword => lowerMsg.includes(keyword))) {
        matchedIntent = intent;
        break;
      }
    }

    if (matchedIntent) {
      performNavigation(matchedIntent.route, matchedIntent.message);
      return;
    }

    if (!navigator.onLine) {
      setTimeout(async () => {
        try {
          const reply = await getOfflineAiResponse(msg);
          setChatHistory(prev => [...prev, { sender: 'ai', text: reply }]);
        } catch (err) {
          console.error(err);
          setChatHistory(prev => [...prev, { sender: 'ai', text: 'ΓÜá∩╕Å **Error:** Failed to compute offline reply.' }]);
        } finally {
          setSendingChat(false);
        }
      }, 500);
      return;
    }

    try {
      const res = await aiAPI.queryChat(msg, chatSessionId);
      const reply = res.data.reply || 'Sorry, I couldn\'t formulate a reply. Please try again.';
      if (res.data.sessionId) {
        setChatSessionId(res.data.sessionId);
      }
      setChatHistory(prev => [...prev, { sender: 'ai', text: reply }]);
    } catch (err) {
      console.error(err);
      setChatHistory(prev => [...prev, { sender: 'ai', text: 'ΓÜá∩╕Å **Connection Error:** Could not connect to Astra. Please make sure the backend server is running and try again.' }]);
    } finally {
      setSendingChat(false);
    }
  };

  const handleResetChat = async () => {
    try {
      const res = await aiAPI.resetQueryChat(chatSessionId);
      if (res.data.sessionId) {
        setChatSessionId(res.data.sessionId);
      }
      toast.success('Chat history cleared! Fresh session started.');
    } catch (err) {
      console.error('Reset failed', err);
    }
    setChatHistory([
      {
        sender: 'ai',
        text: '≡ƒæï **Session reset!** How can I assist you with MedAstraQ platform queries or wellness support?'
      }
    ]);
  };

  const parseMarkdown = (text) => {
    if (!text) return '';
    const lines = text.split('\n');
    return lines.map((line, index) => {
      let content = line;
      content = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      content = content.replace(/\*(.*?)\*/g, '<em>$1</em>');

      const linkRegex = /\[(.*?)\]\((.*?)\)/g;
      let match;
      let lastIndex = 0;
      const parts = [];

      while ((match = linkRegex.exec(content)) !== null) {
        const [fullMatch, linkText, linkUrl] = match;
        const matchIndex = match.index;

        if (matchIndex > lastIndex) {
          parts.push(
            <span 
              key={`text-${lastIndex}`} 
              dangerouslySetInnerHTML={{ __html: content.substring(lastIndex, matchIndex) }} 
            />
          );
        }

        if (linkUrl.startsWith('/')) {
          parts.push(
            <Link 
              key={`link-${matchIndex}`} 
              to={linkUrl} 
              onClick={() => setChatOpen(false)} // Close bot panel on link click for seamless flow
              className="chat-embedded-link"
            >
              {linkText}
            </Link>
          );
        } else {
          parts.push(
            <a 
              key={`extlink-${matchIndex}`} 
              href={linkUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="chat-embedded-link"
            >
              {linkText}
            </a>
          );
        }
        lastIndex = linkRegex.lastIndex;
      }

      if (lastIndex < content.length) {
        parts.push(
          <span 
            key={`text-${lastIndex}`} 
            dangerouslySetInnerHTML={{ __html: content.substring(lastIndex) }} 
          />
        );
      }

      if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        return (
          <li key={index} className="chat-li">
            {parts.length > 0 ? parts : <span dangerouslySetInnerHTML={{ __html: content.trim().substring(2) }} />}
          </li>
        );
      }

      if (/^\d+\.\s/.test(line.trim())) {
        return (
          <li key={index} className="chat-li-decimal">
            {parts.length > 0 ? parts : <span dangerouslySetInnerHTML={{ __html: content.trim().replace(/^\d+\.\s/, '') }} />}
          </li>
        );
      }

      if (line.trim() === '') {
        return <div key={index} style={{ height: '8px' }} />;
      }

      return (
        <p key={index} className="chat-p">
          {parts.length > 0 ? parts : <span dangerouslySetInnerHTML={{ __html: content }} />}
        </p>
      );
    });
  };

  return createPortal(
    <div className={`global-query-bot-container${isPatientDashboard ? ' dashboard-shifted' : ''}`}>
      
      {/* Voice Status Alert */}
      {isListening && (
        <div className="voice-listening-toast">
          <div className="mic-pulse-ring"></div>
          <span>≡ƒÄÖ∩╕Å Listening to your query...</span>
        </div>
      )}

      {/* Proactive Welcome Greeting Bubble */}
      <AnimatePresence>
        {showGreeting && !chatOpen && (
          <motion.div 
            className="proactive-greeting-bubble"
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          >
            <div className="greeting-header">
              <div className="greeting-title">
                <img src={aiBotIcon} alt="Astra" className="greeting-avatar" />
                <span>MedAstraQ Assistant</span>
              </div>
              <button 
                className="greeting-close-btn" 
                onClick={(e) => { e.stopPropagation(); setShowGreeting(false); }}
                title="Dismiss greeting"
              >
                <FiX size={14} />
              </button>
            </div>
            
            <div className="greeting-body">
              <p>≡ƒæï <strong>Greetings! Welcome to MedAstraQ.</strong></p>
              <p>How can I assist you today? Ask any query or try voice commands!</p>
            </div>

            <div className="greeting-actions">
              <button 
                className="greeting-action-btn primary"
                onClick={() => { setShowGreeting(false); setChatOpen(true); }}
              >
                ≡ƒÆ¼ Start Chat
              </button>
              <button 
                className="greeting-action-btn secondary"
                onClick={() => { setShowGreeting(false); handleSendChat('book appointment'); }}
              >
                ≡ƒôà Book Doctor
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Button: AI Assistant Trigger */}
      <div className="global-bot-fab-group">
        <button 
          className={`global-chat-fab ${chatOpen ? 'open' : ''}`} 
          onClick={() => { setShowGreeting(false); setChatOpen(!chatOpen); }}
          title="MedAstraQ Platform Assistant"
        >
          {chatOpen ? (
            <FiX size={22} />
          ) : (
            <div className="chat-fab-inner">
              <img src={aiBotIcon} alt="AI Helper" className="fab-bot-img" />
              <span className="fab-glow-effect"></span>
            </div>
          )}
        </button>
      </div>

      {/* Chat Interface Panel Overlay */}
      <AnimatePresence>
        {chatOpen && (
          <motion.div 
            className="global-chat-panel"
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.96 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          >
            {/* Panel Header */}
            <div className="global-chat-header">
              <div className="header-info">
                <div className="header-avatar">
                  <img src={aiBotIcon} alt="Astra" className="header-avatar-img" />
                </div>
                <div className="header-text">
                  <span className="header-title">Astra</span>
                  {!navigator.onLine ? (
                    <span className="header-subtitle" style={{ color: '#1d467c', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span className="offline-indicator-dot" style={{ backgroundColor: '#1d467c', boxShadow: '0 0 6px #1d467c' }}></span>
                      Offline Mode (TF.js)
                    </span>
                  ) : (
                    <span className="header-subtitle">
                      <span className="online-indicator-dot"></span>
                      24/7 Platform Guide
                    </span>
                  )}
                </div>
              </div>
              
              <div className="header-actions">
                <button
                  onClick={handleResetChat}
                  title="Reset Conversation"
                  className="header-btn-reset"
                >
                  <FiRefreshCw size={14} />
                </button>
                <button 
                  onClick={() => setChatOpen(false)} 
                  className="header-btn-close"
                >
                  <FiX size={18} />
                </button>
              </div>
            </div>

            {/* Chat History Area */}
            <div className="global-chat-body" ref={chatBodyRef}>
              {chatHistory.map((chat, i) => (
                <div key={i} className={`global-chat-message ${chat.sender}`}>
                  <span className="message-sender-name">
                    {chat.sender === 'user' ? 'You' : 'Astra'}
                  </span>
                  <div className="message-bubble">
                    {chat.sender === 'ai' ? parseMarkdown(chat.text) : chat.text}
                  </div>
                </div>
              ))}
              
              {sendingChat && (
                <div className="global-chat-message ai">
                  <span className="message-sender-name">Astra</span>
                  <div className="message-bubble typing">
                    <FiCpu className="typing-spinner" />
                    <span>Thinking...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Suggested Tags Area */}
            <div className="global-chat-suggestions">
              {quickTags.map((tag, i) => (
                <button 
                  key={i} 
                  className="suggestion-pill" 
                  onClick={() => handleSendChat(tag.query)}
                >
                  <FiHelpCircle size={12} className="pill-icon" />
                  <span>{tag.label}</span>
                </button>
              ))}
            </div>

            {/* Chat Input form */}
            <form 
              onSubmit={(e) => { e.preventDefault(); handleSendChat(); }} 
              className="global-chat-input-area"
            >
              <input 
                type="text" 
                className="global-chat-input-field" 
                placeholder="Ask how to book, sign up, buy..." 
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                disabled={sendingChat}
              />
              <button 
                type="submit" 
                className="global-chat-send-btn" 
                disabled={sendingChat || !chatMessage.trim()}
              >
                <FiSend size={16} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>,
    document.body
  );
}

