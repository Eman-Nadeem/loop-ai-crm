import { mockClients, Client } from "./clients";

export interface Message {
  id: string;
  sender: 'client' | 'me';
  text: string;
  timestamp: string; // ISO String
  read: boolean;
}

export interface Thread {
  clientId: string;
  client?: Client; // Resolved client reference
  messages: Message[];
}

export const mockThreads: Thread[] = [
  {
    clientId: "1", // Sophie Turner
    messages: [
      {
        id: "m1_1",
        sender: "client",
        text: "Hi! Did you get a chance to look at the dashboard wireframes?",
        timestamp: "2026-06-30T14:30:00Z",
        read: true
      },
      {
        id: "m1_2",
        sender: "me",
        text: "Yes, Sophie! I reviewed them and they look solid. I have a few suggestions for the navigation.",
        timestamp: "2026-06-30T15:00:00Z",
        read: true
      },
      {
        id: "m1_3",
        sender: "client",
        text: "Great! Let's hop on a call tomorrow at 10 AM to discuss. Does that work?",
        timestamp: "2026-06-30T15:15:00Z",
        read: true
      },
      {
        id: "m1_4",
        sender: "me",
        text: "Yes, that works perfectly. Talk tomorrow!",
        timestamp: "2026-06-30T15:30:00Z",
        read: true
      },
      {
        id: "m1_5",
        sender: "client",
        text: "Just sent over the meeting link. See you then!",
        timestamp: "2026-07-01T09:00:00Z",
        read: false
      }
    ]
  },
  {
    clientId: "2", // Chloe Anderson
    messages: [
      {
        id: "m2_1",
        sender: "client",
        text: "We need to temporarily pause the branding guidelines. Our budget is being re-evaluated.",
        timestamp: "2026-06-29T10:00:00Z",
        read: true
      },
      {
        id: "m2_2",
        sender: "me",
        text: "Understood, Chloe. Let's pause it here. Let me know when you're ready to resume.",
        timestamp: "2026-06-29T10:30:00Z",
        read: true
      },
      {
        id: "m2_3",
        sender: "client",
        text: "Thanks for understanding. I'll follow up next week.",
        timestamp: "2026-06-30T11:00:00Z",
        read: true
      }
    ]
  },
  {
    clientId: "3", // Isabella Hart
    messages: [
      {
        id: "m3_1",
        sender: "me",
        text: "Hi Isabella, the media deck designs are complete and ready for your review.",
        timestamp: "2026-06-28T16:00:00Z",
        read: true
      },
      {
        id: "m3_2",
        sender: "client",
        text: "Wow, these look fantastic! I love the dark theme.",
        timestamp: "2026-06-28T17:00:00Z",
        read: true
      },
      {
        id: "m3_3",
        sender: "client",
        text: "I've marked the contract milestones as completed on Upwork. Let's close this contract.",
        timestamp: "2026-06-28T17:05:00Z",
        read: true
      },
      {
        id: "m3_4",
        sender: "me",
        text: "Awesome! Thank you for the smooth project. Looking forward to working together again.",
        timestamp: "2026-06-29T09:00:00Z",
        read: true
      }
    ]
  },
  {
    clientId: "4", // Samuel Thompson
    messages: [
      {
        id: "m4_1",
        sender: "client",
        text: "Hi, when can we expect the summer campaign assets?",
        timestamp: "2026-06-30T18:00:00Z",
        read: true
      },
      {
        id: "m4_2",
        sender: "me",
        text: "Hi Samuel! I am finalizing the asset package. I'll send them over by noon today.",
        timestamp: "2026-07-01T08:30:00Z",
        read: true
      },
      {
        id: "m4_3",
        sender: "client",
        text: "Awesome, looking forward to it. We need them for the ad manager setup.",
        timestamp: "2026-07-01T09:15:00Z",
        read: true
      },
      {
        id: "m4_4",
        sender: "client",
        text: "Can you also make sure we have 1080x1080 resolution for Instagram?",
        timestamp: "2026-07-01T10:00:00Z",
        read: false
      }
    ]
  },
  {
    clientId: "6", // David Johnson
    messages: [
      {
        id: "m6_1",
        sender: "client",
        text: "Hi! We need a quick revision on the logo font. Can we try a sans-serif look?",
        timestamp: "2026-06-30T22:00:00Z",
        read: true
      },
      {
        id: "m6_2",
        sender: "me",
        text: "Sure, David. I will export a few options with a sans-serif typeface shortly.",
        timestamp: "2026-07-01T09:30:00Z",
        read: true
      },
      {
        id: "m6_3",
        sender: "client",
        text: "Excellent. Thanks for the quick response!",
        timestamp: "2026-07-01T09:45:00Z",
        read: true
      }
    ]
  },
  {
    clientId: "10", // Victoria Lane
    messages: [
      {
        id: "m10_1",
        sender: "client",
        text: "The branding proposal looks complete. Let's proceed with contract signature.",
        timestamp: "2026-06-28T11:00:00Z",
        read: true
      },
      {
        id: "m10_2",
        sender: "me",
        text: "Perfect, Victoria! I've sent the contract draft over. Let me know if you need any adjustments.",
        timestamp: "2026-06-28T11:30:00Z",
        read: true
      },
      {
        id: "m10_3",
        sender: "client",
        text: "Signed! Looking forward to kicking this off.",
        timestamp: "2026-06-29T14:00:00Z",
        read: true
      }
    ]
  }
];

export async function getThreads(): Promise<Thread[]> {
  // Simulate network latency and automatically resolve client references
  return new Promise((resolve) => {
    setTimeout(() => {
      const threadsWithClients = mockThreads.map((thread) => {
        const client = mockClients.find((c) => c.id === thread.clientId);
        return {
          ...thread,
          client
        };
      });
      resolve(threadsWithClients);
    }, 100);
  });
}
