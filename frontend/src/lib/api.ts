export const API_BASE = process.env.NEXT_PUBLIC_API_URL || (typeof window !== "undefined" ? "/api" : "http://127.0.0.1:8000");

export interface Project {
  id: string;
  name: string;
  description: string;
  created_at: string;
  chat_count: number;
}

export interface Chat {
  id: string;
  project_id: string;
  name: string;
  chat_type: "group" | "direct";
  message_count: number;
  participant_count: number;
  participants: string[];
  date_start: string | null;
  date_end: string | null;
  created_at: string;
}

export interface Citation {
  message_seq: number;
  sender: string;
  timestamp: string;
  quote: string;
  is_verified: boolean;
  match_score?: number;
  verification_details?: string;
}

export interface ReplyOption {
  tone: string;
  reply_text: string;
  explanation: string;
}

export interface AgentResponse {
  agent: string;
  scope: string;
  answer: string;
  citations: Citation[];
  verifier_status: "passed" | "flagged" | "failed" | "no_citations";
  verifier_badge: string;
  verifier_notes: string;
  stats_payload?: any;
  reply_options?: ReplyOption[];
  roast_details?: any;
  safety_passed?: boolean;
  moderation_notes?: string;
}

export interface PersonaCard {
  participant_name: string;
  group_role: string;
  communication_style: string;
  humour_type: string;
  interests: string[];
  habits: string[];
  catchphrases: string[];
  supporting_citations: Citation[];
}

export interface ChatStats {
  chat_id: string;
  total_messages: number;
  total_words: number;
  date_start: string;
  date_end: string;
  participants: string[];
  participant_stats: Array<{
    name: string;
    message_count: number;
    word_count: number;
    voice_notes_count: number;
    images_count: number;
    avg_reply_time_mins: number;
    late_night_msg_count: number;
    percentage_of_chat: number;
  }>;
  monthly_mood: Array<{
    month: string;
    mood_score: number;
    message_count: number;
    dominant_topic: string;
  }>;
  hourly_heatmap: Array<{
    day: string;
    hour: number;
    count: number;
  }>;
  voice_note_leaderboard: Array<{
    name: string;
    voice_count: number;
  }>;
  relationship_edges: Array<{
    source: string;
    target: string;
    weight: number;
  }>;
  top_topics: string[];
}

export async function fetchProjects(): Promise<Project[]> {
  const res = await fetch(`${API_BASE}/projects`);
  if (!res.ok) throw new Error("Failed to fetch projects");
  return res.json();
}

export async function createProject(name: string, description: string = ""): Promise<Project> {
  const res = await fetch(`${API_BASE}/projects`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, description }),
  });
  if (!res.ok) throw new Error("Failed to create project");
  return res.json();
}

export async function deleteProject(projectId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/projects/${projectId}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete project");
}

export async function fetchChats(projectId: string): Promise<Chat[]> {
  const res = await fetch(`${API_BASE}/projects/${projectId}/chats`);
  if (!res.ok) throw new Error("Failed to fetch chats");
  return res.json();
}

export async function deleteChat(projectId: string, chatId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/projects/${projectId}/chats/${chatId}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete chat");
}

export async function uploadChatFile(projectId: string, file: File, chatName?: string): Promise<any> {
  const formData = new FormData();
  formData.append("file", file);
  if (chatName) formData.append("chat_name", chatName);

  const res = await fetch(`${API_BASE}/projects/${projectId}/chats`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Failed to upload chat file");
  }
  return res.json();
}

export async function askAgent(
  projectId: string,
  payload: {
    query: string;
    chat_id?: string;
    agent?: string;
    participant?: string;
    tone?: string;
  }
): Promise<AgentResponse> {
  const res = await fetch(`${API_BASE}/projects/${projectId}/ask`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to get agent response");
  return res.json();
}

export async function fetchChatStats(projectId: string, chatId: string): Promise<ChatStats> {
  const res = await fetch(`${API_BASE}/projects/${projectId}/chats/${chatId}/stats`);
  if (!res.ok) throw new Error("Failed to fetch chat statistics");
  return res.json();
}

export async function fetchChatPersonas(projectId: string, chatId: string): Promise<PersonaCard[]> {
  const res = await fetch(`${API_BASE}/projects/${projectId}/chats/${chatId}/personas`);
  if (!res.ok) throw new Error("Failed to fetch chat personas");
  return res.json();
}

export async function fetchChatMessages(projectId: string, chatId: string, limit = 100, offset = 0) {
  const res = await fetch(`${API_BASE}/projects/${projectId}/chats/${chatId}/messages?limit=${limit}&offset=${offset}`);
  if (!res.ok) throw new Error("Failed to fetch chat messages");
  return res.json();
}

export async function triggerDemoSeed(): Promise<void> {
  const res = await fetch(`${API_BASE}/demo/seed`, { method: "POST" });
  if (!res.ok) throw new Error("Failed to seed demo data");
}

