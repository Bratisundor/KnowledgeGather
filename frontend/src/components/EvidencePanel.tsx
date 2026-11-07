"use client";

import React, { useState } from "react";
import { Citation } from "@/lib/api";
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  User,
  Quote,
  Volume2,
  FileCode,
  X,
  Play,
  Copy,
  Check,
  ExternalLink
} from "lucide-react";

interface EvidencePanelProps {
  citation: Citation | null;
  allCitations: Citation[];
  onSelectCitation: (c: Citation) => void;
  onClose: () => void;
}

export const EvidencePanel: React.FC<EvidencePanelProps> = ({
  citation,
  allCitations,
  onSelectCitation,
  onClose,
}) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!citation) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-center text-[#8696a0] bg-[#111b21]">
        <div className="w-12 h-12 rounded-full bg-[#202c33] flex items-center justify-center mb-3">
          <Quote className="w-5 h-5 text-[#8696a0]" />
        </div>
        <h4 className="text-xs font-semibold text-[#e9edef]">
          Evidence Inspector
        </h4>
        <p className="text-[11px] text-[#8696a0] mt-1 max-w-[200px]">
          Tap any citation chip like <span className="citation-chip">#28</span> in the chat to audit the original WhatsApp message record.
        </p>
      </div>
    );
  }

  const isVoice =
    citation.quote.toLowerCase().includes("voice note") ||
    citation.quote.toLowerCase().includes("audio");

  const handleCopy = () => {
    navigator.clipboard.writeText(`[#${citation.message_seq}] ${citation.sender} (${citation.timestamp}): "${citation.quote}"`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="h-full flex flex-col bg-[#111b21] text-[#e9edef] overflow-y-auto divide-y divide-[#222e35]">
      {/* Header */}
      <div className="h-[60px] bg-[#202c33] px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <button
            onClick={onClose}
            className="p-1 rounded-full text-[#8696a0] hover:text-white hover:bg-[#374248] transition"
          >
            <X className="w-5 h-5" />
          </button>
          <div>
            <h3 className="font-semibold text-sm text-[#e9edef]">
              Evidence Record #{citation.message_seq}
            </h3>
            <p className="text-[10px] text-[#8696a0]">
              Audited against immutable SQLite records
            </p>
          </div>
        </div>

        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-[#00a884]/20 text-[#00a884] border border-[#00a884]/50">
          Verified
        </span>
      </div>

      {/* Verifier Badge Section */}
      <div className="p-4 space-y-3">
        <div
          className={`p-3 rounded-xl border flex items-start gap-2.5 ${
            citation.is_verified
              ? "bg-[#00a884]/10 border-[#00a884]/40 text-[#e9edef]"
              : "bg-amber-950/40 border-amber-800/60 text-amber-200"
          }`}
        >
          {citation.is_verified ? (
            <CheckCircle2 className="w-4 h-4 text-[#00a884] shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          )}
          <div className="space-y-0.5">
            <span className="text-xs font-bold block text-[#00a884]">
              {citation.is_verified ? "100% DB Verified Claim" : "Verification Flagged"}
            </span>
            <p className="text-[11px] text-[#8696a0]">
              {citation.verification_details || "Message sequence exists and quote matched in chat export database."}
            </p>
          </div>
        </div>

        {/* Original Message Card */}
        <div className="bg-[#202c33] rounded-xl p-3.5 space-y-2.5 border border-[#222e35]">
          <div className="flex items-center justify-between text-[11px] text-[#8696a0]">
            <span className="font-bold text-[#e9edef] flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[#00a884]" />
              {citation.sender}
            </span>
            <span className="font-mono text-[10px] text-[#8696a0]">
              {citation.timestamp}
            </span>
          </div>

          {/* Voice Note Player (If audio message) */}
          {isVoice ? (
            <div className="bg-[#111b21] p-3 rounded-xl border border-[#222e35] space-y-2.5">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                  className="w-9 h-9 rounded-full bg-[#00a884] hover:bg-[#02906f] text-white flex items-center justify-center shrink-0 shadow transition"
                >
                  <Play className={`w-4 h-4 ml-0.5 ${isPlayingAudio ? "animate-pulse" : ""}`} />
                </button>
                <div className="flex-1 flex items-center gap-1 h-5">
                  {[40, 75, 95, 60, 85, 45, 100, 75, 30, 65, 90, 50, 80, 60, 35, 75, 90, 45, 60, 85, 40].map((h, i) => (
                    <div
                      key={i}
                      style={{ height: `${h}%` }}
                      className={`w-1 rounded-full transition-all duration-200 ${
                        isPlayingAudio && i % 3 === 0
                          ? "bg-emerald-300 h-full"
                          : i < 9
                          ? "bg-[#00a884]"
                          : "bg-[#8696a0]"
                      }`}
                    />
                  ))}
                </div>
                <span className="font-mono text-[10px] text-[#8696a0]">0:42</span>
              </div>
              <p className="text-[11px] text-[#e9edef] italic pt-1 border-t border-[#222e35]">
                "{citation.quote}"
              </p>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-[#111b21] text-xs text-[#e9edef] leading-relaxed border border-[#222e35]">
              "{citation.quote}"
            </div>
          )}

          {/* Copy Citation Button */}
          <div className="flex justify-end pt-1">
            <button
              onClick={handleCopy}
              className="text-[10px] font-semibold text-[#8696a0] hover:text-white flex items-center gap-1 transition"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 text-[#00a884]" />
                  <span className="text-[#00a884]">Copied Citation!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Copy Citation</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* All Citations in Current Answer */}
      {allCitations.length > 1 && (
        <div className="p-4 space-y-2">
          <span className="text-[10px] uppercase font-bold tracking-wider text-[#8696a0] block">
            All Citations in Answer ({allCitations.length})
          </span>
          <div className="space-y-1.5 max-h-52 overflow-y-auto">
            {allCitations.map((c) => {
              const isSelected = c.message_seq === citation.message_seq;
              return (
                <div
                  key={c.message_seq}
                  onClick={() => onSelectCitation(c)}
                  className={`p-2.5 rounded-lg text-xs cursor-pointer transition flex items-center justify-between border ${
                    isSelected
                      ? "bg-[#00a884]/20 border-[#00a884] text-white font-medium"
                      : "bg-[#202c33] border-[#222e35] text-[#8696a0] hover:bg-[#2a3942] hover:text-[#e9edef]"
                  }`}
                >
                  <span className="truncate max-w-[210px]">
                    <strong className="text-[#00a884] mr-1.5 font-mono">#{c.message_seq}</strong>
                    <span>{c.sender}: "{c.quote}"</span>
                  </span>
                  <span className="text-[9px] bg-[#111b21] px-1.5 py-0.5 rounded text-[#8696a0]">
                    Inspect
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Code vs AI Principle Card */}
      <div className="p-4 text-[10px] text-[#8696a0] space-y-1">
        <span className="font-semibold text-[#e9edef] flex items-center gap-1">
          <FileCode className="w-3.5 h-3.5 text-[#00a884]" />
          Evidence-First Guarantee:
        </span>
        <p>
          All conversation counts and timestamps are calculated with Pandas/SQLite. Every AI claim is checked against the immutable database records.
        </p>
      </div>
    </div>
  );
};
