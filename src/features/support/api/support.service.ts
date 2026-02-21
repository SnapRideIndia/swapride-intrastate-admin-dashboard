export interface TicketMessage {
  sender: string;
  message: string;
  time: string;
}

export interface Ticket {
  id: string;
  subject: string;
  passenger: string;
  phone: string;
  email: string;
  category: string;
  priority: "high" | "medium" | "low";
  status: "open" | "in_progress" | "resolved";
  createdAt: string;
  lastUpdated: string;
  description: string;
  messages: TicketMessage[];
}

// Mock Data
let MOCK_TICKETS: Ticket[] = [
  {
    id: "TKT-001",
    subject: "Payment failed but seat allocated",
    passenger: "Priya Sharma",
    phone: "+91 98765 43210",
    email: "priya.sharma@email.com",
    category: "Payment",
    priority: "high",
    status: "open",
    createdAt: "2024-01-21 09:30 AM",
    lastUpdated: "10 min ago",
    description: "I made a payment of ₹150 for seat 12A but it shows pending. However, the seat is allocated to me.",
    messages: [
      {
        sender: "Priya Sharma",
        message: "I made a payment of ₹150 for seat 12A but it shows pending. However, the seat is allocated to me.",
        time: "09:30 AM",
      },
      {
        sender: "Support",
        message: "We are looking into this issue. Can you please share the transaction ID?",
        time: "09:45 AM",
      },
    ],
  },
  {
    id: "TKT-002",
    subject: "Request for seat change",
    passenger: "Rajesh Gupta",
    phone: "+91 87654 32109",
    email: "rajesh.g@email.com",
    category: "Booking",
    priority: "medium",
    status: "in_progress",
    createdAt: "2024-01-21 08:45 AM",
    lastUpdated: "25 min ago",
    description: "I want to change my seat from 8B to 8A for tomorrow's trip.",
    messages: [
      {
        sender: "Rajesh Gupta",
        message: "I want to change my seat from 8B to 8A for tomorrow's trip.",
        time: "08:45 AM",
      },
    ],
  },
  {
    id: "TKT-003",
    subject: "Refund request for cancelled trip",
    passenger: "Meera Patel",
    phone: "+91 76543 21098",
    email: "meera.p@email.com",
    category: "Refund",
    priority: "high",
    status: "open",
    createdAt: "2024-01-21 07:15 AM",
    lastUpdated: "1 hour ago",
    description: "The morning trip was cancelled due to bus breakdown. I need a full refund for my ticket.",
    messages: [],
  },
  {
    id: "TKT-004",
    subject: "Bus delay complaint",
    passenger: "Arun Verma",
    phone: "+91 65432 10987",
    email: "arun.v@email.com",
    category: "Complaint",
    priority: "low",
    status: "resolved",
    createdAt: "2024-01-20 06:00 PM",
    lastUpdated: "2 hours ago",
    description: "The bus was 30 minutes late yesterday. This caused me to miss an important meeting.",
    messages: [],
  },
  {
    id: "TKT-005",
    subject: "Unable to book seat",
    passenger: "Kavitha Reddy",
    phone: "+91 54321 09876",
    email: "kavitha.r@email.com",
    category: "Booking",
    priority: "medium",
    status: "in_progress",
    createdAt: "2024-01-20 04:30 PM",
    lastUpdated: "3 hours ago",
    description: "Getting error while trying to book a seat for the evening shuttle.",
    messages: [],
  },
];

export const supportService = {
  getAll: async (params?: {
    page: number;
    limit: number;
    q?: string;
    status?: string;
  }): Promise<{ data: Ticket[]; total: number }> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    let filtered = [...MOCK_TICKETS];

    if (params?.status && params.status !== "all") {
      filtered = filtered.filter((t) => t.status === params.status);
    }

    if (params?.q) {
      const q = params.q.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.subject.toLowerCase().includes(q) ||
          t.passenger.toLowerCase().includes(q) ||
          t.id.toLowerCase().includes(q),
      );
    }

    const start = ((params?.page || 1) - 1) * (params?.limit || 20);
    const end = start + (params?.limit || 20);

    return {
      data: filtered.slice(start, end),
      total: filtered.length,
    };
  },

  getById: async (id: string): Promise<Ticket> => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const ticket = MOCK_TICKETS.find((t) => t.id === id);
    if (!ticket) throw new Error("Ticket not found");
    return ticket;
  },

  updateStatus: async (id: string, status: Ticket["status"]): Promise<Ticket> => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const ticketIndex = MOCK_TICKETS.findIndex((t) => t.id === id);
    if (ticketIndex === -1) throw new Error("Ticket not found");

    MOCK_TICKETS[ticketIndex] = {
      ...MOCK_TICKETS[ticketIndex],
      status,
      lastUpdated: "Just now",
    };

    return MOCK_TICKETS[ticketIndex];
  },

  reply: async (id: string, message: string): Promise<Ticket> => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const ticketIndex = MOCK_TICKETS.findIndex((t) => t.id === id);
    if (ticketIndex === -1) throw new Error("Ticket not found");

    const newMessage: TicketMessage = {
      sender: "Support",
      message,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    MOCK_TICKETS[ticketIndex] = {
      ...MOCK_TICKETS[ticketIndex],
      messages: [...MOCK_TICKETS[ticketIndex].messages, newMessage],
      lastUpdated: "Just now",
    };

    return MOCK_TICKETS[ticketIndex];
  },
};
