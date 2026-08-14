import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiMic, FiMicOff } from 'react-icons/fi';
import toast from 'react-hot-toast';
import './VoiceAssistant.css';
import { aiAPI } from '../../services/api';

export default function VoiceAssistant() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef(null);
  const convStateRef = useRef('IDLE');
  const bookingDataRef = useRef({ symptoms: '', time: '' });
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, logout } = useAuth();
  const isPatientDashboard = !location.pathname.includes('/doctor') &&
                             !location.pathname.includes('/pharmacy') &&
                             !location.pathname.includes('/lab') &&
                             !location.pathname.includes('/hospital') &&
                             !location.pathname.includes('/admin') &&
                             location.pathname !== '/login' &&
                             location.pathname !== '/signup' &&
                             location.pathname !== '/';

  const speak = (message) => {
    window.speechSynthesis.cancel(); // Cancel any ongoing speech
    const utterance = new SpeechSynthesisUtterance(message);
    utterance.onend = () => {
      if (convStateRef.current !== 'IDLE' && recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (e) {
          console.error(e);
        }
      }
    };
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('Speech Recognition API not supported in this browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      toast('Listening...', { icon: '≡ƒÄñ', duration: 2000 });
    };

    recognition.onresult = (event) => {
      const current = event.resultIndex;
      const resultTranscript = event.results[current][0].transcript.toLowerCase();
      setTranscript(resultTranscript);
      handleIntent(resultTranscript);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error', event.error);
      setIsListening(false);
      toast.error('Could not hear you properly. Try again.');
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
  }, []);

  const handleIntent = async (text) => {
    if (!text || !text.trim()) return;

    // 1. Cancel any active speech output
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    toast.success(`≡ƒÄÖ∩╕Å Heard: "${text}"`, { duration: 3000, icon: '≡ƒÄñ' });

    // 2. Dispatch event to open General Query Bot window and render query steps
    window.dispatchEvent(new CustomEvent('medastraq_voice_query', { detail: { query: text } }));
  };

  const toggleListen = () => {
    if (!recognitionRef.current) {
      toast.error('Voice commands are not supported in your browser.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      setTranscript('');
      recognitionRef.current.start();
    }
  };

  return createPortal(
    <div className={`voice-assistant-wrapper${isPatientDashboard ? ' dashboard-shifted' : ''}`}>
      <button 
        className={`fab-button voice-fab ${isListening ? 'listening' : ''}`}
        onClick={toggleListen}
        title="Voice Commands"
      >
        {isListening ? <FiMicOff /> : <FiMic />}
      </button>
      {isListening && <div className="voice-fab-pulse"></div>}
    </div>,
    document.body
  );
}

