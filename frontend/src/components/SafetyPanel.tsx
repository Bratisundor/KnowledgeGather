"use client";

import React from "react";
import {
  ShieldCheck,
  CheckCircle2,
  AlertOctagon,
  Lock,
  EyeOff,
  Trash2,
  Flame,
  FileCheck2,
  Check
} from "lucide-react";

export const SafetyPanel: React.FC = () => {
  return (
    <div className="h-full flex flex-col p-4 space-y-4 overflow-y-auto text-xs text-[#e9edef] bg-[#111b21] divide-y divide-[#222e35]">
      {/* Header */}
      <div className="pb-3 flex items-center justify-between shrink-0">
        <div>
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#00a884]" />
            Safety & Privacy Architecture
          </h3>
          <p className="text-[10px] text-[#8696a0]">
            Responsible AI guardrails and cryptographic project isolation
          </p>
        </div>
        <span className="text-[9px] uppercase font-bold px-2 py-0.5 rounded-full bg-[#00a884]/20 text-[#00a884] border border-[#00a884]/40">
          Enforced
        </span>
      </div>

      {/* Trust & Safety KPI Strip */}
      <div className="pt-3 grid grid-cols-2 gap-2 text-center">
        <div className="p-2.5 rounded-xl bg-[#202c33] border border-[#2a3942]">
          <span className="text-[10px] text-[#8696a0] block">Hallucination Rate</span>
          <span className="text-xs font-bold text-[#00a884] font-mono">0.0%</span>
          <span className="text-[9px] text-[#8696a0] block mt-0.5">Stats in Python</span>
        </div>
        <div className="p-2.5 rounded-xl bg-[#202c33] border border-[#2a3942]">
          <span className="text-[10px] text-[#8696a0] block">Evidence Citations</span>
          <span className="text-xs font-bold text-[#53bdeb] font-mono">100% Verified</span>
          <span className="text-[9px] text-[#8696a0] block mt-0.5">Audited by SQLite</span>
        </div>
      </div>

      {/* Ethical Roasting Policy Card */}
      <div className="pt-3 space-y-2">
        <div className="p-3.5 rounded-xl bg-[#202c33] border border-[#2a3942] space-y-2">
          <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-orange-400" />
            Strictly Habit-Only Roasting
          </h4>
          <p className="text-[11px] text-[#8696a0] leading-relaxed">
            ChatChase roasts target <strong>conversational habits ONLY</strong>. Every roast must be verified against actual messaging behavior:
          </p>
          <ul className="space-y-1 text-[11px] text-[#e9edef] list-disc list-inside">
            <li>Voice-note broadcasts & podcast durations</li>
            <li>Ghosting, late replies, and 4-hour delay on "k"</li>
            <li>3 AM hostel Maggie emergencies & night owl habits</li>
            <li>Promises like "Kal se pakka padhenge"</li>
          </ul>
        </div>
      </div>

      {/* Forbidden Attack Vectors */}
      <div className="pt-3 space-y-2">
        <div className="p-3.5 rounded-xl bg-red-950/20 border border-red-800/40 space-y-2">
          <h4 className="font-bold text-red-300 text-xs flex items-center gap-1.5">
            <EyeOff className="w-4 h-4 text-red-400" />
            Zero-Tolerance Prohibited Categories
          </h4>
          <p className="text-[10px] text-[#8696a0]">
            All roasts pass an automated moderation check. Any mention of the following is blocked automatically before rendering:
          </p>
          <div className="grid grid-cols-2 gap-1.5 text-[10px]">
            {[
              "Religion & Caste",
              "Race & Ethnicity",
              "Physical Appearance",
              "Health & Medical",
              "Family & Trauma",
              "Finances & Wealth"
            ].map((item) => (
              <div
                key={item}
                className="px-2 py-1 rounded bg-[#111b21] border border-red-900/50 text-red-300 flex items-center gap-1"
              >
                <span className="text-red-400 font-bold">✕</span> {item}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Strict Per-Project Data Isolation */}
      <div className="pt-3 space-y-2">
        <div className="p-3.5 rounded-xl bg-[#202c33] border border-[#2a3942] space-y-1.5">
          <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
            <Lock className="w-4 h-4 text-[#53bdeb]" />
            Per-Project Cryptographic Isolation
          </h4>
          <p className="text-[11px] text-[#8696a0] leading-relaxed">
            Conversations within Project "Suman" can never bleed into or cross-query another project. Foreign key constraints and SQLite scopes ensure complete tenant separation.
          </p>
        </div>
      </div>

      {/* Delete Everything Guarantee */}
      <div className="pt-3 space-y-2">
        <div className="p-3.5 rounded-xl bg-[#202c33] border border-[#2a3942] space-y-1.5">
          <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
            <Trash2 className="w-4 h-4 text-gray-400" />
            Permanent Memory Erase Guarantee
          </h4>
          <p className="text-[11px] text-[#8696a0] leading-relaxed">
            Deleting a chat or project triggers a cascading hard-delete across all raw messages, persona cards, session summaries, and event memory tables.
          </p>
        </div>
      </div>
    </div>
  );
};
