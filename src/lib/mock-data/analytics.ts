import { mockClients } from "./clients";
import { mockProjects } from "./projects";

export interface MonthlyStats {
  month: string; // e.g. "Jan", "Feb", etc.
  clients: number;
  activeProjects: number;
  revenue: number; // in thousands (k)
  budget: number;  // target budget target in thousands (k)
  signedAgreements: number;
  negotiatingAgreements: number;
  upwork: number;
  freelancer: number;
  fiverr: number;
}

// Fabricated historical time-series data (Jan - May 2026) showing upward growth trends
export const historicalStats: MonthlyStats[] = [
  {
    month: "Jan",
    clients: 8,
    activeProjects: 3,
    revenue: 1200,
    budget: 1300,
    signedAgreements: 5,
    negotiatingAgreements: 3,
    upwork: 4,
    freelancer: 2,
    fiverr: 2
  },
  {
    month: "Feb",
    clients: 8,
    activeProjects: 3,
    revenue: 1280,
    budget: 1350,
    signedAgreements: 5,
    negotiatingAgreements: 3,
    upwork: 4,
    freelancer: 2,
    fiverr: 2
  },
  {
    month: "Mar",
    clients: 9,
    activeProjects: 4,
    revenue: 1350,
    budget: 1450,
    signedAgreements: 6,
    negotiatingAgreements: 3,
    upwork: 5,
    freelancer: 2,
    fiverr: 2
  },
  {
    month: "Apr",
    clients: 11,
    activeProjects: 4,
    revenue: 1480,
    budget: 1550,
    signedAgreements: 7,
    negotiatingAgreements: 4,
    upwork: 6,
    freelancer: 3,
    fiverr: 2
  },
  {
    month: "May",
    clients: 11,
    activeProjects: 4,
    revenue: 1550,
    budget: 1650,
    signedAgreements: 7,
    negotiatingAgreements: 4,
    upwork: 6,
    freelancer: 3,
    fiverr: 2
  }
];

export async function getAnalyticsData(): Promise<MonthlyStats[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Derive current month (June 2026) stats dynamically from the client and project databases
      const derivedClients = mockClients.length; // 12
      const derivedActiveProjects = mockProjects.filter((p) => p.status === "active").length; // 5
      const derivedRevenue = mockClients.reduce((sum, c) => sum + c.budget, 0); // 1725
      const derivedBudget = derivedRevenue + 120; // Budget target slightly higher (e.g. 1845)
      
      const derivedSigned = mockClients.filter((c) => c.agreementStatus === "signed").length; // 8
      const derivedNegotiating = mockClients.filter((c) => c.agreementStatus === "negotiating").length; // 4
      
      const derivedUpwork = mockClients.filter((c) => c.platform === "upwork").length;
      const derivedFreelancer = mockClients.filter((c) => c.platform === "freelancer").length;
      const derivedFiverr = mockClients.filter((c) => c.platform === "fiverr").length;

      const currentStats: MonthlyStats = {
        month: "Jun",
        clients: derivedClients,
        activeProjects: derivedActiveProjects,
        revenue: derivedRevenue,
        budget: derivedBudget,
        signedAgreements: derivedSigned,
        negotiatingAgreements: derivedNegotiating,
        upwork: derivedUpwork,
        freelancer: derivedFreelancer,
        fiverr: derivedFiverr
      };

      // Combine historical and current derived data
      resolve([...historicalStats, currentStats]);
    }, 100);
  });
}

export interface ComparisonTrends {
  revenueChange: number; // percentage change
  clientsChange: number;
  projectsChange: number;
  agreementsChange: number;
}

export function calculateTrends(current: MonthlyStats, previous: MonthlyStats): ComparisonTrends {
  const getChange = (curr: number, prev: number) => {
    if (prev === 0) return 0;
    return parseFloat((((curr - prev) / prev) * 100).toFixed(1));
  };

  return {
    revenueChange: getChange(current.revenue, previous.revenue),
    clientsChange: getChange(current.clients, previous.clients),
    projectsChange: getChange(current.activeProjects, previous.activeProjects),
    agreementsChange: getChange(current.signedAgreements, previous.signedAgreements)
  };
}
