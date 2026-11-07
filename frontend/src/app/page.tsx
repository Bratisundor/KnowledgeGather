"use client";

import React, { useState, useEffect } from "react";
import {
  Project,
  Chat,
  Citation,
  AgentResponse,
  PersonaCard,
  ChatStats,
  fetchProjects,
  createProject,
  deleteProject,
  fetchChats,
  deleteChat,
  askAgent,
  fetchChatStats,
  fetchChatPersonas,
  triggerDemoSeed
} from "@/lib/api";
import { Sidebar } from "@/components/Sidebar";
import { AgentChat } from "@/components/AgentChat";
import { EvidencePanel } from "@/components/EvidencePanel";
import { PersonaCards } from "@/components/PersonaCards";
import { AnalyticsDashboard } from "@/components/AnalyticsDashboard";
import { SafetyPanel } from "@/components/SafetyPanel";
import { UploadModal } from "@/components/UploadModal";
import { MessageBrowserModal } from "@/components/MessageBrowserModal";
import { WrappedModal } from "@/components/WrappedModal";

export default function Home() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChat] = useState<Chat | null>(null);

  // Agent Chat Messages State
  const [chatMessages, setChatMessages] = useState<
    Array<{
      sender: "user" | "agent";
      agentType?: string;
      text: string;
      response?: AgentResponse;
      timestamp: string;
    }>
  >([]);
  const [isLoadingAgent, setIsLoadingAgent] = useState(false);
  const [selectedCitation, setSelectedCitation] = useState<Citation | null>(null);

  // WhatsApp Right Slide Drawer Tabs & Visibility
  const [rightTab, setRightTab] = useState<"evidence" | "personas" | "dashboards" | "safety">("evidence");
  const [isRightDrawerOpen, setIsRightDrawerOpen] = useState(false);

  // Dashboards & Personas Data
  const [chatStats, setChatStats] = useState<ChatStats | null>(null);
  const [personas, setPersonas] = useState<PersonaCard[]>([]);

  // Modals & Stories
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isBrowserOpen, setIsBrowserOpen] = useState(false);
  const [isWrappedOpen, setIsWrappedOpen] = useState(false);
  const [isLoadingDemo, setIsLoadingDemo] = useState(false);

  // Load projects on startup
  const loadProjects = async () => {
    try {
      let projs = await fetchProjects();
      if (!projs || projs.length === 0) {
        await triggerDemoSeed();
        projs = await fetchProjects();
      }
      setProjects(projs);
      if (projs && projs.length > 0) {
        const suman = projs.find((p) => p.name.toLowerCase() === "suman") || projs[0];
        setActiveProject(suman);
      }
    } catch (err) {
      console.error("Error loading projects:", err);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  // When active project changes, load its chats
  useEffect(() => {
    if (!activeProject) {
      setChats([]);
      setActiveChat(null);
      return;
    }

    const loadChats = async () => {
      try {
        const cList = await fetchChats(activeProject.id);
        setChats(cList);
        if (cList.length > 0) {
          const defaultChat = cList.find((c) => c.chat_type === "group") || cList[0];
          setActiveChat(defaultChat);
        } else {
          setActiveChat(null);
        }
      } catch (err) {
        console.error("Error loading chats:", err);
      }
    };

    loadChats();
  }, [activeProject]);

  // When active chat changes, load its stats, personas, and welcome message
  useEffect(() => {
    if (!activeProject || !activeChat) {
      setChatStats(null);
      setPersonas([]);
      setChatMessages([]);
      return;
    }

    const loadChatData = async () => {
      try {
        const [statsData, personasData] = await Promise.all([
          fetchChatStats(activeProject.id, activeChat.id),
          fetchChatPersonas(activeProject.id, activeChat.id),
        ]);
        setChatStats(statsData);
        setPersonas(personasData);

        const isGroup = activeChat.chat_type === "group";
        const timeNow = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

        // Add welcome introduction message into the chat stream
        setChatMessages([
          {
            sender: "agent",
            agentType: "deep_analyzer",
            text: `👋 Connected to **${activeChat.name}** (${isGroup ? `Group with ${activeChat.participant_count} participants` : "1:1 Chat"}, ${activeChat.message_count} messages indexed).\n\nAsk me about conversation drivers, request a spicy habit roast, generate cloned replies, or recall past events like the Goa trip!`,
            timestamp: timeNow,
          },
        ]);
      } catch (err) {
        console.error("Error loading chat details:", err);
      }
    };

    loadChatData();
  }, [activeProject, activeChat]);

  // Handle Asking an Agent
  const handleAsk = async (
    query: string,
    agent: string,
    tone: string,
    targetParticipant?: string
  ) => {
    if (!activeProject) return;

    const timeNow = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    // Append user message immediately
    setChatMessages((prev) => [
      ...prev,
      {
        sender: "user",
        text: query,
        timestamp: timeNow,
      },
    ]);

    setIsLoadingAgent(true);

    try {
      const response = await askAgent(activeProject.id, {
        query,
        chat_id: activeChat?.id,
        agent: agent === "auto" ? undefined : agent,
        tone,
        participant: targetParticipant,
      });

      // Automatically select first citation if available and slide open evidence panel
      if (response.citations && response.citations.length > 0) {
        setSelectedCitation(response.citations[0]);
        setRightTab("evidence");
        setIsRightDrawerOpen(true);
      }

      setChatMessages((prev) => [
        ...prev,
        {
          sender: "agent",
          agentType: response.agent,
          text: response.answer,
          response,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } catch (err: any) {
      setChatMessages((prev) => [
        ...prev,
        {
          sender: "agent",
          text: `⚠️ Query Failed: ${err.message || "Could not process request."}`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setIsLoadingAgent(false);
    }
  };

  // Demo Trigger (Seeds Suman Project)
  const handleTriggerDemo = async () => {
    setIsLoadingDemo(true);
    try {
      await triggerDemoSeed();
      await loadProjects();
      const projs = await fetchProjects();
      const suman = projs.find((p) => p.name.toLowerCase() === "suman") || projs[0];
      if (suman) {
        setActiveProject(suman);
      }
      setChatMessages([]);
    } catch (err: any) {
      alert("Failed to seed demo: " + err.message);
    } finally {
      setIsLoadingDemo(false);
    }
  };

  // Project Creation
  const handleCreateProject = async (name: string) => {
    try {
      const newProj = await createProject(name);
      setProjects([newProj, ...projects]);
      setActiveProject(newProj);
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Project Deletion
  const handleDeleteProject = async (pid: string) => {
    try {
      await deleteProject(pid);
      const remaining = projects.filter((p) => p.id !== pid);
      setProjects(remaining);
      setActiveProject(remaining[0] || null);
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Chat Deletion
  const handleDeleteChat = async (cid: string) => {
    if (!activeProject) return;
    try {
      await deleteChat(activeProject.id, cid);
      const remaining = chats.filter((c) => c.id !== cid);
      setChats(remaining);
      setActiveChat(remaining[0] || null);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const latestResponse = [...chatMessages].reverse().find((m) => m.response)?.response;
  const currentCitations = latestResponse?.citations || [];

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0b141a] text-[#e9edef] font-sans antialiased">
      {/* 1. Left WhatsApp Sidebar (Conversations List) */}
      <Sidebar
        projects={projects}
        activeProject={activeProject}
        onSelectProject={(p) => {
          setActiveProject(p);
          setChatMessages([]);
        }}
        onCreateProject={handleCreateProject}
        onDeleteProject={handleDeleteProject}
        chats={chats}
        activeChat={activeChat}
        onSelectChat={(c) => {
          setActiveChat(c);
          setChatMessages([]);
        }}
        onDeleteChat={handleDeleteChat}
        onOpenUpload={() => setIsUploadOpen(true)}
        onTriggerDemo={handleTriggerDemo}
        isLoadingDemo={isLoadingDemo}
        onOpenWrapped={() => setIsWrappedOpen(true)}
      />

      {/* 2. Center WhatsApp Conversation View */}
      <AgentChat
        chatId={activeChat?.id || null}
        chatName={activeChat?.name || activeProject?.name || "All Conversations"}
        participants={activeChat?.participants || []}
        onAsk={handleAsk}
        messages={chatMessages}
        isLoading={isLoadingAgent}
        onSelectCitation={(c) => {
          setSelectedCitation(c);
          setRightTab("evidence");
          setIsRightDrawerOpen(true);
        }}
        selectedCitation={selectedCitation}
        onOpenMessageBrowser={() => setIsBrowserOpen(true)}
        onToggleInfoPanel={(tab) => {
          setRightTab(tab);
          setIsRightDrawerOpen((prev) => (rightTab === tab ? !prev : true));
        }}
        onOpenWrapped={() => setIsWrappedOpen(true)}
        onResetMessages={() => setChatMessages([])}
      />

      {/* 3. Right WhatsApp Slide Drawer (Group Info / Evidence / Analytics) */}
      {isRightDrawerOpen && (
        <aside className="w-[380px] h-screen bg-[#111b21] border-l border-[#222e35] flex flex-col shrink-0 animate-in slide-in-from-right duration-200">
          {rightTab === "evidence" && (
            <EvidencePanel
              citation={selectedCitation}
              allCitations={currentCitations}
              onSelectCitation={(c) => setSelectedCitation(c)}
              onClose={() => setIsRightDrawerOpen(false)}
            />
          )}

          {rightTab === "personas" && (
            <PersonaCards
              personas={personas}
              onSelectCitation={(c) => {
                setSelectedCitation(c);
                setRightTab("evidence");
              }}
              onClose={() => setIsRightDrawerOpen(false)}
            />
          )}

          {rightTab === "dashboards" && (
            <AnalyticsDashboard
              stats={chatStats}
              onOpenWrapped={() => setIsWrappedOpen(true)}
              onClose={() => setIsRightDrawerOpen(false)}
            />
          )}

          {rightTab === "safety" && (
            <SafetyPanel />
          )}
        </aside>
      )}

      {/* Upload WhatsApp TXT Modal */}
      {activeProject && (
        <UploadModal
          projectId={activeProject.id}
          isOpen={isUploadOpen}
          onClose={() => setIsUploadOpen(false)}
          onUploadSuccess={async () => {
            const cList = await fetchChats(activeProject.id);
            setChats(cList);
            if (cList.length > 0) setActiveChat(cList[0]);
          }}
        />
      )}

      {/* Raw Message Timeline Browser Modal */}
      {activeProject && activeChat && (
        <MessageBrowserModal
          projectId={activeProject.id}
          chatId={activeChat.id}
          chatName={activeChat.name}
          isOpen={isBrowserOpen}
          onClose={() => setIsBrowserOpen(false)}
          onSelectCitation={(c) => {
            setSelectedCitation(c);
            setRightTab("evidence");
            setIsRightDrawerOpen(true);
          }}
        />
      )}

      {/* 2024 Wrapped Story Modal */}
      {activeChat && (
        <WrappedModal
          chatName={activeChat.name}
          stats={chatStats}
          personas={personas}
          isOpen={isWrappedOpen}
          onClose={() => setIsWrappedOpen(false)}
        />
      )}
    </div>
  );
}
