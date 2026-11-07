"use client";

import React, { useState } from "react";
import { Project, Chat } from "@/lib/api";
import {
  Users,
  User,
  Trash2,
  Upload,
  Sparkles,
  Search,
  CheckCheck,
  MoreVertical,
  Plus,
  FolderOpen,
  Filter,
  ShieldCheck,
  Bot,
  MessageSquare,
  ChevronDown,
  X
} from "lucide-react";

interface SidebarProps {
  projects: Project[];
  activeProject: Project | null;
  onSelectProject: (p: Project) => void;
  onCreateProject: (name: string) => void;
  onDeleteProject: (pid: string) => void;
  chats: Chat[];
  activeChat: Chat | null;
  onSelectChat: (c: Chat | null) => void;
  onDeleteChat: (cid: string) => void;
  onOpenUpload: () => void;
  onTriggerDemo: () => void;
  isLoadingDemo: boolean;
  onOpenWrapped?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  projects,
  activeProject,
  onSelectProject,
  onCreateProject,
  onDeleteProject,
  chats,
  activeChat,
  onSelectChat,
  onDeleteChat,
  onOpenUpload,
  onTriggerDemo,
  isLoadingDemo,
  onOpenWrapped,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "group" | "direct">("all");
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [newProjName, setNewProjName] = useState("");

  const filteredChats = chats.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.participants.some((p) => p.toLowerCase().includes(searchQuery.toLowerCase()));
    if (!matchesSearch) return false;
    if (filterType === "group") return c.chat_type === "group";
    if (filterType === "direct") return c.chat_type === "direct";
    return true;
  });

  const getChatAvatarColor = (name: string) => {
    const colors = [
      "from-emerald-500 to-teal-700",
      "from-blue-500 to-indigo-700",
      "from-violet-500 to-purple-700",
      "from-rose-500 to-pink-700",
      "from-amber-500 to-orange-700",
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <aside className="w-[360px] h-screen bg-[#111b21] border-r border-[#222e35] flex flex-col select-none shrink-0">
      {/* 1. WhatsApp Top Bar */}
      <header className="h-[60px] bg-[#202c33] px-4 flex items-center justify-between border-b border-[#222e35] shrink-0">
        <div className="flex items-center gap-3">
          {/* AI Avatar */}
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#00a884] to-emerald-400 flex items-center justify-center text-white shadow font-bold text-sm">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#00a884] border-2 border-[#202c33] rounded-full" />
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-bold text-sm text-[#e9edef] tracking-tight">
                ChatChase
              </h1>
            </div>
            {/* Project Switcher Pill */}
            <div
              onClick={() => setShowProjectModal(true)}
              className="text-[11px] text-[#8696a0] hover:text-[#00a884] cursor-pointer flex items-center gap-1 transition"
            >
              <span>Project: <strong className="text-[#e9edef]">{activeProject?.name || "Select Project"}</strong></span>
              <ChevronDown className="w-3 h-3 text-[#8696a0]" />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 text-[#aebac1]">
          <button
            onClick={onOpenUpload}
            title="Upload WhatsApp TXT export"
            className="p-2 rounded-full hover:bg-[#374248] text-[#aebac1] hover:text-white transition"
          >
            <Upload className="w-4 h-4" />
          </button>

          <button
            onClick={() => setShowProjectModal(true)}
            title="Manage Projects"
            className="p-2 rounded-full hover:bg-[#374248] text-[#aebac1] hover:text-white transition"
          >
            <FolderOpen className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* 2. Search & Filter Bar */}
      <div className="p-2.5 bg-[#111b21] space-y-2 border-b border-[#222e35] shrink-0">
        <div className="flex items-center bg-[#202c33] rounded-lg px-3 py-1.5 gap-2.5 border border-transparent focus-within:border-[#00a884] transition">
          <Search className="w-4 h-4 text-[#8696a0]" />
          <input
            type="text"
            placeholder="Search conversations or contacts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs bg-transparent text-[#e9edef] placeholder-[#8696a0] focus:outline-none"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="text-[#8696a0] hover:text-white text-xs">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 px-0.5">
          {[
            { id: "all", label: "All Chats" },
            { id: "group", label: "Groups" },
            { id: "direct", label: "1:1 Personal" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id as any)}
              className={`px-3 py-1 rounded-full text-[11px] font-medium transition ${
                filterType === tab.id
                  ? "bg-[#00a884]/20 text-[#00a884] border border-[#00a884]/50"
                  : "bg-[#202c33] text-[#8696a0] hover:text-[#e9edef]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Conversation List */}
      <div className="flex-1 overflow-y-auto divide-y divide-[#222e35]/60">
        {filteredChats.length === 0 ? (
          <div className="p-8 text-center text-[#8696a0] text-xs space-y-3">
            <p>No conversations found</p>
            <button
              onClick={onOpenUpload}
              className="px-3.5 py-1.5 rounded-lg bg-[#00a884] text-white text-xs font-semibold hover:bg-[#02906f] transition shadow"
            >
              Upload WhatsApp Export
            </button>
          </div>
        ) : (
          filteredChats.map((chat) => {
            const isSelected = activeChat?.id === chat.id;
            const isGroup = chat.chat_type === "group";
            const avatarGradient = getChatAvatarColor(chat.name);

            return (
              <div
                key={chat.id}
                onClick={() => onSelectChat(chat)}
                className={`group px-3 py-3 flex items-center gap-3 cursor-pointer transition relative ${
                  isSelected
                    ? "bg-[#2a3942]"
                    : "hover:bg-[#202c33]/70"
                }`}
              >
                {/* Circular Contact / Group Avatar */}
                <div
                  className={`w-12 h-12 rounded-full bg-gradient-to-tr ${avatarGradient} flex items-center justify-center text-white font-bold text-sm shrink-0 shadow`}
                >
                  {isGroup ? (
                    <Users className="w-5 h-5 text-white" />
                  ) : (
                    <User className="w-5 h-5 text-white" />
                  )}
                </div>

                {/* Chat Middle Metadata */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-sm text-[#e9edef] truncate">
                      {chat.name}
                    </h3>
                    <span className="text-[11px] text-[#8696a0] shrink-0 font-mono">
                      {chat.date_end ? chat.date_end.slice(5) : "Dec 18"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-1 text-[12px] text-[#8696a0]">
                    <p className="truncate pr-2 flex items-center gap-1">
                      <CheckCheck className="w-3.5 h-3.5 text-[#53bdeb] shrink-0" />
                      <span className="truncate">
                        {isGroup
                          ? `${chat.participants.slice(0, 3).join(", ")}...`
                          : `Active 1:1 conversation`}
                      </span>
                    </p>

                    {/* Unread badge in WhatsApp Green */}
                    <span className="min-w-[20px] h-5 rounded-full bg-[#00a884] text-white text-[10px] font-bold flex items-center justify-center px-1.5 shrink-0 shadow-sm">
                      {chat.message_count}
                    </span>
                  </div>
                </div>

                {/* Hover Delete Action */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm(`Permanently delete "${chat.name}" and all its memory?`)) {
                      onDeleteChat(chat.id);
                    }
                  }}
                  title="Delete chat from brain"
                  className="opacity-0 group-hover:opacity-100 p-1.5 rounded-full hover:bg-red-500/20 text-[#8696a0] hover:text-red-400 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Project Switcher Modal */}
      {showProjectModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-2xl bg-[#202c33] border border-[#222e35] p-5 space-y-4 shadow-2xl text-[#e9edef] animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-[#222e35]">
              <h3 className="font-bold text-sm flex items-center gap-2 text-white">
                <FolderOpen className="w-4 h-4 text-[#00a884]" />
                Projects Workspace
              </h3>
              <button onClick={() => setShowProjectModal(false)} className="p-1 rounded-full text-[#8696a0] hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (newProjName.trim()) {
                  onCreateProject(newProjName.trim());
                  setNewProjName("");
                }
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                placeholder="New project name..."
                value={newProjName}
                onChange={(e) => setNewProjName(e.target.value)}
                className="flex-1 bg-[#111b21] border border-[#222e35] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#00a884]"
              />
              <button
                type="submit"
                className="px-3.5 py-1.5 bg-[#00a884] text-white rounded-lg text-xs font-semibold hover:bg-[#02906f] transition"
              >
                Create
              </button>
            </form>

            <div className="space-y-1.5 max-h-52 overflow-y-auto">
              {projects.map((p) => (
                <div
                  key={p.id}
                  onClick={() => {
                    onSelectProject(p);
                    setShowProjectModal(false);
                  }}
                  className={`p-2.5 rounded-lg text-xs cursor-pointer flex items-center justify-between transition ${
                    activeProject?.id === p.id
                      ? "bg-[#00a884]/20 border border-[#00a884] text-white font-medium"
                      : "bg-[#111b21] hover:bg-[#222e35] text-[#8696a0] hover:text-[#e9edef]"
                  }`}
                >
                  <span className="font-medium">{p.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] bg-[#222e35] px-1.5 py-0.5 rounded text-[#8696a0]">
                      {p.chat_count} chats
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Delete project "${p.name}"?`)) onDeleteProject(p.id);
                      }}
                      className="text-[#8696a0] hover:text-red-400 p-1"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
