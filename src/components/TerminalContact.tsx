'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, RotateCcw } from 'lucide-react';

type Stage = 'message' | 'email' | 'success';

// Mirrors the server's check so the error shows before a pointless round trip.
const EMAIL_RE = /^[^\s@<>"'\\]{1,64}@[^\s@<>"'\\.]+(\.[^\s@<>"'\\.]+)+$/;

export default function TerminalContact() {
  const [stage, setStage] = useState<Stage>('message');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  // Honeypot. Hidden from people, so anything here came from a bot.
  const [website, setWebsite] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  const inputRef = useRef<HTMLInputElement>(null);

  const handleTerminalClick = () => {
    if (stage !== 'success' && inputRef.current) {
      inputRef.current.focus({ preventScroll: true });
    }
  };

  const handleKeyDown = async (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      setError('');

      if (stage === 'message' && message.trim()) {
        setStage('email');
      } else if (stage === 'email' && EMAIL_RE.test(email.trim())) {
        setIsProcessing(true);
        try {
          const res = await fetch('/api/contact', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, message, website }),
          });
          const data = await res.json();
          if (!res.ok) {
            setError(data.error || 'Failed to send message.');
          } else {
            setStage('success');
          }
        } catch {
          setError('Network error. Please try again.');
        }
        setIsProcessing(false);
      } else if (stage === 'email') {
        setError("That email address doesn't look right.");
      }
    }
  };

  const handleBack = () => {
    setError('');
    if (stage === 'email') setStage('message');
  };

  const handleReset = () => {
    setStage('message');
    setMessage('');
    setEmail('');
    setWebsite('');
    setIsProcessing(false);
    setError('');
  };

  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (stage !== 'success' && inputRef.current) {
      inputRef.current.focus({ preventScroll: true });
    }
  }, [stage]);

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col items-center">
      <div className="text-center mb-10 flex flex-col items-center">
        <span className="font-handwriting text-3xl text-[#1a1a1a] mb-2">Aadish</span>
        <h2 className="font-serif text-5xl md:text-6xl font-bold leading-tight tracking-tight mb-6 text-[#1a1a1a]">Say hi.</h2>
        <p className="text-[#555] max-w-md text-center leading-relaxed">
          I like meeting people who make things. Type your message below,
          leave your email so I can write back, and your note lands straight
          in my inbox.
        </p>
      </div>

      <div
        className="w-full bg-[#161412] rounded-xl shadow-2xl overflow-hidden font-mono text-sm sm:text-base border border-white/5"
        onClick={handleTerminalClick}
      >
        {/* Top Bar */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#1c1a18] border-b border-white/5">
          <div className="flex items-center gap-4">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
              <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
              <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
            </div>
            <span className="text-gray-500 text-xs tracking-wider">say hi — straight to my inbox</span>
          </div>

          <AnimatePresence>
            {stage !== 'message' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex gap-2"
              >
                <button onClick={handleBack} className="text-gray-400 hover:text-white px-2 py-1 rounded border border-gray-700 hover:border-gray-500 transition-colors flex items-center gap-1 text-xs">
                  <ArrowLeft size={12} /> back
                </button>
                <button onClick={handleReset} className="text-gray-400 hover:text-white px-2 py-1 rounded border border-gray-700 hover:border-gray-500 transition-colors flex items-center gap-1 text-xs">
                  <RotateCcw size={12} /> start over
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Terminal Body */}
        <motion.div layout className="p-6 md:p-8 min-h-[120px] text-gray-300 flex flex-col gap-4 relative cursor-text">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#27c93f]" />
              <span className="text-gray-100">hey — what&apos;s on your mind?</span>
            </div>
            <div className="flex items-start gap-2 text-[#e67e22]">
              <span className="pt-1">message {'>'}</span>
              <div className="flex-1 min-h-[1.5em] break-words whitespace-pre-wrap">
                {message}
                {stage === 'message' && <span className="inline-block w-2 h-[1.1em] bg-[#e67e22] align-middle cursor-blink ml-1" />}
              </div>
            </div>
          </div>

          <AnimatePresence>
            {(stage === 'email' || stage === 'success') && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-2 text-[#e67e22]"
              >
                <span className="pt-1">your email {'>'}</span>
                <div className="flex-1 break-words">
                  {email}
                  {stage === 'email' && <span className="inline-block w-2 h-[1.1em] bg-[#e67e22] align-middle cursor-blink ml-1" />}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {isProcessing && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                role="status"
                className="text-gray-500 italic"
              >
                sending...
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                role="alert"
                className="text-red-400 text-sm"
              >
                ✗ {error}
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {stage === 'success' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                role="status"
                className="text-[#27c93f] mt-2 flex items-center gap-2"
              >
                <span>✓</span> got it — landing in my inbox now.
              </motion.div>
            )}
          </AnimatePresence>

          {/* The real field. It is visually hidden because the caret and the
              typed text are drawn above it, so it needs an explicit label —
              otherwise assistive tech announces a bare edit box. maxLength
              mirrors the server's MAX_MESSAGE / MAX_EMAIL so the ceiling is
              felt while typing rather than as a 400 after submitting. */}
          {stage !== 'success' && (
            <input
              ref={inputRef}
              type={stage === 'email' ? 'email' : 'text'}
              aria-label={stage === 'email' ? 'Your email address' : 'Your message'}
              maxLength={stage === 'email' ? 254 : 5000}
              className="absolute opacity-0 top-0 left-0 w-1 h-1 pointer-events-none"
              value={stage === 'message' ? message : email}
              onChange={(e) => {
                const val = e.target.value;
                if (stage === 'message') setMessage(val);
                if (stage === 'email') setEmail(val.trim());
              }}
              onKeyDown={handleKeyDown}
              disabled={isProcessing}
              autoComplete="off"
              spellCheck={false}
            />
          )}

          {/* Honeypot. Bots fill every field they can parse; people never see
              this one. aria-hidden + tabIndex -1 keep it away from screen
              readers and keyboard users, and the name is one bots look for. */}
          <input
            type="text"
            name="website"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            className="absolute opacity-0 -z-10 w-px h-px pointer-events-none"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
          />
        </motion.div>
      </div>
    </div>
  );
}
