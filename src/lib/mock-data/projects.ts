import { mockClients, Client } from "./clients";

export interface Project {
  id: string;
  name: string;
  clientId: string;
  client?: Client; // Resolved client reference
  status: 'active' | 'completed' | 'on_hold';
  budget: number;
  progress: number; // 0 to 100
  startDate: string; // YYYY-MM-DD
  deadline: string; // YYYY-MM-DD
}

export const mockProjects: Project[] = [
  {
    id: "p1",
    name: "Website Redesign & Dev",
    clientId: "1", // Sophie Turner
    status: "active",
    budget: 80,
    progress: 65,
    startDate: "2026-05-10",
    deadline: "2026-07-20"
  },
  {
    id: "p2",
    name: "FinServe Brand Guidelines",
    clientId: "2", // Chloe Anderson
    status: "on_hold",
    budget: 50,
    progress: 20,
    startDate: "2026-04-15",
    deadline: "2026-09-01"
  },
  {
    id: "p3",
    name: "TechWave Pitch Deck Design",
    clientId: "3", // Isabella Hart
    status: "completed",
    budget: 35,
    progress: 100,
    startDate: "2026-05-01",
    deadline: "2026-06-15"
  },
  {
    id: "p4",
    name: "BrandLift Summer Campaign",
    clientId: "4", // Samuel Thompson
    status: "active",
    budget: 120,
    progress: 45,
    startDate: "2026-06-01",
    deadline: "2026-08-15"
  },
  {
    id: "p5",
    name: "OpsMaster Dashboard UX",
    clientId: "5", // Michael Anderson
    status: "active",
    budget: 60,
    progress: 10,
    startDate: "2026-06-20",
    deadline: "2026-09-15"
  },
  {
    id: "p6",
    name: "DataSphere Global Identity",
    clientId: "6", // David Johnson
    status: "completed",
    budget: 150,
    progress: 100,
    startDate: "2026-03-01",
    deadline: "2026-05-30"
  },
  {
    id: "p7",
    name: "SecureNet Client Portal Design",
    clientId: "7", // Madeline Brooks
    status: "active",
    budget: 90,
    progress: 80,
    startDate: "2026-05-15",
    deadline: "2026-07-31"
  },
  {
    id: "p8",
    name: "DigitalNest UX Research",
    clientId: "9", // Daniel Martinez
    status: "active",
    budget: 70,
    progress: 30,
    startDate: "2026-06-10",
    deadline: "2026-08-30"
  }
];

export async function getProjects(): Promise<Project[]> {
  // Simulate network latency and automatically resolve client references
  return new Promise((resolve) => {
    setTimeout(() => {
      const projectsWithClients = mockProjects.map((project) => {
        const client = mockClients.find((c) => c.id === project.clientId);
        return {
          ...project,
          client
        };
      });
      resolve(projectsWithClients);
    }, 100);
  });
}
