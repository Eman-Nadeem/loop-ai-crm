"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { Client, mockClients } from "@/lib/mock-data/clients";
import { Project, mockProjects } from "@/lib/mock-data/projects";
import { Thread, Message, mockThreads } from "@/lib/mock-data/messages";
import {
  fetchCRMState,
  createClientDb,
  updateClientDb,
  deleteClientDb,
  createProjectDb,
  updateProjectDb,
  deleteProjectDb,
  addMessageDb,
  markThreadReadDb,
  checkGmailConnectionAction,
  syncGmailInboxAction,
  disconnectGmailAction
} from "@/lib/actions/crm-actions";

export interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "info";
}

interface CRMContextType {
  clients: Client[];
  projects: Project[];
  threads: Thread[];
  loading: boolean;
  
  // Client CRUD
  addClient: (client: Omit<Client, "id" | "avatarUrl" | "activeProjects">) => void;
  updateClient: (id: string, updated: Partial<Client>) => void;
  deleteClient: (id: string) => void;
  getClientById: (id: string) => Client | undefined;
  
  // Project CRUD
  addProject: (project: Omit<Project, "id" | "progress"> & { progress?: number }) => void;
  updateProject: (id: string, updated: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  getProjectById: (id: string) => Project | undefined;
  
  // Thread CRUD
  addMessage: (clientId: string, text: string, sender: "me" | "client") => void;
  markThreadAsRead: (clientId: string) => void;
  
  // Toasts
  toasts: Toast[];
  addToast: (message: string, type?: "success" | "error" | "info") => void;
  removeToast: (id: string) => void;

  // Gmail OAuth Integration
  isGmailConnected: boolean;
  gmailSyncing: boolean;
  syncGmail: () => Promise<void>;
  disconnectGmail: () => Promise<void>;
}

const CRMContext = createContext<CRMContextType | undefined>(undefined);

const PRESET_AVATARS = [
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80",
  "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&q=80",
  "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=150&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80"
];

export function CRMProvider({ children }: { children: React.ReactNode }) {
  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isGmailConnected, setIsGmailConnected] = useState(false);
  const [gmailSyncing, setGmailSyncing] = useState(false);

  // Initialize data on mount
  useEffect(() => {
    async function loadData() {
      try {
        console.log("[CRM Context] Loading state from remote database...");
        const state = await fetchCRMState();
        
        setClients(state.clients);
        setProjects(state.projects as Project[]);
        setThreads(state.threads as Thread[]);
        console.log("[CRM Context] Database connected successfully.");

        // Check Gmail connection status
        const connection = await checkGmailConnectionAction();
        setIsGmailConnected(connection.connected);
      } catch (error) {
        console.warn(
          "[CRM Context] Database URL not configured or connection failed. Falling back to local session store.",
          error
        );

        // Resolve local references for fallback
        const resolvedProjects = mockProjects.map((proj) => ({
          ...proj,
          client: mockClients.find((c) => c.id === proj.clientId),
        }));

        const resolvedThreads = mockThreads.map((thread) => ({
          ...thread,
          client: mockClients.find((c) => c.id === thread.clientId),
        }));

        setClients(mockClients);
        setProjects(resolvedProjects);
        setThreads(resolvedThreads);
      } finally {
        setLoading(false);
      }
    }
    
    loadData();
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((message: string, type: "success" | "error" | "info" = "success") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    
    // Auto-remove toast after 3.5 seconds
    setTimeout(() => {
      removeToast(id);
    }, 3500);
  }, [removeToast]);

  // Client actions
  const getClientById = useCallback((id: string) => {
    return clients.find((c) => c.id === id);
  }, [clients]);

  const addClient = useCallback(async (newClientData: Omit<Client, "id" | "avatarUrl" | "activeProjects">) => {
    // Generate new unique ID
    const numericIds = clients.map((c) => parseInt(c.id)).filter((id) => !isNaN(id));
    const nextId = (numericIds.length > 0 ? Math.max(...numericIds) + 1 : 1).toString();
    const avatarUrl = PRESET_AVATARS[Math.floor(Math.random() * PRESET_AVATARS.length)];
    
    const newClient: Client = {
      ...newClientData,
      id: nextId,
      avatarUrl,
      activeProjects: 0,
    };

    // 1. Optimistic local state update
    setClients((prev) => [...prev, newClient]);
    setThreads((prevThreads) => [
      ...prevThreads,
      {
        clientId: nextId,
        client: newClient,
        messages: [],
      }
    ]);

    // 2. Persist to DB asynchronously
    try {
      await createClientDb(newClient);
      addToast("Client onboarded successfully!", "success");
    } catch (e) {
      console.warn("[CRM Context DB Error] Failed to persist client to DB. Active in-memory session only.", e);
      addToast("Onboarded client (session-only).", "info");
    }
  }, [clients, addToast]);

  const updateClient = useCallback(async (id: string, updated: Partial<Client>) => {
    // 1. Local state update
    setClients((prevClients) => {
      const nextClients = prevClients.map((c) => (c.id === id ? { ...c, ...updated } : c));
      
      // Update reference inside projects
      setProjects((prevProjs) =>
        prevProjs.map((p) => {
          if (p.clientId === id) {
            const updatedClientRecord = nextClients.find((c) => c.id === id);
            return { ...p, client: updatedClientRecord };
          }
          return p;
        })
      );

      // Update reference inside threads
      setThreads((prevThreads) =>
        prevThreads.map((t) => {
          if (t.clientId === id) {
            const updatedClientRecord = nextClients.find((c) => c.id === id);
            return { ...t, client: updatedClientRecord };
          }
          return t;
        })
      );

      return nextClients;
    });

    // 2. Persist to DB
    try {
      // Exclude relational objects / internal fields
      const { id: cId, activeProjects, ...persistData } = updated as any;
      await updateClientDb(id, persistData);
      addToast("Client updated successfully!", "success");
    } catch (e) {
      console.warn("[CRM Context DB Error] Failed to persist client updates.", e);
      addToast("Client updated (session-only).", "info");
    }
  }, [addToast]);

  const deleteClient = useCallback(async (id: string) => {
    // 1. Local cascade delete
    setClients((prev) => prev.filter((c) => c.id !== id));
    setProjects((prev) => prev.filter((p) => p.clientId !== id));
    setThreads((prev) => prev.filter((t) => t.clientId !== id));

    // 2. Persist delete
    try {
      await deleteClientDb(id);
      addToast("Client and projects deleted successfully.", "info");
    } catch (e) {
      console.warn("[CRM Context DB Error] Failed to persist client deletion.", e);
      addToast("Client deleted (session-only).", "info");
    }
  }, [addToast]);

  // Project actions
  const getProjectById = useCallback((id: string) => {
    return projects.find((p) => p.id === id);
  }, [projects]);

  const addProject = useCallback(async (newProjectData: Omit<Project, "id" | "progress"> & { progress?: number }) => {
    const id = `p${Date.now()}`;
    const client = clients.find((c) => c.id === newProjectData.clientId);
    
    const newProject: Project = {
      ...newProjectData,
      id,
      progress: newProjectData.progress !== undefined ? newProjectData.progress : 0,
      client,
    };

    // 1. Local update
    setProjects((prev) => [...prev, newProject]);
    if (newProject.status === "active") {
      setClients((prevClients) =>
        prevClients.map((c) =>
          c.id === newProject.clientId
            ? { ...c, activeProjects: c.activeProjects + 1 }
            : c
        )
      );
    }

    // 2. Persist
    try {
      // Omit relational client reference from database insert payload
      const { client: _, ...persistPayload } = newProject as any;
      await createProjectDb(persistPayload);
      addToast("Project registered successfully!", "success");
    } catch (e) {
      console.warn("[CRM Context DB Error] Failed to persist project.", e);
      addToast("Project registered (session-only).", "info");
    }
  }, [clients, addToast]);

  const updateProject = useCallback(async (id: string, updated: Partial<Project>) => {
    // 1. Local update
    setProjects((prev) => {
      const nextProjs = prev.map((p) => (p.id === id ? { ...p, ...updated } : p));
      
      const projectToUpdate = prev.find((p) => p.id === id);
      if (projectToUpdate && updated.status !== undefined && updated.status !== projectToUpdate.status) {
        const cId = projectToUpdate.clientId;
        const count = nextProjs.filter((p) => p.clientId === cId && p.status === "active").length;
        setClients((prevClients) =>
          prevClients.map((c) => (c.id === cId ? { ...c, activeProjects: count } : c))
        );
      }
      return nextProjs;
    });

    // 2. Persist
    try {
      const { client: _, id: __, ...persistPayload } = updated as any;
      await updateProjectDb(id, persistPayload);
      addToast("Project updated successfully!", "success");
    } catch (e) {
      console.warn("[CRM Context DB Error] Failed to persist project updates.", e);
      addToast("Project updated (session-only).", "info");
    }
  }, [addToast]);

  const deleteProject = useCallback(async (id: string) => {
    // 1. Local update
    setProjects((prev) => {
      const projectToDelete = prev.find((p) => p.id === id);
      const nextProjs = prev.filter((p) => p.id !== id);

      if (projectToDelete && projectToDelete.status === "active") {
        const cId = projectToDelete.clientId;
        const count = nextProjs.filter((p) => p.clientId === cId && p.status === "active").length;
        setClients((prevClients) =>
          prevClients.map((c) => (c.id === cId ? { ...c, activeProjects: count } : c))
        );
      }
      return nextProjs;
    });

    // 2. Persist
    try {
      await deleteProjectDb(id);
      addToast("Project deleted successfully.", "info");
    } catch (e) {
      console.warn("[CRM Context DB Error] Failed to delete project.", e);
      addToast("Project deleted (session-only).", "info");
    }
  }, [addToast]);

  // Messages / Threads actions
  const addMessage = useCallback(async (clientId: string, text: string, sender: "me" | "client") => {
    const mId = `${sender}_${Date.now()}`;
    const newMessage: Message = {
      id: mId,
      sender,
      text,
      timestamp: new Date().toISOString(),
      read: sender === "me",
    };

    // 1. Local update
    setThreads((prev) =>
      prev.map((t) => {
        if (t.clientId === clientId) {
          return {
            ...t,
            messages: [...t.messages, newMessage],
          };
        }
        return t;
      })
    );

    // 2. Persist
    try {
      await addMessageDb({
        id: mId,
        clientId,
        sender,
        text,
        timestamp: newMessage.timestamp,
        read: newMessage.read,
      });
    } catch (e) {
      console.warn("[CRM Context DB Error] Failed to persist message to DB.", e);
    }
  }, []);

  const markThreadAsRead = useCallback(async (clientId: string) => {
    // 1. Local update
    setThreads((prev) =>
      prev.map((t) => {
        if (t.clientId === clientId) {
          return {
            ...t,
            messages: t.messages.map((m) => ({ ...m, read: true })),
          };
        }
        return t;
      })
    );

    // 2. Persist
    try {
      await markThreadReadDb(clientId);
    } catch (e) {
      console.warn("[CRM Context DB Error] Failed to mark messages as read.", e);
    }
  }, []);

  const syncGmail = useCallback(async () => {
    setGmailSyncing(true);
    try {
      const result = await syncGmailInboxAction();
      if (result.success) {
        const stats = result as { matchedCount?: number; unmatchedCount?: number };
        addToast(
          `Gmail synced successfully! Matched: ${stats.matchedCount || 0}, Unmatched: ${stats.unmatchedCount || 0}`,
          "success"
        );
        // Refresh entire state to populate the synced messages
        const state = await fetchCRMState();
        setClients(state.clients);
        setProjects(state.projects as Project[]);
        setThreads(state.threads as Thread[]);
      } else {
        addToast(result.error || "Failed to sync Gmail messages.", "error");
      }
    } catch (e: any) {
      addToast(e.message || "An unexpected error occurred during sync.", "error");
    } finally {
      setGmailSyncing(false);
    }
  }, [addToast]);

  const disconnectGmail = useCallback(async () => {
    try {
      const result = await disconnectGmailAction();
      if (result.success) {
        setIsGmailConnected(false);
        addToast("Gmail account disconnected successfully.", "success");
      } else {
        addToast(result.error || "Failed to disconnect Gmail.", "error");
      }
    } catch (e: any) {
      addToast(e.message || "An unexpected error occurred during disconnect.", "error");
    }
  }, [addToast]);

  return (
    <CRMContext.Provider
      value={{
        clients,
        projects,
        threads,
        loading,
        addClient,
        updateClient,
        deleteClient,
        getClientById,
        addProject,
        updateProject,
        deleteProject,
        getProjectById,
        addMessage,
        markThreadAsRead,
        toasts,
        addToast,
        removeToast,
        isGmailConnected,
        gmailSyncing,
        syncGmail,
        disconnectGmail,
      }}
    >
      {children}
      
      {/* Dynamic Toast Portal */}
      <div className="fixed bottom-6 right-6 z-9999 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => {
            const colors = {
              success: {
                bg: "bg-white border-emerald-100 text-slate-800 shadow-emerald-50/20",
                icon: <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
              },
              error: {
                bg: "bg-white border-rose-100 text-slate-800 shadow-rose-50/20",
                icon: <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
              },
              info: {
                bg: "bg-white border-indigo-100 text-slate-800 shadow-indigo-50/20",
                icon: <Info className="w-5 h-5 text-indigo-500 shrink-0" />
              }
            }[toast.type];

            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 350, damping: 25 }}
                className={`pointer-events-auto flex items-center justify-between p-4 rounded-2xl border shadow-xl ${colors.bg} gap-3`}
              >
                <div className="flex items-center gap-3">
                  {colors.icon}
                  <span className="text-xs font-bold leading-tight">{toast.message}</span>
                </div>
                <button
                  onClick={() => removeToast(toast.id)}
                  className="p-1 rounded-lg hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer shrink-0"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </CRMContext.Provider>
  );
}

export function useCRM() {
  const context = useContext(CRMContext);
  if (!context) {
    throw new Error("useCRM must be used within a CRMProvider");
  }
  return context;
}
