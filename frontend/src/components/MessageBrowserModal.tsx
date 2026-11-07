"use client";

import React, { useState, useEffect } from "react";
import { fetchChatMessages, Citation } from "@/lib/api";
import {
  MessageSquare,
  Search,
  X,
  User,
  Clock,
  Volume2,
  Image as ImageIcon,
  Video,
  FileText,
  Filter,
  CheckCheck
} from "lucide-react";

interface MessageBrowserModalProps {
  projectId: string;
  chatId: string;
  chatName: string;
  isOpen: boolean;
  onClose: () => void;
  onSelectCitation: (citation: Citation) => void;
}

export const MessageBrowserModal: React.FC<MessageBrowserModalProps> = ({
  projectId,
  chatId,
  chatName,
  isOpen,
  onClose,
  onSelectCitation,
}) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSender, setSelectedSender] = useState<string>("all");
  const [mediaFilter, setMediaFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !chatId) return;

    const loadMessages = async () => {
      setIsLoading(true);
      try {
        const data = await fetchChatMessages(projectId, chatId, 250);
        setMessages(data.messages || []);
      } catch (err) {
        console.error("Failed to load messages", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadMessages();
  }, [isOpen, projectId, chatId]);

  if (!isOpen) return null;

  // Extract unique senders
  const senders = Array.from(new Set(messages.map((m) => m.sender))).filter(Boolean);

  const filtered = messages.filter((m) => {
    const s = searchTerm.toLowerCase();
    const matchesSearch =
      m.content?.toLowerCase().includes(s) ||
      m.sender?.toLowerCase().includes(s) ||
      m.media_transcript?.toLowerCase().includes(s);

    if (!matchesSearch) return false;
    if (selectedSender !== "all" && m.sender !== selectedSender) return false;

    if (mediaFilter === "voice") return m.media_type === "audio" || m.content.toLowerCase().includes("voice note");
    if (mediaFilter === "image") return m.media_type === "image" || m.content.toLowerCase().includes("image");
    if (mediaFilter === "video") return m.media_type === "video";

    return true;
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-4xl h-[85vh] rounded-2xl bg-[#111b21] border border-[#222e35] shadow-2xl flex flex-col text-[#e9edef] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="h-[60px] bg-[#202c33] px-5 flex items-center justify-between border-b border-[#222e35] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-[#00a884]/20 text-[#00a884] flex items-center justify-center font-bold">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                Raw Message Timeline
                <span className="text-[10px] bg-[#00a884]/20 text-[#00a884] font-semibold px-2 py-0.5 rounded-full">
                  {chatName}
                </span>
              </h3>
              <p className="text-[11px] text-[#8696a0]">
                {filtered.length} of {messages.length} messages loaded from SQLite database
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#8696a0] hover:text-white hover:bg-[#374248] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Bar */}
        <div className="p-3 bg-[#182229] border-b border-[#222e35] flex flex-wrap items-center gap-3">
          {/* Search box */}
          <div className="flex-1 min-w-[200px] flex items-center bg-[#202c33] rounded-lg px-3 py-1.5 gap-2 border border-[#2a3942] focus-within:border-[#00a884]">
            <Search className="w-4 h-4 text-[#8696a0]" />
            <input
              type="text"
              placeholder="Search messages, transcriptions, keywords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs bg-transparent text-[#e9edef] placeholder-[#8696a0] focus:outline-none"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm("")} className="text-[#8696a0] hover:text-white text-xs">
                ✕
              </button>
            )}
          </div>

          {/* Sender Filter */}
          <select
            value={selectedSender}
            onChange={(e) => setSelectedSender(e.target.value)}
            className="bg-[#202c33] text-[#e9edef] border border-[#2a3942] rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-[#00a884]"
          >
            <option value="all">All Senders ({senders.length})</option>
            {senders.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          {/* Media Pills */}
          <div className="flex items-center gap-1 bg-[#111b21] p-0.5 rounded-lg border border-[#222e35] text-xs">
            {[
              { id: "all", label: "All" },
              { id: "voice", label: "🎙️ Voice" },
              { id: "image", label: "📷 Images" },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setMediaFilter(t.id)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition ${
                  mediaFilter === t.id
                    ? "bg-[#00a884] text-white shadow-sm"
                    : "text-[#8696a0] hover:text-white"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5 divide-y divide-[#222e35]/40 bg-[#0b141a]">
          {isLoading ? (
            <div className="py-16 text-center text-[#8696a0] text-xs space-y-2">
              <div className="w-6 h-6 border-2 border-[#00a884] border-t-transparent rounded-full animate-spin mx-auto" />
              <p>Loading messages from database...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center text-[#8696a0] text-xs space-y-1">
              <p>No messages match your filters.</p>
            </div>
          ) : (
            filtered.map((msg) => {
              const isVoice = msg.media_type === "audio" || msg.content?.toLowerCase().includes("voice note");
              const isMedia = msg.media_type === "image" || msg.media_type === "video";

              return (
                <div
                  key={msg.sequence_number || msg.id}
                  className="pt-2.5 flex items-start justify-between gap-3 group hover:bg-[#111b21] p-2 rounded-xl transition"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    {/* Seq Badge */}
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#202c33] text-[#00a884] border border-[#2a3942] shrink-0 mt-0.5">
                      #{msg.sequence_number}
                    </span>

                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-white">
                          {msg.sender}
                        </span>
                        <span className="text-[10px] text-[#8696a0] font-mono">
                          {msg.timestamp}
                        </span>
                        {isVoice && (
                          <span className="text-[9px] bg-orange-950/80 text-orange-300 px-1.5 py-0.2 rounded border border-orange-700/50 flex items-center gap-1">
                            <Volume2 className="w-2.5 h-2.5" />
                            Voice Note
                          </span>
                        )}
                        {isMedia && (
                          <span className="text-[9px] bg-blue-950/80 text-blue-300 px-1.5 py-0.2 rounded border border-blue-700/50 flex items-center gap-1">
                            <ImageIcon className="w-2.5 h-2.5" />
                            Media
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-[#e9edef] leading-relaxed break-words">
                        {msg.content}
                      </p>

                      {msg.media_transcript && (
                        <div className="p-2 rounded-lg bg-[#202c33] text-[11px] text-[#00a884] italic border border-[#2a3942]">
                          🎙️ Whisper Transcript: "{msg.media_transcript}"
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Cite Button */}
                  <button
                    onClick={() => {
                      onSelectCitation({
                        message_seq: msg.sequence_number,
                        sender: msg.sender,
                        timestamp: msg.timestamp,
                        quote: msg.content,
                        is_verified: true,
                        verification_details: "Verified direct from message timeline.",
                      });
                      onClose();
                    }}
                    className="opacity-0 group-hover:opacity-100 px-2.5 py-1 rounded bg-[#00a884] hover:bg-[#02906f] text-white text-[10px] font-semibold transition shrink-0 shadow-sm"
                  >
                    Inspect Evidence ➜
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
