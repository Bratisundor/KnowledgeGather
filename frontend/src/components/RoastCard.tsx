"use client";

import React, { useState } from "react";
import { Flame, Share2, Copy, Check, Sparkles, Volume2, Clock } from "lucide-react";

interface RoastCardProps {
  targetName: string;
  tone: string;
  roastText: string;
  voiceNotesCount: number;
  avgReplyMins: number;
  totalMsgs: number;
}

export const RoastCard: React.FC<RoastCardProps> = ({
  targetName,
  tone,
  roastText,
  voiceNotesCount,
  avgReplyMins,
  totalMsgs,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const shareContent = `🔥 ChatChase Roast of ${targetName} [${tone.toUpperCase()} TIER]\n\n${roastText}\n\nEvidence Logged:\n• ${voiceNotesCount} Voice Notes\n• ${avgReplyMins}m average reply latency\n• Generated with verified citations by ChatChase`;
    navigator.clipboard.writeText(shareContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1C0D19] via-[#0E111E] to-[#0A0D18] border border-orange-500/30 p-5 shadow-2xl text-gray-100">
      {/* Background aesthetic glow */}
      <div className="absolute top-0 right-0 w-36 h-36 bg-orange-600/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-36 h-36 bg-violet-600/10 rounded-full blur-2xl pointer-events-none" />

      {/* Card Header (Wrapped Style) */}
      <div className="flex items-center justify-between pb-3 border-b border-orange-500/20">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-400">
            <Flame className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-orange-400 block">
              ChatChase Wrapped Roast
            </span>
            <h4 className="text-sm font-black text-white tracking-tight">
              {targetName}
            </h4>
          </div>
        </div>

        <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-orange-600 text-white shadow-sm shadow-orange-900/50">
          {tone}
        </span>
      </div>

      {/* Habit Metrics Badges */}
      <div className="grid grid-cols-3 gap-2 my-3 text-center">
        <div className="p-2 rounded-xl bg-black/40 border border-white/5">
          <span className="text-[9px] uppercase font-semibold text-gray-400 block flex items-center justify-center gap-1">
            <Volume2 className="w-2.5 h-2.5 text-orange-400" />
            Voice Notes
          </span>
          <span className="text-xs font-black text-orange-300 font-mono">
            {voiceNotesCount}
          </span>
        </div>

        <div className="p-2 rounded-xl bg-black/40 border border-white/5">
          <span className="text-[9px] uppercase font-semibold text-gray-400 block flex items-center justify-center gap-1">
            <Clock className="w-2.5 h-2.5 text-violet-400" />
            Avg Latency
          </span>
          <span className="text-xs font-black text-violet-300 font-mono">
            {avgReplyMins}m
          </span>
        </div>

        <div className="p-2 rounded-xl bg-black/40 border border-white/5">
          <span className="text-[9px] uppercase font-semibold text-gray-400 block">
            Messages
          </span>
          <span className="text-xs font-black text-gray-200 font-mono">
            {totalMsgs}
          </span>
        </div>
      </div>

      {/* The Roast Punchline */}
      <div className="p-3.5 rounded-xl bg-black/50 border border-orange-500/20 text-xs text-gray-200 leading-relaxed font-sans italic">
        "{roastText}"
      </div>

      {/* Shareable Footer */}
      <div className="mt-3.5 pt-3 border-t border-white/10 flex items-center justify-between text-[11px]">
        <span className="text-gray-400 text-[10px] flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-yellow-400" />
          Verified chat habit evidence
        </span>

        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-semibold text-[11px] transition shadow"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-white" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Share2 className="w-3.5 h-3.5" />
              <span>Share Roast</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

