"use client";

import React, { useState } from "react";
import { PersonaCard, Citation } from "@/lib/api";
import {
  User,
  Users,
  Search,
  Quote,
  ShieldCheck,
  Flame,
  Volume2,
  Clock,
  Sparkles,
  Calendar,
  Smile,
  X
} from "lucide-react";

interface PersonaCardsProps {
  personas: PersonaCard[];
  onSelectCitation: (c: Citation) => void;
  onClose?: () => void;
}

export const PersonaCards: React.FC<PersonaCardsProps> = ({
  personas,
  onSelectCitation,
  onClose,
}) => {
  const [searchFilter, setSearchFilter] = useState("");

  const filtered = personas.filter(
    (p) =>
      p.participant_name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      p.group_role.toLowerCase().includes(searchFilter.toLowerCase()) ||
      p.communication_style.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const getRoleBadge = (role: string) => {
    const r = role.toLowerCase();
    if (r.includes("voice") || r.includes("podcast"))
      return "bg-orange-950/80 text-orange-300 border-orange-700/60";
    if (r.includes("planner") || r.includes("engine") || r.includes("trip"))
      return "bg-emerald-950/80 text-emerald-300 border-emerald-700/60";
    if (r.includes("ghost") || r.includes("late") || r.includes("silent"))
      return "bg-slate-800 text-slate-300 border-slate-700";
    if (r.includes("meme") || r.includes("vibes") || r.includes("humour"))
      return "bg-pink-950/80 text-pink-300 border-pink-700/60";
    return "bg-[#2a3942] text-[#00a884] border-[#00a884]/40";
  };

  return (
    <div className="h-full flex flex-col bg-[#111b21] text-[#e9edef] overflow-y-auto divide-y divide-[#222e35]">
      {/* Header */}
      <div className="h-[60px] bg-[#202c33] px-4 flex items-center justify-between shrink-0">
        <div>
          <h3 className="font-semibold text-sm text-[#e9edef] flex items-center gap-1.5">
            <Users className="w-4 h-4 text-[#00a884]" />
            Participant Personas
          </h3>
          <p className="text-[10px] text-[#8696a0]">
            {personas.length} participants with grounded conversational styles
          </p>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="p-1 rounded-full text-[#8696a0] hover:text-white hover:bg-[#374248] transition"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Search Input */}
      <div className="p-3 bg-[#111b21] shrink-0">
        <div className="flex items-center bg-[#202c33] rounded-lg px-3 py-1.5 gap-2 border border-[#2a3942] focus-within:border-[#00a884]">
          <Search className="w-3.5 h-3.5 text-[#8696a0]" />
          <input
            type="text"
            placeholder="Search member name or persona role..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="w-full text-xs bg-transparent text-[#e9edef] placeholder-[#8696a0] focus:outline-none"
          />
          {searchFilter && (
            <button onClick={() => setSearchFilter("")} className="text-[#8696a0] hover:text-white text-xs">
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Personas List */}
      <div className="p-3 space-y-3 flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <p className="text-center text-xs text-[#8696a0] py-8">No personas match your query</p>
        ) : (
          filtered.map((persona) => (
            <div
              key={persona.participant_name}
              className="p-3.5 rounded-xl bg-[#202c33] border border-[#222e35] hover:border-[#374248] transition space-y-2.5 shadow-sm"
            >
              {/* Profile Card Top */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#00a884] to-teal-700 flex items-center justify-center font-bold text-xs text-white shadow">
                    {persona.participant_name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-white">
                      {persona.participant_name}
                    </h4>
                    <span
                      className={`text-[9px] font-semibold px-2 py-0.5 rounded-full border inline-block mt-0.5 ${getRoleBadge(
                        persona.group_role
                      )}`}
                    >
                      {persona.group_role}
                    </span>
                  </div>
                </div>
              </div>

              {/* Trait Descriptions */}
              <div className="text-[11px] text-[#8696a0] space-y-1 bg-[#111b21] p-2.5 rounded-lg border border-[#222e35]">
                <p>
                  <strong className="text-[#e9edef]">Communication Style:</strong> {persona.communication_style}
                </p>
                <p>
                  <strong className="text-[#e9edef]">Humour:</strong> {persona.humour_type}
                </p>
              </div>

              {/* Behavioral Habits */}
              {persona.habits && persona.habits.length > 0 && (
                <div className="text-[10px] text-[#8696a0] space-y-1">
                  <span className="font-bold text-[#00a884] block">Verified Habits:</span>
                  <ul className="list-disc list-inside space-y-0.5">
                    {persona.habits.map((h, i) => (
                      <li key={i} className="truncate text-[#e9edef]">{h}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Supporting Citations */}
              {persona.supporting_citations && persona.supporting_citations.length > 0 && (
                <div className="pt-2 border-t border-[#222e35] space-y-1.5">
                  <span className="text-[10px] text-[#8696a0] font-semibold block">
                    Supporting Citations:
                  </span>
                  <div className="space-y-1">
                    {persona.supporting_citations.map((c) => (
                      <button
                        key={c.message_seq}
                        onClick={() => onSelectCitation(c)}
                        className="w-full text-left p-1.5 rounded-lg bg-[#111b21] hover:bg-[#2a3942] text-[10px] text-[#8696a0] hover:text-[#e9edef] transition flex items-center justify-between border border-[#222e35]"
                      >
                        <span className="truncate max-w-[210px]">
                          <strong className="text-[#00a884] mr-1">#{c.message_seq}</strong>
                          "{c.quote}"
                        </span>
                        <span className="text-[9px] text-[#00a884] font-semibold">Inspect</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
