"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { Client, mockClients } from "@/lib/mock-data/clients";
import { Project, mockProjects } from "@/lib/mock-data/projects";
import { Thread, Message, mockThreads } from "@/lib/mock-data/messages";

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

  // Initialize data on mount
  useEffect(() => {
    // Resolve references
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
    setLoading(false);
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

  const addClient = useCallback((newClientData: Omit<Client, "id" | "avatarUrl" | "activeProjects">) => {
    setClients((prevClients) => {
      // Find a safe numeric ID
      const numericIds = prevClients.map((c) => parseInt(c.id)).filter((id) => !isNaN(id));
      const nextId = (numericIds.length > 0 ? Math.max(...numericIds) + 1 : 1).toString();
      
      const avatarUrl = PRESET_AVATARS[Math.floor(Math.random() * PRESET_AVATARS.length)];
      
      const newClient: Client = {
        ...newClientData,
        id: nextId,
        avatarUrl,
        activeProjects: 0,
      };

      // Create an empty thread for inbox capabilities
      setThreads((prevThreads) => [
        ...prevThreads,
        {
          clientId: nextId,
          client: newClient,
          messages: [],
        }
      ]);

      addToast("Client onboarded successfully!", "success");
      return [...prevClients, newClient];
    });
  }, [addToast]);

  const updateClient = useCallback((id: string, updated: Partial<Client>) => {
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

      addToast("Client updated successfully!", "success");
      return nextClients;
    });
  }, [addToast]);

  const deleteClient = useCallback((id: string) => {
    // 1. Remove the client
    setClients((prev) => prev.filter((c) => c.id !== id));
    
    // 2. Cascade delete: remove all projects belonging to this client
    setProjects((prev) => prev.filter((p) => p.clientId !== id));

    // 3. Remove thread for this client
    setThreads((prev) => prev.filter((t) => t.clientId !== id));

    addToast("Client and associated projects deleted.", "info");
  }, [addToast]);

  // Project actions
  const getProjectById = useCallback((id: string) => {
    return projects.find((p) => p.id === id);
  }, [projects]);

  const addProject = useCallback((newProjectData: Omit<Project, "id" | "progress"> & { progress?: number }) => {
    setProjects((prevProjects) => {
      const id = `p${Date.now()}`;
      const client = clients.find((c) => c.id === newProjectData.clientId);
      
      const newProject: Project = {
        ...newProjectData,
        id,
        progress: newProjectData.progress !== undefined ? newProjectData.progress : 0,
        client,
      };

      // If status is active, increment client's active project count
      if (newProject.status === "active") {
        setClients((prevClients) =>
          prevClients.map((c) =>
            c.id === newProject.clientId
              ? { ...c, activeProjects: c.activeProjects + 1 }
              : c
          )
        );
      }

      addToast("Project registered successfully!", "success");
      return [...prevProjects, newProject];
    });
  }, [clients, addToast]);

  const updateProject = useCallback((id: string, updated: Partial<Project>) => {
    setProjects((prev) => {
      const nextProjs = prev.map((p) => (p.id === id ? { ...p, ...updated } : p));
      
      // Sync active projects counts for client
      const projectToUpdate = prev.find((p) => p.id === id);
      if (projectToUpdate && updated.status !== undefined && updated.status !== projectToUpdate.status) {
        const cId = projectToUpdate.clientId;
        const count = nextProjs.filter((p) => p.clientId === cId && p.status === "active").length;
        setClients((prevClients) =>
          prevClients.map((c) => (c.id === cId ? { ...c, activeProjects: count } : c))
        );
      }

      addToast("Project updated successfully!", "success");
      return nextProjs;
    });
  }, [addToast]);

  const deleteProject = useCallback((id: string) => {
    setProjects((prev) => {
      const projectToDelete = prev.find((p) => p.id === id);
      const nextProjs = prev.filter((p) => p.id !== id);

      // Decrement client's activeProjects if the deleted project was active
      if (projectToDelete && projectToDelete.status === "active") {
        const cId = projectToDelete.clientId;
        const count = nextProjs.filter((p) => p.clientId === cId && p.status === "active").length;
        setClients((prevClients) =>
          prevClients.map((c) => (c.id === cId ? { ...c, activeProjects: count } : c))
        );
      }

      addToast("Project deleted successfully.", "info");
      return nextProjs;
    });
  }, [addToast]);

  // Messages / Threads actions
  const addMessage = useCallback((clientId: string, text: string, sender: "me" | "client") => {
    const newMessage: Message = {
      id: `${sender}_${Date.now()}`,
      sender,
      text,
      timestamp: new Date().toISOString(),
      read: sender === "me",
    };

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
  }, []);

  const markThreadAsRead = useCallback((clientId: string) => {
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
  }, []);

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
      }}
    >
      {children}
      
      {/* Dynamic Toast Portal */}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
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
