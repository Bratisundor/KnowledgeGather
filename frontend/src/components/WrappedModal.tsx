"use client";

import React, { useState } from "react";
import { ChatStats, PersonaCard } from "@/lib/api";
import {
  Sparkles,
  Trophy,
  Mic,
  Clock,
  Heart,
  Share2,
  Copy,
  Check,
  X,
  ChevronRight,
  Flame,
  Calendar,
  Volume2
} from "lucide-react";

interface WrappedModalProps {
  chatName: string;
  stats: ChatStats | null;
  personas: PersonaCard[];
  isOpen: boolean;
  onClose: () => void;
}

export const WrappedModal: React.FC<WrappedModalProps> = ({
  chatName,
  stats,
  personas,
  isOpen,
  onClose,
}) => {
  const [slide, setSlide] = useState(0);
  const [copied, setCopied] = useState(false);

  if (!isOpen || !stats) return null;

  const topDriver = stats.participant_stats[0] || { name: "Suman", message_count: 7, percentage_of_chat: 18.4 };
  const voiceLeader = stats.voice_note_leaderboard[0] || { name: "Shrimant", voice_count: 3 };
  const slowestReplier = [...stats.participant_stats].sort((a, b) => b.avg_reply_time_mins - a.avg_reply_time_mins)[0] || { name: "Shrimant", avg_reply_time_mins: 38.0 };
  const peakMonth = [...stats.monthly_mood].sort((a, b) => b.mood_score - a.mood_score)[0] || { month: "2024-08", mood_score: 78, dominant_topic: "Goa Trip Planning" };

  const totalSlides = 4;

  const handleShare = () => {
    const text = `🎉 ${chatName} 2024 Wrapped (via ChatChase)\n\n🏆 Top Driver: ${topDriver.name} (${topDriver.percentage_of_chat}% of chat)\n🎙️ Voice Note Champion: ${voiceLeader.name} (${voiceLeader.voice_count} audio notes)\n⏳ Ghost Award: ${slowestReplier.name} (${slowestReplier.avg_reply_time_mins}m avg reply latency)\n🌟 Peak Mood: ${peakMonth.month} (${peakMonth.dominant_topic} - ${peakMonth.mood_score}/100)\n\nPowered by ChatChase Evidence AI`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-sm rounded-3xl bg-gradient-to-br from-[#0c1f19] via-[#0b141a] to-[#121c22] border border-[#00a884]/40 shadow-2xl p-6 text-white overflow-hidden flex flex-col justify-between min-h-[530px] animate-in fade-in zoom-in-95 duration-200">
        {/* Glow rings */}
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-[#00a884]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Story Progress Bars */}
        <div className="space-y-3 z-10">
          <div className="flex gap-1.5">
            {Array.from({ length: totalSlides }).map((_, i) => (
              <div
                key={i}
                className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden"
              >
                <div
                  className={`h-full bg-[#00a884] transition-all duration-300 ${
                    i <= slide ? "w-full" : "w-0"
                  }`}
                />
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between text-xs text-white/70">
            <span className="font-bold tracking-wider uppercase text-[10px] text-[#00a884] flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              ChatChase 2024 Wrapped
            </span>
            <button
              onClick={onClose}
              className="p-1 rounded-full text-white/60 hover:text-white hover:bg-white/10"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Slide Content */}
        <div className="py-6 my-auto text-center space-y-4 z-10">
          {slide === 0 && (
            <div className="space-y-4 animate-in fade-in zoom-in duration-300">
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-yellow-500 to-amber-300 flex items-center justify-center mx-auto shadow-xl">
                <Trophy className="w-10 h-10 text-black" />
              </div>
              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-yellow-300">
                  Primary Conversation Driver
                </span>
                <h3 className="text-3xl font-extrabold text-white tracking-tight">
                  {topDriver.name}
                </h3>
              </div>
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 max-w-[260px] mx-auto text-xs space-y-1">
                <p className="text-white/80">
                  Contributed <strong className="text-yellow-300 font-mono text-sm">{topDriver.percentage_of_chat}%</strong> of all group banter!
                </p>
                <p className="text-[10px] text-white/50">
                  {topDriver.message_count} messages sent in total
                </p>
              </div>
            </div>
          )}

          {slide === 1 && (
            <div className="space-y-4 animate-in fade-in zoom-in duration-300">
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-orange-500 to-amber-400 flex items-center justify-center mx-auto shadow-xl">
                <Volume2 className="w-10 h-10 text-black" />
              </div>
              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-orange-400">
                  Voice-Note Podcaster Award
                </span>
                <h3 className="text-3xl font-extrabold text-white tracking-tight">
                  {voiceLeader.name}
                </h3>
              </div>
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 max-w-[260px] mx-auto text-xs space-y-1">
                <p className="text-white/80">
                  Broadcasted <strong className="text-orange-400 font-mono text-sm">{voiceLeader.voice_count}</strong> audio notes.
                </p>
                <p className="text-[10px] text-white/50">
                  Transcribed in full with Whisper AI
                </p>
              </div>
            </div>
          )}

          {slide === 2 && (
            <div className="space-y-4 animate-in fade-in zoom-in duration-300">
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-400 flex items-center justify-center mx-auto shadow-xl">
                <Clock className="w-10 h-10 text-black" />
              </div>
              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-300">
                  The Official Ghost Award
                </span>
                <h3 className="text-3xl font-extrabold text-white tracking-tight">
                  {slowestReplier.name}
                </h3>
              </div>
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 max-w-[260px] mx-auto text-xs space-y-1">
                <p className="text-white/80">
                  Average reply latency of <strong className="text-cyan-300 font-mono text-sm">{slowestReplier.avg_reply_time_mins} mins</strong>.
                </p>
                <p className="text-[10px] text-white/50">
                  "Seen at 10 PM, replied at 2 AM with 'ok'"
                </p>
              </div>
            </div>
          )}

          {slide === 3 && (
            <div className="space-y-4 animate-in fade-in zoom-in duration-300">
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center mx-auto shadow-xl">
                <Heart className="w-10 h-10 text-black" />
              </div>
              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-300">
                  Peak Group Happiness Month
                </span>
                <h3 className="text-3xl font-extrabold text-white tracking-tight">
                  {peakMonth.month}
                </h3>
              </div>
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 max-w-[260px] mx-auto text-xs space-y-1">
                <p className="text-white/80">
                  Dominant Topic: <strong className="text-emerald-300">{peakMonth.dominant_topic}</strong>
                </p>
                <p className="text-[10px] text-white/50">
                  Group Mood Score: {peakMonth.mood_score}/100
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation & Share */}
        <div className="flex items-center justify-between gap-3 pt-4 border-t border-white/10 z-10">
          <button
            onClick={handleShare}
            className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white flex items-center justify-center gap-1.5 transition"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#00a884]" />
                <span>Copied Story!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" />
                <span>Share Story</span>
              </>
            )}
          </button>

          <button
            onClick={() => {
              if (slide < totalSlides - 1) setSlide((s) => s + 1);
              else setSlide(0);
            }}
            className="px-5 py-2.5 rounded-xl bg-[#00a884] hover:bg-[#02906f] text-white text-xs font-bold flex items-center gap-1 transition shadow-lg"
          >
            <span>{slide === totalSlides - 1 ? "Replay" : "Next"}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
