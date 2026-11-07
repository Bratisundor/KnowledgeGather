"use client";

import React, { useState } from "react";
import { uploadChatFile } from "@/lib/api";
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  Loader2,
  X,
  FileCheck,
  Users,
  Mic,
  Database,
  Sparkles,
  Info,
  AlertCircle
} from "lucide-react";

interface UploadModalProps {
  projectId: string;
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: () => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  projectId,
  isOpen,
  onClose,
  onUploadSuccess,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [customName, setCustomName] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  if (!isOpen) return null;

  const steps = [
    { label: "Validating WhatsApp format (Android / iOS)", icon: FileCheck },
    { label: "Identifying participants & Group classification", icon: Users },
    { label: "Multimodal audio transcription (Whisper engine)", icon: Mic },
    { label: "Building 30-min session timelines & memory graph", icon: Database },
    { label: "Generating participant personas & citation index", icon: Sparkles },
  ];

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleStartUpload = async () => {
    if (!file) return;
    setIsProcessing(true);
    setErrorMsg("");
    setCurrentStep(1);

    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < steps.length - 1) return prev + 1;
        return prev;
      });
    }, 500);

    try {
      await uploadChatFile(projectId, file, customName || undefined);
      setCurrentStep(steps.length);
      clearInterval(stepInterval);
      setTimeout(() => {
        setIsProcessing(false);
        onUploadSuccess();
        onClose();
      }, 600);
    } catch (err: any) {
      clearInterval(stepInterval);
      setIsProcessing(false);
      setErrorMsg(err.message || "Failed to process chat export");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg rounded-2xl bg-[#111b21] border border-[#222e35] shadow-2xl p-6 space-y-5 text-[#e9edef] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#222e35]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#00a884]/20 border border-[#00a884]/40 flex items-center justify-center text-[#00a884]">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                Ingest WhatsApp Export
                <span className="text-[10px] bg-[#00a884]/20 text-[#00a884] font-semibold px-2 py-0.5 rounded-full border border-[#00a884]/30">
                  Evidence Ingestion
                </span>
              </h3>
              <p className="text-[11px] text-[#8696a0]">
                Android & iOS TXT exports with voice notes & system messages
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="p-1 rounded-full text-[#8696a0] hover:text-white hover:bg-[#202c33] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drag and Drop Zone */}
        {!isProcessing ? (
          <div className="space-y-4">
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleFileDrop}
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition ${
                isDragging
                  ? "border-[#00a884] bg-[#00a884]/10"
                  : file
                  ? "border-[#00a884]/60 bg-[#202c33]"
                  : "border-[#2a3942] hover:border-[#00a884]/60 bg-[#182229]"
              }`}
              onClick={() => {
                const el = document.getElementById("file-input");
                el?.click();
              }}
            >
              <input
                id="file-input"
                type="file"
                accept=".txt"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setFile(e.target.files[0]);
                  }
                }}
              />

              {file ? (
                <div className="flex items-center justify-center gap-3 text-left">
                  <div className="w-10 h-10 rounded-lg bg-[#00a884]/20 text-[#00a884] flex items-center justify-center">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white truncate max-w-[280px]">
                      {file.name}
                    </p>
                    <p className="text-[11px] text-[#8696a0]">
                      {(file.size / 1024).toFixed(1)} KB • Ready to parse
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <UploadCloud className="w-8 h-8 text-[#8696a0] mx-auto" />
                  <p className="text-xs text-[#e9edef] font-medium">
                    Drag & drop WhatsApp <span className="text-[#00a884] font-semibold">.txt</span> export here
                  </p>
                  <p className="text-[11px] text-[#8696a0]">
                    or click to browse from your computer
                  </p>
                </div>
              )}
            </div>

            {/* Custom Conversation Name (Optional) */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-[#8696a0]">
                Conversation Display Name (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. College Trip 2024, Family Chat..."
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                className="w-full bg-[#202c33] border border-[#2a3942] rounded-lg px-3 py-2 text-xs text-[#e9edef] placeholder-[#8696a0] focus:outline-none focus:border-[#00a884]"
              />
            </div>

            {/* Ingestion Info Box */}
            <div className="bg-[#202c33]/70 rounded-xl p-3 border border-[#2a3942] flex items-start gap-2.5 text-[11px] text-[#8696a0]">
              <Info className="w-4 h-4 text-[#00a884] shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-semibold text-[#e9edef] block">
                  Deterministic Ingestion Guarantee
                </span>
                <p>
                  Timestamps, senders, and message counts are parsed deterministically into SQLite. Voice notes are transcribed into the timeline with audio duration metadata.
                </p>
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-950/40 border border-red-800 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-[#202c33] hover:bg-[#2a3942] text-xs font-medium text-[#8696a0] hover:text-white transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleStartUpload}
                disabled={!file}
                className="px-5 py-2 rounded-lg bg-[#00a884] hover:bg-[#02906f] text-white text-xs font-semibold disabled:opacity-40 transition shadow-md flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Process Conversation
              </button>
            </div>
          </div>
        ) : (
          /* Live Processing Pipeline */
          <div className="py-4 space-y-4">
            <div className="text-center space-y-1">
              <Loader2 className="w-8 h-8 text-[#00a884] animate-spin mx-auto" />
              <h4 className="text-sm font-bold text-white">
                Building Memory Brain...
              </h4>
              <p className="text-[11px] text-[#8696a0]">
                Parsing messages, building layered memory, and extracting personas
              </p>
            </div>

            <div className="space-y-2 bg-[#202c33] p-4 rounded-xl border border-[#2a3942]">
              {steps.map((st, idx) => {
                const Icon = st.icon;
                const isDone = currentStep > idx;
                const isCurrent = currentStep === idx + 1;

                return (
                  <div
                    key={idx}
                    className={`flex items-center gap-3 text-xs transition ${
                      isDone
                        ? "text-[#00a884] font-medium"
                        : isCurrent
                        ? "text-white font-semibold"
                        : "text-[#8696a0] opacity-50"
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                        isDone
                          ? "bg-[#00a884] text-white"
                          : isCurrent
                          ? "bg-[#00a884]/20 text-[#00a884] border border-[#00a884] animate-pulse"
                          : "bg-[#111b21] text-[#8696a0]"
                      }`}
                    >
                      {isDone ? (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      ) : (
                        <Icon className="w-3.5 h-3.5" />
                      )}
                    </div>
                    <span>{st.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
