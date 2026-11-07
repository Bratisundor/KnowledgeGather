"use client";

import React, { useState } from "react";
import { ChatStats } from "@/lib/api";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell
} from "recharts";
import {
  BarChart3,
  TrendingUp,
  Volume2,
  Calendar,
  Network,
  Clock,
  Sparkles,
  Award,
  X,
  Flame,
  MessageCircle
} from "lucide-react";

interface AnalyticsDashboardProps {
  stats: ChatStats | null;
  onOpenWrapped?: () => void;
  onClose?: () => void;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  stats,
  onOpenWrapped,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<
    "participation" | "mood" | "heatmap" | "leaderboard" | "relationships"
  >("participation");

  if (!stats || stats.total_messages === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-center text-[#8696a0] bg-[#111b21]">
        <BarChart3 className="w-10 h-10 text-[#374248] mb-2" />
        <h4 className="text-xs font-semibold text-[#e9edef]">No Analytics Yet</h4>
        <p className="text-[11px] text-[#8696a0] mt-1 max-w-[200px]">
          Select an active chat to view Python/pandas-computed conversation analytics.
        </p>
      </div>
    );
  }

  const participationData = stats.participant_stats.slice(0, 8).map((p) => ({
    name: p.name,
    messages: p.message_count,
    voice: p.voice_notes_count,
    percentage: p.percentage_of_chat,
  }));

  const moodData = stats.monthly_mood.map((m) => ({
    month: m.month,
    score: m.mood_score,
    topic: m.dominant_topic,
  }));

  const daysOfWeek = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  return (
    <div className="h-full flex flex-col bg-[#111b21] text-[#e9edef] overflow-y-auto divide-y divide-[#222e35]">
      {/* Top Header */}
      <div className="h-[60px] bg-[#202c33] px-4 flex items-center justify-between shrink-0">
        <div>
          <h3 className="font-semibold text-sm text-[#e9edef] flex items-center gap-1.5">
            <BarChart3 className="w-4 h-4 text-[#00a884]" />
            Chat Analytics
          </h3>
          <p className="text-[10px] text-[#8696a0]">
            {stats.total_messages} messages • {stats.participants.length} participants
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onOpenWrapped && (
            <button
              onClick={onOpenWrapped}
              className="px-2.5 py-1 rounded-full bg-[#00a884] text-white font-bold text-[10px] hover:bg-[#02906f] transition flex items-center gap-1 shadow-sm"
            >
              <Sparkles className="w-3 h-3 text-yellow-200" />
              <span>Wrapped</span>
            </button>
          )}

          {onClose && (
            <button
              onClick={onClose}
              className="p-1 rounded-full text-[#8696a0] hover:text-white hover:bg-[#374248] transition"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* KPI Overview Strip */}
      <div className="p-3 bg-[#111b21] grid grid-cols-3 gap-2 shrink-0">
        <div className="p-2.5 rounded-xl bg-[#202c33] border border-[#2a3942] text-center">
          <span className="text-[10px] text-[#8696a0] block">Total Messages</span>
          <span className="text-sm font-bold text-[#e9edef] font-mono">
            {stats.total_messages}
          </span>
        </div>
        <div className="p-2.5 rounded-xl bg-[#202c33] border border-[#2a3942] text-center">
          <span className="text-[10px] text-[#8696a0] block">Words Indexed</span>
          <span className="text-sm font-bold text-[#00a884] font-mono">
            {stats.total_words}
          </span>
        </div>
        <div className="p-2.5 rounded-xl bg-[#202c33] border border-[#2a3942] text-center">
          <span className="text-[10px] text-[#8696a0] block">Active Range</span>
          <span className="text-[10px] font-semibold text-[#53bdeb] font-mono">
            {stats.date_start ? stats.date_start.slice(0, 7) : "2024"}
          </span>
        </div>
      </div>

      {/* Tab Switcher Pills */}
      <div className="p-2 bg-[#202c33] flex items-center gap-1 overflow-x-auto text-xs shrink-0">
        {[
          { id: "participation", label: "Participation" },
          { id: "mood", label: "Mood Trend" },
          { id: "heatmap", label: "Heatmap" },
          { id: "leaderboard", label: "Voice Notes" },
          { id: "relationships", label: "Network" },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className={`px-3 py-1 rounded-full text-[11px] font-medium transition whitespace-nowrap ${
              activeTab === t.id
                ? "bg-[#00a884] text-white shadow"
                : "bg-[#111b21] text-[#8696a0] hover:text-[#e9edef]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content Display */}
      <div className="p-4 space-y-3 flex-1 overflow-y-auto">
        {/* Tab 1: Participation Bar Chart */}
        {activeTab === "participation" && (
          <div className="bg-[#202c33] p-3.5 rounded-xl border border-[#2a3942] space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[#e9edef] flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-yellow-400" />
                Conversation Driver Breakdown
              </span>
              <span className="text-[10px] text-[#8696a0] font-mono">via Pandas</span>
            </div>

            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={participationData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a3942" vertical={false} />
                  <XAxis dataKey="name" stroke="#8696a0" fontSize={10} tickLine={false} />
                  <YAxis stroke="#8696a0" fontSize={10} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#111b21", borderColor: "#2a3942", borderRadius: "8px", fontSize: "11px", color: "#e9edef" }}
                    formatter={(val: any) => [`${val} messages`, "Volume"]}
                  />
                  <Bar dataKey="messages" fill="#00a884" radius={[4, 4, 0, 0]}>
                    {participationData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? "#00a884" : index === 1 ? "#008f72" : "#2a3942"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-1.5 pt-2 border-t border-[#2a3942]">
              {stats.participant_stats.slice(0, 4).map((p, idx) => (
                <div key={p.name} className="flex items-center justify-between text-[11px] text-[#8696a0]">
                  <span className="flex items-center gap-1.5">
                    <span className="font-bold text-[#00a884]">{idx + 1}.</span>
                    <span className="text-[#e9edef] font-medium">{p.name}</span>
                  </span>
                  <span className="font-mono text-[10px]">
                    {p.message_count} msgs ({p.percentage_of_chat}%) • {p.avg_reply_time_mins}m reply
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Mood Trend */}
        {activeTab === "mood" && (
          <div className="bg-[#202c33] p-3.5 rounded-xl border border-[#2a3942] space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[#e9edef] flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-[#00a884]" />
                Monthly Sentiment Index
              </span>
              <span className="text-[10px] text-[#8696a0] font-mono">0 - 100 Score</span>
            </div>

            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={moodData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a3942" vertical={false} />
                  <XAxis dataKey="month" stroke="#8696a0" fontSize={10} tickLine={false} />
                  <YAxis domain={[30, 100]} stroke="#8696a0" fontSize={10} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#111b21", borderColor: "#2a3942", borderRadius: "8px", fontSize: "11px", color: "#e9edef" }}
                    formatter={(val: any) => [`${val}/100`, "Mood Score"]}
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#00a884"
                    strokeWidth={2.5}
                    dot={{ fill: "#00a884", r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-1.5 pt-2 border-t border-[#2a3942]">
              {stats.monthly_mood.map((m) => (
                <div key={m.month} className="flex items-center justify-between text-[11px] text-[#8696a0]">
                  <span className="font-mono text-[#e9edef]">{m.month}</span>
                  <span className="truncate max-w-[140px] text-[10px] text-[#8696a0]">
                    {m.dominant_topic}
                  </span>
                  <span className="font-bold text-[#00a884] font-mono text-[10px]">
                    {m.mood_score}/100
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Hourly Heatmap */}
        {activeTab === "heatmap" && (
          <div className="bg-[#202c33] p-3.5 rounded-xl border border-[#2a3942] space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[#e9edef] flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#53bdeb]" />
                Hourly Activity Frequency
              </span>
              <span className="text-[10px] text-[#8696a0]">Chat Intensity</span>
            </div>

            <div className="space-y-1">
              {daysOfWeek.map((day) => {
                const dayStats = stats.hourly_heatmap.filter((h) => h.day === day);
                return (
                  <div key={day} className="flex items-center gap-1.5 text-[9px]">
                    <span className="w-16 text-[#8696a0] font-mono truncate">{day.slice(0, 3)}</span>
                    <div className="flex-1 grid grid-cols-12 gap-0.5">
                      {Array.from({ length: 12 }).map((_, blockIdx) => {
                        const h1 = dayStats.find((d) => d.hour === blockIdx * 2)?.count || 0;
                        const h2 = dayStats.find((d) => d.hour === blockIdx * 2 + 1)?.count || 0;
                        const total = h1 + h2;
                        const bg =
                          total > 3
                            ? "bg-[#00a884]"
                            : total > 1
                            ? "bg-[#00a884]/60"
                            : total > 0
                            ? "bg-[#00a884]/25"
                            : "bg-[#111b21]";

                        return (
                          <div
                            key={blockIdx}
                            title={`${day} ${blockIdx * 2}:00 - ${total} messages`}
                            className={`h-4 rounded-sm ${bg} transition hover:ring-1 hover:ring-white`}
                          />
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between text-[9px] text-[#8696a0] pt-2 border-t border-[#2a3942]">
              <span>12 AM</span>
              <span>6 AM</span>
              <span>12 PM</span>
              <span>6 PM</span>
              <span>11 PM</span>
            </div>
          </div>
        )}

        {/* Tab 4: Voice Note Leaderboard */}
        {activeTab === "leaderboard" && (
          <div className="bg-[#202c33] p-3.5 rounded-xl border border-[#2a3942] space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[#e9edef] flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5 text-orange-400" />
                Voice Note Podcaster Rankings
              </span>
              <span className="text-[10px] text-[#8696a0]">Whisper Counts</span>
            </div>

            <div className="space-y-2">
              {stats.voice_note_leaderboard.map((item, idx) => (
                <div
                  key={item.name}
                  className="p-2.5 rounded-lg bg-[#111b21] border border-[#222e35] flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-orange-600/20 text-orange-400 font-bold text-xs flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="text-xs font-semibold text-white">
                      {item.name}
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold text-orange-300">
                    {item.voice_count} voice notes
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 5: Relationship Network */}
        {activeTab === "relationships" && (
          <div className="bg-[#202c33] p-3.5 rounded-xl border border-[#2a3942] space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[#e9edef] flex items-center gap-1.5">
                <Network className="w-3.5 h-3.5 text-violet-400" />
                Top Interaction Pairs
              </span>
              <span className="text-[10px] text-[#8696a0]">Reply Graph</span>
            </div>

            <div className="space-y-2">
              {stats.relationship_edges.slice(0, 6).map((edge, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-lg bg-[#111b21] border border-[#222e35] flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white">{edge.source}</span>
                    <span className="text-[#8696a0]">⇄</span>
                    <span className="font-semibold text-white">{edge.target}</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#202c33] text-[#00a884] font-bold">
                    {edge.weight} interactions
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
