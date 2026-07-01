export interface Client {
  id: string;
  name: string;
  role: string;
  company: string;
  platform: 'upwork' | 'fiverr' | 'freelancer';
  sector: 'UX/UI Design' | 'Branding' | 'Media';
  budget: number;
  avatarUrl: string;
}

export const mockClients: Client[] = [
  {
    id: "1",
    name: "Sophie Turner",
    role: "CEO",
    company: "UpperCode",
    platform: "upwork",
    sector: "UX/UI Design",
    budget: 150,
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80"
  },
  {
    id: "2",
    name: "Chloe Anderson",
    role: "CFO",
    company: "FinServe",
    platform: "freelancer",
    sector: "Branding",
    budget: 120,
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
  },
  {
    id: "3",
    name: "Isabella Hart",
    role: "CTO",
    company: "TechWave",
    platform: "upwork",
    sector: "Media",
    budget: 75,
    avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80"
  },
  {
    id: "4",
    name: "Samuel Thompson",
    role: "CMO",
    company: "BrandLift",
    platform: "freelancer",
    sector: "Branding",
    budget: 200,
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80"
  },
  {
    id: "5",
    name: "Michael Anderson",
    role: "COO",
    company: "OpsMaster",
    platform: "upwork",
    sector: "Media",
    budget: 90,
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80"
  },
  {
    id: "6",
    name: "David Johnson",
    role: "CIO",
    company: "DataSphere",
    platform: "fiverr",
    sector: "Branding",
    budget: 250,
    avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80"
  },
  {
    id: "7",
    name: "Madeline Brooks",
    role: "CSO",
    company: "SecureNet",
    platform: "freelancer",
    sector: "Media",
    budget: 180,
    avatarUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80"
  },
  {
    id: "8",
    name: "Christopher Brown",
    role: "CHRO",
    company: "PeopleFirst",
    platform: "upwork",
    sector: "UX/UI Design",
    budget: 80,
    avatarUrl: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=150&q=80"
  },
  {
    id: "9",
    name: "Daniel Martinez",
    role: "CDO",
    company: "DigitalNest",
    platform: "upwork",
    sector: "Media",
    budget: 230,
    avatarUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80"
  },
  {
    id: "10",
    name: "Victoria Lane",
    role: "CLO",
    company: "LegalWise",
    platform: "fiverr",
    sector: "Branding",
    budget: 140,
    avatarUrl: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=150&q=80"
  },
  {
    id: "11",
    name: "Matthew Garcia",
    role: "CVO",
    company: "VisionaryCorp",
    platform: "freelancer",
    sector: "UX/UI Design",
    budget: 100,
    avatarUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=150&q=80"
  },
  {
    id: "12",
    name: "James Wilson",
    role: "CPO",
    company: "ProductForge",
    platform: "freelancer",
    sector: "Branding",
    budget: 110,
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80"
  }
];

export async function getClients(): Promise<Client[]> {
  // Simulating an asynchronous network call so it can be swapped for Supabase/Drizzle easily
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockClients);
    }, 100);
  });
}
