"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Bot, MessageCircle, Send, Sparkles, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const EXAMPLE_QUESTIONS = [
  "How do I connect my GitHub repo?",
  "What does architecture analysis include?",
  "Can I compare two pull requests?",
  "How do developer profiles work?",
];

const FAQ_QUESTIONS = [
  "How long does an analysis run take?",
  "Is my repository data stored?",
  "Can I invite teammates to a project?",
];

const INITIAL_MESSAGES = [
  {
    role: "agent",
    text: "Hi, I am CodeVibe Agent. Ask me anything about projects, analysis, and platform features.",
  },
];

const PREVIOUS_CHATS = [
  {
    id: "onboarding-flow",
    title: "Getting started",
    subtitle: "GitHub connect and first analysis",
    transcript: [
      {
        role: "user",
        text: "How do I connect my GitHub repo?",
      },
      {
        role: "agent",
        text: "Sign in from Login, authorize GitHub, then open Projects to pick a repository and run your first analysis.",
      },
    ],
  },
  {
    id: "architecture-insights",
    title: "Architecture insights",
    subtitle: "What the analysis reports include",
    transcript: [
      {
        role: "user",
        text: "What does architecture analysis include?",
      },
      {
        role: "agent",
        text: "You get structure maps, coupling hotspots, complexity risk zones, and readability signals for easier long-term maintenance.",
      },
    ],
  },
  {
    id: "team-workflow",
    title: "Team workflow",
    subtitle: "Profiles and collaboration features",
    transcript: [
      {
        role: "user",
        text: "Can I invite teammates to a project?",
      },
      {
        role: "agent",
        text: "Yes, project collaboration and shared dashboard visibility are available in the platform workflow.",
      },
    ],
  },
];

function getHardcodedReply(message) {
  const text = message.toLowerCase();

  if (text.includes("github") || text.includes("repo")) {
    return "Connect GitHub from Login, then your repositories appear under Projects. You can start analysis in one click.";
  }

  if (text.includes("analysis") || text.includes("architecture")) {
    return "Architecture analysis reviews structure, complexity, coupling hotspots, and readability signals to help your team maintain code faster.";
  }

  if (text.includes("profile") || text.includes("developer")) {
    return "Developer Profile summarizes contribution style, review behavior, and focus areas so leads can align tasks with strengths.";
  }

  if (text.includes("price") || text.includes("billing") || text.includes("plan")) {
    return "Pricing and plan controls are available from the dashboard settings. You can start with the default trial experience after sign in.";
  }

  return "Great question. In this demo, responses are hardcoded, but I can still guide you across login, projects, dashboard insights, and analysis flows.";
}

export default function AIAgentWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const replyTimeoutRef = useRef(null);

  const resetChat = () => {
    if (replyTimeoutRef.current) {
      clearTimeout(replyTimeoutRef.current);
      replyTimeoutRef.current = null;
    }
    setInput("");
    setMessages(INITIAL_MESSAGES);
    setIsHistoryOpen(false);
  };

  useEffect(() => {
    return () => {
      if (replyTimeoutRef.current) {
        clearTimeout(replyTimeoutRef.current);
      }
    };
  }, []);

  const sendMessage = (messageText) => {
    const trimmed = messageText.trim();
    if (!trimmed) {
      return;
    }

    setMessages((prev) => [...prev, { role: "user", text: trimmed }]);
    setInput("");

    const reply = getHardcodedReply(trimmed);
    replyTimeoutRef.current = setTimeout(() => {
      setMessages((prev) => [...prev, { role: "agent", text: reply }]);
      replyTimeoutRef.current = null;
    }, 350);
  };

  const closeModal = () => {
    setIsOpen(false);
    resetChat();
  };

  const openPreviousChat = (chat) => {
    setMessages([...INITIAL_MESSAGES, ...chat.transcript]);
    setIsHistoryOpen(false);
  };

  return (
    <>
      <div className="fixed bottom-6 right-6 z-70">
        <motion.button
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            if (isOpen) {
              closeModal();
              return;
            }
            setIsOpen(true);
          }}
          className="relative h-16 w-16 rounded-full bg-linear-to-br from-sky-300 via-cyan-300 to-emerald-300 p-0.5 shadow-[0_16px_40px_rgba(14,165,233,0.35)]"
          aria-label="Toggle AI assistant"
        >
          <div className="flex h-full w-full items-center justify-center rounded-full border border-white/35 bg-slate-950/90 backdrop-blur-xl">
            <Bot className="h-7 w-7 text-sky-200" />
          </div>
          <motion.span
            animate={{ opacity: [0.3, 1, 0.3], scale: [0.9, 1.1, 0.9] }}
            transition={{ duration: 2.2, repeat: Infinity }}
            className="absolute -right-0.5 -top-0.5 h-4 w-4 rounded-full bg-emerald-300 ring-4 ring-slate-950"
          />
        </motion.button>
      </div>

      <AnimatePresence>
        {isOpen ? (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed bottom-24 right-6 z-70 w-[calc(100vw-2rem)] max-w-md overflow-hidden rounded-3xl border border-white/15 bg-slate-950/90 shadow-[0_24px_70px_rgba(8,47,73,0.6)] backdrop-blur-2xl"
          >
            <div className="border-b border-white/10 bg-linear-to-r from-sky-500/25 via-cyan-400/20 to-emerald-300/20 px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="rounded-full bg-white/10 p-2">
                    <Sparkles className="h-4 w-4 text-cyan-200" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">CodeVibe Agent</p>
                    <p className="text-xs text-slate-300">Premium platform assistant</p>
                  </div>
                </div>
                <button
                  onClick={closeModal}
                  className="rounded-full p-1 text-slate-300 transition hover:bg-white/10 hover:text-white"
                  aria-label="Close chat"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsHistoryOpen((prev) => !prev)}
                  className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-cyan-100 transition hover:bg-white/20"
                >
                  {isHistoryOpen ? "Back to chat" : "Previous chats"}
                </button>
              </div>
            </div>

            {isHistoryOpen ? (
              <div className="max-h-80 space-y-2 overflow-y-auto px-4 py-4">
                {PREVIOUS_CHATS.map((chat) => (
                  <button
                    key={chat.id}
                    type="button"
                    onClick={() => openPreviousChat(chat)}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 p-3 text-left transition hover:border-cyan-200/40 hover:bg-cyan-200/10"
                  >
                    <p className="text-sm font-semibold text-white">{chat.title}</p>
                    <p className="mt-1 text-xs text-slate-300">{chat.subtitle}</p>
                  </button>
                ))}
              </div>
            ) : (
              <div className="max-h-80 space-y-3 overflow-y-auto px-4 py-4">
                {messages.map((message, index) => (
                  <div
                    key={`${message.role}-${index}`}
                    className={`flex ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                        message.role === "user"
                          ? "bg-sky-400 text-slate-950"
                          : "border border-white/10 bg-white/5 text-slate-100"
                      }`}
                    >
                      {message.text}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="border-t border-white/10 px-4 py-3">
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  sendMessage(input);
                }}
                className="flex items-center gap-2"
              >
                <input
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder="Ask about CodeVibe features..."
                  className="h-10 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-slate-100 outline-none placeholder:text-slate-400 focus:border-cyan-300/60"
                />
                <button
                  type="submit"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-sky-300 text-slate-950 transition hover:bg-sky-200"
                  aria-label="Send"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>

              <div className="mt-3 space-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  Example questions
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {EXAMPLE_QUESTIONS.map((question) => (
                    <button
                      key={question}
                      type="button"
                      onClick={() => sendMessage(question)}
                      className="rounded-full border border-sky-300/30 bg-sky-400/10 px-2.5 py-1 text-[11px] text-sky-100 transition hover:bg-sky-300/20"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-3 space-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  Recently asked FAQs
                </p>
                <div className="space-y-1.5">
                  {FAQ_QUESTIONS.map((question) => (
                    <button
                      key={question}
                      type="button"
                      onClick={() => sendMessage(question)}
                      className="flex w-full items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-left text-[11px] text-slate-200 transition hover:bg-white/10"
                    >
                      <MessageCircle className="h-3 w-3 text-cyan-200" />
                      <span>{question}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}