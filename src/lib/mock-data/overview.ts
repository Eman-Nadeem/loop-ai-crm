import { mockClients } from "./clients";

export interface OverviewStats {
  totalClients: number;
  activeProjects: number;
  totalBudget: number;
  signedAgreements: number;
  ongoingAgreements: number;
  platformDistribution: {
    upwork: number;
    freelancer: number;
    fiverr: number;
  };
}

export async function getOverviewStats(): Promise<OverviewStats> {
  const totalClients = mockClients.length;
  
  const platformDistribution = mockClients.reduce(
    (acc, client) => {
      if (client.platform === "upwork") acc.upwork++;
      else if (client.platform === "freelancer") acc.freelancer++;
      else if (client.platform === "fiverr") acc.fiverr++;
      return acc;
    },
    { upwork: 0, freelancer: 0, fiverr: 0 }
  );

  const totalBudget = mockClients.reduce((sum, client) => sum + client.budget, 0);
  
  const signedAgreements = mockClients.filter((c) => c.agreementStatus === "signed").length;
  const ongoingAgreements = mockClients.filter((c) => c.agreementStatus === "negotiating").length;
  
  const activeProjects = mockClients.reduce((sum, client) => sum + client.activeProjects, 0);

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        totalClients,
        activeProjects,
        totalBudget,
        signedAgreements,
        ongoingAgreements,
        platformDistribution,
      });
    }, 100);
  });
}
