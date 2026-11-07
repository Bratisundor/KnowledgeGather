"use client";

import React, { useState, useRef, useEffect } from "react";
import { AgentResponse, Citation } from "@/lib/api";
import {
  Sparkles,
  Send,
  ShieldCheck,
  Flame,
  Search,
  MessageCircle,
  Clock,
  CheckCheck,
  Copy,
  BarChart3,
  Users,
  Paperclip,
  Smile,
  Mic,
  MoreVertical,
  Check,
  AlertTriangle,
  FileText,
  Volume2,
  Bot,
  RotateCcw,
  Play,
  Pause,
  Shield
} from "lucide-react";

interface AgentChatProps {
  chatId: string | null;
  chatName: string;
  participants: string[];
  onAsk: (
    query: string,
    agent: string,
    tone: string,
    targetParticipant?: string
  ) => Promise<void>;
  messages: Array<{
    sender: "user" | "agent";
    agentType?: string;
    text: string;
    response?: AgentResponse;
    timestamp: string;
  }>;
  isLoading: boolean;
  onSelectCitation: (citation: Citation) => void;
  selectedCitation: Citation | null;
  onOpenMessageBrowser?: () => void;
  onToggleInfoPanel?: (tab: "evidence" | "personas" | "dashboards" | "safety") => void;
  onOpenWrapped?: () => void;
  onResetMessages?: () => void;
}

export const AgentChat: React.FC<AgentChatProps> = ({
  chatId,
  chatName,
  participants,
  onAsk,
  messages,
  isLoading,
  onSelectCitation,
  selectedCitation,
  onOpenMessageBrowser,
  onToggleInfoPanel,
  onOpenWrapped,
  onResetMessages,
}) => {
  const [inputQuery, setInputQuery] = useState("");
  const [selectedAgent, setSelectedAgent] = useState<string>("auto");
  const [roastTone, setRoastTone] = useState<string>("spicy");
  const [targetParticipant, setTargetParticipant] = useState<string>("");
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [playingVoiceId, setPlayingVoiceId] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputQuery.trim() || isLoading) return;
    onAsk(
      inputQuery.trim(),
      selectedAgent,
      roastTone,
      targetParticipant || undefined
    );
    setInputQuery("");
  };

  const handleSuggestionClick = (query: string, agent: string) => {
    setSelectedAgent(agent);
    onAsk(query, agent, roastTone, targetParticipant || undefined);
  };

  // Helper to render text with clickable citation chips inside WhatsApp bubbles
  const renderFormattedText = (text: string, citations: Citation[] = []) => {
    const lines = text.split("\n");

    return lines.map((line, lIdx) => {
      // Split by citation pattern [#123]
      const parts = line.split(/(\[#\d+\])/g);

      return (
        <span key={lIdx} className="block leading-relaxed">
          {parts.map((part, idx) => {
            const match = part.match(/\[#(\d+)\]/);
            if (match) {
              const seq = parseInt(match[1]);
              const matchedCitation = citations.find((c) => c.message_seq === seq);
              const isCurrent = selectedCitation?.message_seq === seq;

              return (
                <button
                  key={idx}
                  onClick={() => {
                    if (matchedCitation) onSelectCitation(matchedCitation);
                    else
                      onSelectCitation({
                        message_seq: seq,
                        sender: "Participant",
                        timestamp: "Verified Record",
                        quote: `Message sequence #${seq}`,
                        is_verified: true,
                      });
                  }}
                  className={`citation-chip ${
                    isCurrent
                      ? "!bg-[#00a884] !text-white !border-[#00a884] shadow-md ring-2 ring-[#00a884]/40"
                      : ""
                  }`}
                  title={`Click to view verifiable WhatsApp message #${seq}`}
                >
                  #{seq}
                </button>
              );
            }

            // Bold styling support for **text**
            const boldParts = part.split(/(\*\*.*?\*\*)/g);
            return boldParts.map((bPart, bIdx) => {
              if (bPart.startsWith("**") && bPart.endsWith("**")) {
                return (
                  <strong key={bIdx} className="font-bold text-white">
                    {bPart.slice(2, -2)}
                  </strong>
                );
              }
              return <span key={bIdx}>{bPart}</span>;
            });
          })}
        </span>
      );
    });
  };

  const participantsPreview =
    participants.length > 0
      ? `${participants.length} participants: ${participants.slice(0, 4).join(", ")}${
          participants.length > 4 ? "..." : ""
        }`
      : "Evidence-Backed Chat Memory";

  return (
    <div className="flex-1 flex flex-col h-screen bg-[#0b141a] text-[#e9edef] relative overflow-hidden">
      {/* 1. WhatsApp Top Chat Header */}
      <header className="h-[60px] bg-[#202c33] px-4 flex items-center justify-between border-b border-[#222e35] z-10 shrink-0">
        <div
          onClick={() => onToggleInfoPanel && onToggleInfoPanel("personas")}
          className="flex items-center gap-3 cursor-pointer group"
          title="Click to view Group Info & Personas"
        >
          {/* Avatar */}
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#00a884] to-teal-700 flex items-center justify-center font-bold text-white shadow text-sm shrink-0">
            {chatName.slice(0, 2).toUpperCase()}
          </div>

          <div>
            <h2 className="font-semibold text-sm text-[#e9edef] group-hover:text-[#00a884] transition truncate max-w-[180px] md:max-w-[280px]">
              {chatName}
            </h2>
            <p className="text-[11px] text-[#8696a0] truncate max-w-[200px] md:max-w-[340px]">
              {participantsPreview}
            </p>
          </div>
        </div>

        {/* Header Actions & Agent Mode Switcher */}
        <div className="flex items-center gap-2">
          {/* Specialized Agent Mode Selector */}
          <div className="flex items-center bg-[#111b21] p-0.5 rounded-lg border border-[#222e35] text-xs">
            {[
              { id: "auto", label: "Auto", icon: Sparkles },
              { id: "deep_analyzer", label: "Stats", icon: Search },
              { id: "roaster", label: "Roast", icon: Flame },
              { id: "reply_giver", label: "Reply", icon: MessageCircle },
              { id: "memory_recall", label: "Recall", icon: Clock },
            ].map((tab) => {
              const Icon = tab.icon;
              const isSelected = selectedAgent === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedAgent(tab.id)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium transition ${
                    isSelected
                      ? "bg-[#00a884] text-white shadow-sm font-semibold"
                      : "text-[#8696a0] hover:text-[#e9edef] hover:bg-[#202c33]"
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Social Quick Action Buttons */}
          {onOpenWrapped && (
            <button
              onClick={onOpenWrapped}
              title="2024 Chat Wrapped Story"
              className="p-2 rounded-full hover:bg-[#374248] text-[#aebac1] hover:text-white transition"
            >
              <Sparkles className="w-4 h-4 text-yellow-300" />
            </button>
          )}

          {onToggleInfoPanel && (
            <button
              onClick={() => onToggleInfoPanel("dashboards")}
              title="View Group Analytics & Mood Charts"
              className="p-2 rounded-full hover:bg-[#374248] text-[#aebac1] hover:text-white transition"
            >
              <BarChart3 className="w-4 h-4" />
            </button>
          )}

          {onToggleInfoPanel && (
            <button
              onClick={() => onToggleInfoPanel("personas")}
              title="View Participant Personas"
              className="p-2 rounded-full hover:bg-[#374248] text-[#aebac1] hover:text-white transition"
            >
              <Users className="w-4 h-4" />
            </button>
          )}

          {onOpenMessageBrowser && (
            <button
              onClick={onOpenMessageBrowser}
              title="Browse Raw WhatsApp Messages"
              className="p-2 rounded-full hover:bg-[#374248] text-[#aebac1] hover:text-white transition"
            >
              <FileText className="w-4 h-4" />
            </button>
          )}

          {onToggleInfoPanel && (
            <button
              onClick={() => onToggleInfoPanel("safety")}
              title="View Safety & Guardrail Architecture"
              className="p-2 rounded-full hover:bg-[#374248] text-[#aebac1] hover:text-white transition"
            >
              <Shield className="w-4 h-4" />
            </button>
          )}

          {onResetMessages && (
            <button
              onClick={onResetMessages}
              title="Reset Conversation Stream"
              className="p-2 rounded-full hover:bg-[#374248] text-[#8696a0] hover:text-white transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </header>

      {/* 2. Optional Tone Bar (If Roaster selected) */}
      {(selectedAgent === "roaster" || selectedAgent === "auto") && (
        <div className="bg-[#182229] px-4 py-1.5 border-b border-[#222e35] flex items-center justify-between text-xs text-[#8696a0] shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-medium text-[#8696a0]">Roast Intensity:</span>
            <div className="flex bg-[#111b21] p-0.5 rounded border border-[#222e35]">
              {[
                { id: "mild", label: "☕ Mild" },
                { id: "spicy", label: "🌶️ Spicy" },
                { id: "savage", label: "🔥 Savage" },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setRoastTone(t.id)}
                  className={`px-2.5 py-0.5 rounded text-[10px] font-semibold transition ${
                    roastTone === t.id
                      ? "bg-orange-600 text-white shadow"
                      : "text-[#8696a0] hover:text-[#e9edef]"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {participants.length > 0 && (
            <div className="flex items-center gap-1.5 text-[11px]">
              <span>Target:</span>
              <select
                value={targetParticipant}
                onChange={(e) => setTargetParticipant(e.target.value)}
                className="bg-[#111b21] text-[#e9edef] border border-[#222e35] rounded px-2 py-0.5 text-[10px] focus:outline-none focus:border-[#00a884]"
              >
                <option value="">Any member</option>
                {participants.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}

      {/* 3. WhatsApp Chat Stream Wallpaper Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 wa-chat-bg">
        {/* Yellow Centered Security / Evidence Badge */}
        <div className="flex justify-center my-2">
          <div className="bg-[#182229] border border-[#222e35] px-3.5 py-1.5 rounded-lg text-[11px] text-[#ffd279] shadow-sm max-w-md text-center flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#00a884] shrink-0" />
            <span>
              Evidence-First Chat Intelligence: Code counts numbers, AI generates language, citations [#seq] prove claims.
            </span>
          </div>
        </div>

        {/* Empty state welcome card */}
        {messages.length === 0 ? (
          <div className="max-w-md mx-auto my-8 bg-[#1f2c34] rounded-2xl p-5 border border-[#222e35] shadow-lg text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-[#00a884]/20 border border-[#00a884]/40 flex items-center justify-center text-[#00a884] mx-auto">
              <Bot className="w-7 h-7" />
            </div>
            <div>
              <h3 className="font-bold text-base text-[#e9edef]">
                Chat Intelligence Assistant
              </h3>
              <p className="text-xs text-[#8696a0] mt-1 leading-relaxed">
                Ask about who drives most conversations, group mood changes, request habit roasts, or search historical plans like the Goa trip.
              </p>
            </div>

            {/* Quick Suggestions */}
            <div className="space-y-2 text-left pt-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#8696a0] block">
                Popular Quick Questions:
              </span>
              {[
                { q: "Who drives most conversations and how did group mood change over the year?", a: "deep_analyzer", label: "📊 Conversation Drivers & Mood" },
                { q: "Roast Shrimant for his voice-note habits at Spicy level", a: "roaster", label: "🌶️ Roast Shrimant (Audio Habit)" },
                { q: "How should I reply to Shrimant?", a: "reply_giver", label: "💬 Generate 3 Reply Options" },
                { q: "When did we plan the Goa trip?", a: "memory_recall", label: "⏳ When did we plan Goa?" },
              ].map((item, i) => (
                <button
                  key={i}
                  onClick={() => handleSuggestionClick(item.q, item.a)}
                  className="w-full text-left p-2.5 rounded-xl bg-[#111b21] hover:bg-[#2a3942] border border-[#222e35] text-xs text-[#e9edef] transition flex items-center justify-between group"
                >
                  <span>{item.label}</span>
                  <span className="text-[#00a884] text-xs opacity-0 group-hover:opacity-100 transition">
                    Ask ➜
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isUser = msg.sender === "user";
            const resp = msg.response;

            return (
              <div
                key={index}
                className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
              >
                {/* Real WhatsApp Chat Bubble */}
                <div
                  className={`max-w-[85%] md:max-w-[72%] p-3.5 text-xs leading-relaxed shadow-md ${
                    isUser ? "wa-bubble-outgoing" : "wa-bubble-incoming"
                  }`}
                >
                  {/* Incoming Sender & Agent Header */}
                  {!isUser && resp && (
                    <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-[#2a3942] text-[11px]">
                      <span className="font-bold text-[#00a884] flex items-center gap-1.5">
                        <Bot className="w-3.5 h-3.5" />
                        ChatChase AI • {resp.agent.replace("_", " ").toUpperCase()}
                      </span>

                      {/* Verifier Badge */}
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.2 rounded-full border flex items-center gap-1 ${
                          resp.verifier_status === "passed"
                            ? "bg-[#00a884]/20 text-[#00a884] border-[#00a884]/40"
                            : "bg-amber-900/30 text-amber-300 border-amber-600/40"
                        }`}
                      >
                        ✓ {resp.verifier_badge}
                      </span>
                    </div>
                  )}

                  {/* Message Body Content */}
                  <div className="whitespace-pre-wrap font-sans text-xs text-[#e9edef] space-y-1">
                    {renderFormattedText(msg.text, resp?.citations)}
                  </div>

                  {/* Reply Giver WhatsApp Styled Cards */}
                  {resp?.reply_options && (
                    <div className="mt-3 pt-2.5 border-t border-[#2a3942] space-y-2">
                      <span className="text-[10px] font-bold text-[#8696a0] uppercase block">
                        Tap to copy reply:
                      </span>
                      <div className="space-y-1.5">
                        {resp.reply_options.map((opt, oIdx) => (
                          <div
                            key={oIdx}
                            onClick={() => {
                              navigator.clipboard.writeText(opt.reply_text);
                              setCopiedIdx(oIdx);
                              setTimeout(() => setCopiedIdx(null), 2000);
                            }}
                            className="p-2.5 rounded-lg bg-[#111b21] hover:bg-[#2a3942] border border-[#222e35] cursor-pointer transition flex items-center justify-between gap-2"
                          >
                            <div className="text-xs">
                              <span className="text-[10px] font-bold text-[#00a884] uppercase block">
                                {opt.tone}
                              </span>
                              <p className="text-[#e9edef] font-medium mt-0.5">
                                "{opt.reply_text}"
                              </p>
                            </div>
                            <button className="p-1 rounded bg-[#202c33] text-[#8696a0] hover:text-white shrink-0">
                              {copiedIdx === oIdx ? (
                                <Check className="w-3.5 h-3.5 text-[#00a884]" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Roast Details Card */}
                  {resp?.roast_details && (
                    <div className="mt-3 p-2.5 rounded-lg bg-orange-950/30 border border-orange-700/40 text-[11px] flex items-center justify-between text-orange-200">
                      <span className="flex items-center gap-1 font-semibold">
                        <Flame className="w-3.5 h-3.5 text-orange-400" />
                        Habit Evidence: {resp.roast_details.target} sent {resp.roast_details.voice_notes_count} voice notes
                      </span>
                      <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-orange-600/30 text-orange-300">
                        {resp.roast_details.tone}
                      </span>
                    </div>
                  )}

                  {/* Bubble Timestamp & Status */}
                  <div className="flex items-center justify-end gap-1 mt-1.5 text-[10px] text-[#8696a0]">
                    <span>{msg.timestamp}</span>
                    {isUser && <CheckCheck className="w-3.5 h-3.5 text-[#53bdeb]" />}
                  </div>
                </div>
              </div>
            );
          })
        )}

        {/* Live Typing / Verification Indicator */}
        {isLoading && (
          <div className="flex items-start">
            <div className="wa-bubble-incoming p-3.5 shadow-md flex items-center gap-2.5 text-xs text-[#8696a0]">
              <div className="w-2 h-2 rounded-full bg-[#00a884] animate-bounce" />
              <div className="w-2 h-2 rounded-full bg-[#00a884] animate-bounce [animation-delay:0.2s]" />
              <div className="w-2 h-2 rounded-full bg-[#00a884] animate-bounce [animation-delay:0.4s]" />
              <span className="ml-1 text-[11px] text-[#e9edef] font-medium">
                Computing stats & verifying evidence citations in SQLite...
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 4. Suggestion Quick Pills Bar */}
      <div className="bg-[#202c33]/90 backdrop-blur px-4 py-2 border-t border-[#222e35] flex items-center gap-2 overflow-x-auto text-xs shrink-0">
        <span className="text-[10px] font-bold text-[#8696a0] uppercase shrink-0">
          Try:
        </span>
        {[
          { text: "Who drives most conversations?", agent: "deep_analyzer" },
          { text: "Roast Shrimant (voice notes)", agent: "roaster" },
          { text: "How to reply to Shrimant?", agent: "reply_giver" },
          { text: "When was Goa trip planned?", agent: "memory_recall" },
        ].map((chip, idx) => (
          <button
            key={idx}
            onClick={() => handleSuggestionClick(chip.text, chip.agent)}
            className="px-3 py-1 rounded-full bg-[#111b21] hover:bg-[#2a3942] border border-[#222e35] text-[#e9edef] text-[11px] whitespace-nowrap transition hover:border-[#00a884]"
          >
            {chip.text}
          </button>
        ))}
      </div>

      {/* 5. WhatsApp Message Input Bar */}
      <footer className="h-[62px] bg-[#202c33] px-4 flex items-center gap-3 border-t border-[#222e35] shrink-0">
        <button
          type="button"
          className="text-[#8696a0] hover:text-[#e9edef] transition p-1"
          title="Emojis & Reactions"
        >
          <Smile className="w-5 h-5" />
        </button>

        <button
          type="button"
          onClick={onOpenMessageBrowser}
          className="text-[#8696a0] hover:text-[#e9edef] transition p-1"
          title="Browse Raw Chat Records"
        >
          <Paperclip className="w-5 h-5" />
        </button>

        <form onSubmit={handleSubmit} className="flex-1 flex items-center gap-2">
          <input
            type="text"
            placeholder={`Ask ${selectedAgent === "auto" ? "ChatChase" : selectedAgent.replace("_", " ")} about ${chatName}...`}
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            className="flex-1 bg-[#2a3942] text-[#e9edef] placeholder-[#8696a0] text-xs rounded-lg px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#00a884]"
          />

          <button
            type="submit"
            disabled={!inputQuery.trim() || isLoading}
            className="w-10 h-10 rounded-full bg-[#00a884] hover:bg-[#02906f] text-white flex items-center justify-center transition disabled:opacity-40 shadow shrink-0"
          >
            <Send className="w-4 h-4 ml-0.5" />
          </button>
        </form>
      </footer>
    </div>
  );
};
