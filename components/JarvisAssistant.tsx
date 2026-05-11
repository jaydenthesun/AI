"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Mic,
  MicOff,
  Send,
  Sparkles,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { getJarvisMockReply } from "@/lib/jarvisResponses";

type ChatRole = "user" | "assistant";

interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
}

function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function pickEnglishVoice(): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  return (
    voices.find((v) => v.lang.startsWith("en") && /Google|Microsoft|Samantha|Daniel/i.test(v.name)) ??
    voices.find((v) => v.lang.startsWith("en-US")) ??
    voices.find((v) => v.lang.startsWith("en")) ??
    null
  );
}

function speakAloud(text: string, onComplete?: () => void): void {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  const plain = text.replace(/\s+/g, " ").slice(0, 8000);
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(plain);
  u.rate = 1.02;
  u.pitch = 1;
  const v = pickEnglishVoice();
  if (v) u.voice = v;
  u.onend = () => onComplete?.();
  u.onerror = () => onComplete?.();
  window.speechSynthesis.speak(u);
}

type RecognitionErr = "not_supported" | "not_allowed" | "no_speech" | "unknown";

/** Minimal typing for Web Speech API recognition (vendor prefixes vary). */
interface BrowserSpeechRecognition extends EventTarget {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  continuous: boolean;
  start(): void;
  stop(): void;
  onstart: ((ev: Event) => void) | null;
  onend: ((ev: Event) => void) | null;
  onerror: ((ev: Event & { error?: string }) => void) | null;
  onresult: ((ev: Event & { results: Iterable<{ 0: { transcript: string } }> }) => void) | null;
}

type SpeechRecCtor = new () => BrowserSpeechRecognition;

function getSpeechRecognitionCtor(): SpeechRecCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { SpeechRecognition?: SpeechRecCtor; webkitSpeechRecognition?: SpeechRecCtor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

function JarvisSphere({
  mode,
}: {
  mode: "idle" | "thinking" | "speaking";
}) {
  const active = mode !== "idle";

  return (
    <div className="relative mx-auto flex h-[72px] w-[72px] items-center justify-center">
      <AnimatePresence>
        {active && (
          <>
            <motion.span
              className="absolute inset-0 rounded-full border border-cyan-400/40"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: [1, 1.35, 1], opacity: [0.35, 0.08, 0.35] }}
              transition={{ duration: mode === "thinking" ? 1.2 : 0.9, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.span
              className="absolute inset-[-8px] rounded-full border border-violet-400/25"
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: [1, 1.45, 1], opacity: [0.25, 0.05, 0.25] }}
              transition={{ duration: mode === "thinking" ? 1.5 : 1.1, repeat: Infinity, ease: "easeInOut", delay: 0.15 }}
            />
          </>
        )}
      </AnimatePresence>

      <motion.div
        className="relative h-14 w-14 rounded-full bg-gradient-to-br from-cyan-400/90 via-violet-500/80 to-fuchsia-500/90 shadow-[0_0_32px_rgba(94,234,212,0.45),0_0_60px_rgba(167,139,250,0.35)]"
        animate={
          active
            ? { rotate: [0, 6, -6, 0], scale: [1, 1.04, 1] }
            : { rotate: [0, 3, -3, 0], scale: 1 }
        }
        transition={{
          duration: active ? 2.4 : 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <div className="absolute inset-[3px] rounded-full bg-gradient-to-t from-black/50 to-white/10 blur-[0.5px]" />
        <div className="absolute left-2 top-2 h-3 w-5 rounded-full bg-white/35 blur-md" />
      </motion.div>
    </div>
  );
}

export function JarvisAssistant() {
  const pathname = usePathname() ?? "/";
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: "welcome",
      role: "assistant",
      content:
        "CodePath Agent mentor online. I'm tuned for this OS—routing, lessons, reviews, and pace. Use quick actions or ask anything about your path.",
    },
  ]);
  const [thinking, setThinking] = useState(false);
  const [voiceOut, setVoiceOut] = useState(true);
  const [speaking, setSpeaking] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [speechInSupported, setSpeechInSupported] = useState(false);
  const [speechOutSupported, setSpeechOutSupported] = useState(false);
  const [micListening, setMicListening] = useState(false);
  const [micError, setMicError] = useState<RecognitionErr | null>(null);

  const recognitionRef = useRef<BrowserSpeechRecognition | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setSpeechOutSupported("speechSynthesis" in window);
    setSpeechInSupported(!!getSpeechRecognitionCtor());

    const onVoices = () => pickEnglishVoice();
    window.speechSynthesis.addEventListener("voiceschanged", onVoices);
    return () => window.speechSynthesis.removeEventListener("voiceschanged", onVoices);
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open]);

  const sphereMode = thinking ? "thinking" : speaking ? "speaking" : "idle";

  const pushAssistant = useCallback(
    (content: string) => {
      setMessages((m) => [...m, { id: makeId(), role: "assistant", content }]);
      if (voiceOut && speechOutSupported) {
        setSpeaking(true);
        speakAloud(content, () => setSpeaking(false));
      }
    },
    [voiceOut, speechOutSupported],
  );

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const runReply = useCallback(
    async (userText: string) => {
      const trimmed = userText.trim();
      if (!trimmed) return;

      const priorHistory = messages
        .filter((m) => m.id !== "welcome")
        .map(({ role, content }) => ({ role, content }));

      setMessages((m) => [...m, { id: makeId(), role: "user", content: trimmed }]);
      setThinking(true);

      try {
        const res = await fetch("/api/jarvis/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pathname,
            message: trimmed,
            history: priorHistory,
          }),
        });
        const data = (await res.json()) as { reply?: string; warning?: string; hint?: string };
        const reply =
          typeof data.reply === "string" && data.reply.trim()
            ? data.reply
            : getJarvisMockReply(trimmed, pathname);
        pushAssistant(reply);
        if (data.warning ?? data.hint) console.info("[Jarvis]", data.warning ?? data.hint);
      } catch {
        pushAssistant(getJarvisMockReply(trimmed, pathname));
      } finally {
        setThinking(false);
      }
    },
    [messages, pathname, pushAssistant],
  );

  const handleSend = () => {
    const t = input.trim();
    if (!t || thinking) return;
    setInput("");
    void runReply(t);
  };

  const quick = (preset: string) => {
    if (thinking) return;
    if (preset === "explain") {
      void runReply("Explain this page.");
      return;
    }
    const prompts: Record<string, string> = {
      practice: "Give me a concrete practice task for CodePath.",
      review: "I want feedback on code quality—where should I go?",
      next: "What should I do next on my roadmap?",
    };
    const text = prompts[preset];
    if (text) void runReply(text);
  };

  const toggleMic = () => {
    setMicError(null);
    if (!speechInSupported || typeof window === "undefined") {
      setMicError("not_supported");
      return;
    }
    const SR = getSpeechRecognitionCtor();
    if (!SR) {
      setMicError("not_supported");
      return;
    }
    if (micListening) {
      recognitionRef.current?.stop();
      setMicListening(false);
      return;
    }

    try {
      const rec = new SR();
      rec.lang = "en-US";
      rec.interimResults = false;
      rec.maxAlternatives = 1;
      rec.continuous = false;
      recognitionRef.current = rec;

      rec.onstart = () => setMicListening(true);
      rec.onend = () => setMicListening(false);
      rec.onerror = (ev: Event & { error?: string }) => {
        setMicListening(false);
        const code = ev.error;
        if (code === "not-allowed" || code === "service-not-allowed") setMicError("not_allowed");
        else if (code === "no-speech") setMicError("no_speech");
        else setMicError("unknown");
      };
      rec.onresult = (ev: Event) => {
        const results = (ev as unknown as { results?: Array<{ 0?: { transcript?: string } }> }).results;
        const text = results?.[0]?.[0]?.transcript?.trim() ?? "";
        if (text) {
          setInput(text);
          void runReply(text);
        }
      };
      rec.start();
    } catch {
      setMicError("unknown");
    }
  };

  return (
    <div className="relative flex shrink-0 items-center">
      <motion.button
        type="button"
        aria-expanded={open}
        aria-label={open ? "Close CodePath mentor" : "Open CodePath mentor"}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "relative flex h-10 w-10 items-center justify-center rounded-full",
          "border border-cyan-400/50 bg-gradient-to-br from-cyan-500/25 via-violet-600/30 to-fuchsia-600/25",
          "shadow-[0_0_22px_rgba(94,234,212,0.35),0_0_48px_rgba(167,139,250,0.25)]",
          "transition hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60",
        )}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.97 }}
      >
        <span className="pointer-events-none absolute inset-0 animate-pulse rounded-full bg-cyan-400/15 blur-md" />
        <Sparkles className="relative h-[18px] w-[18px] text-cyan-100 drop-shadow-[0_0_8px_rgba(94,234,212,0.9)]" />
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.button
            type="button"
            aria-hidden
            tabIndex={-1}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[90] bg-black/55 backdrop-blur-[2px]"
            onClick={() => setOpen(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="CodePath mentor"
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 380, damping: 28 }}
            className={cn(
              "fixed left-3 top-[4.25rem] z-[100] flex max-h-[min(560px,78vh)] w-[min(420px,calc(100vw-1.5rem))] flex-col overflow-hidden rounded-3xl",
              "border border-white/15 bg-[#070a12]/85 shadow-[0_0_60px_rgba(94,234,212,0.18),0_0_100px_rgba(139,92,246,0.12)] backdrop-blur-2xl",
              "sm:left-6",
            )}
          >
            <div className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-b from-cyan-500/10 via-transparent to-violet-600/10" />
            <div className="relative flex items-start justify-between gap-3 border-b border-white/10 px-4 py-3">
              <div className="flex flex-1 flex-col gap-1">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200/90">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
                  Mentor
                </div>
                <div className="font-display text-base text-white">CodePath · Jarvis</div>
                <p className="text-[11px] text-zinc-500">Clōd when CLOD_API_KEY is set · mock fallback · voice optional</p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => {
                    setVoiceOut((v) => !v);
                    if (typeof window !== "undefined" && "speechSynthesis" in window) {
                      window.speechSynthesis.cancel();
                    }
                    setSpeaking(false);
                  }}
                  disabled={!mounted || !speechOutSupported}
                  title={speechOutSupported ? "Toggle voice replies" : "Speech synthesis unavailable"}
                  className={cn(
                    "rounded-xl p-2 text-zinc-400 transition hover:bg-white/10 hover:text-white",
                    voiceOut && "text-cyan-200",
                    (!mounted || !speechOutSupported) && "cursor-not-allowed opacity-40",
                  )}
                >
                  {voiceOut ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-xl p-2 text-zinc-400 transition hover:bg-white/10 hover:text-white"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="relative border-b border-white/5 px-4 py-4">
              <JarvisSphere mode={sphereMode} />
              <p className="mt-2 text-center text-[11px] uppercase tracking-[0.25em] text-zinc-500">
                {thinking ? "Processing" : speaking ? "Speaking" : "Standby"}
              </p>
            </div>

            <div ref={scrollRef} className="relative max-h-[220px] flex-1 space-y-3 overflow-y-auto px-4 py-3">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    "max-w-[95%] rounded-2xl px-3 py-2.5 text-sm leading-relaxed",
                    msg.role === "user"
                      ? "ml-auto border border-violet-400/25 bg-violet-500/15 text-zinc-100"
                      : "border border-cyan-400/20 bg-black/40 text-zinc-200",
                  )}
                >
                  {msg.content}
                </div>
              ))}
              {thinking && (
                <div className="flex gap-1.5 px-1 py-2 text-xs text-zinc-500">
                  <span className="inline-flex gap-1">
                    <motion.span className="h-1.5 w-1.5 rounded-full bg-cyan-400" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 0.9 }} />
                    <motion.span className="h-1.5 w-1.5 rounded-full bg-violet-400" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 0.9, delay: 0.15 }} />
                    <motion.span className="h-1.5 w-1.5 rounded-full bg-fuchsia-400" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 0.9, delay: 0.3 }} />
                  </span>
                  Thinking…
                </div>
              )}
            </div>

            <div className="relative space-y-2 border-t border-white/10 px-3 py-3">
              <div className="flex flex-wrap gap-1.5">
                {(
                  [
                    ["explain", "Explain this page"],
                    ["practice", "Practice task"],
                    ["review", "Review my code"],
                    ["next", "What next?"],
                  ] as const
                ).map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    disabled={thinking}
                    onClick={() => quick(key)}
                    className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-zinc-300 transition hover:border-cyan-400/35 hover:bg-cyan-500/10 hover:text-white disabled:opacity-40"
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div className="flex gap-2">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Ask your mentor…"
                  rows={2}
                  className="min-h-[44px] flex-1 resize-none rounded-2xl border border-white/10 bg-black/50 px-3 py-2 text-sm text-white outline-none ring-cyan-400/30 placeholder:text-zinc-600 focus:ring"
                />
                <div className="flex flex-col gap-1.5">
                  <button
                    type="button"
                    onClick={toggleMic}
                    disabled={!mounted || !speechInSupported || thinking}
                    title={
                      !speechInSupported
                        ? "Speech recognition not supported in this browser"
                        : micListening
                          ? "Stop listening"
                          : "Speak"
                    }
                    className={cn(
                      "flex h-11 w-11 items-center justify-center rounded-2xl border transition",
                      micListening
                        ? "border-cyan-400/60 bg-cyan-500/20 text-cyan-100"
                        : "border-white/10 bg-white/5 text-zinc-400 hover:border-white/20 hover:text-white",
                      (!speechInSupported || !mounted) && "cursor-not-allowed opacity-35",
                    )}
                  >
                    {!speechInSupported ? <MicOff className="h-5 w-5" /> : micListening ? <Mic className="h-5 w-5 animate-pulse" /> : <Mic className="h-5 w-5" />}
                  </button>
                  <button
                    type="button"
                    onClick={handleSend}
                    disabled={thinking || !input.trim()}
                    className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-400/40 bg-gradient-to-br from-cyan-500/30 to-violet-600/30 text-white shadow-[0_0_20px_rgba(94,234,212,0.2)] transition hover:brightness-110 disabled:opacity-40"
                    aria-label="Send"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {micError && (
                <p className="text-[11px] text-amber-200/90">
                  {micError === "not_supported" && "Voice input isn’t available in this browser."}
                  {micError === "not_allowed" && "Microphone permission denied—enable it in browser settings."}
                  {micError === "no_speech" && "No speech detected—try again."}
                  {micError === "unknown" && "Voice input failed—use the keyboard instead."}
                </p>
              )}
              {!mounted && <p className="text-[11px] text-zinc-600">Initializing audio capabilities…</p>}

              <div className="flex justify-between pt-1 text-[10px] text-zinc-600">
                <Link href="/code-review" className="hover:text-cyan-300">
                  Code Review →
                </Link>
                <Link href="/dashboard" className="hover:text-violet-300">
                  Dashboard →
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
