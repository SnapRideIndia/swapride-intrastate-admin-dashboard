import { useState } from "react";
import { Plus, Search, MoreVertical, MessageSquare, CheckCircle, Clock, AlertCircle, Send, Phone } from "lucide-react";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { StatCard } from "@/features/analytics";

interface Ticket {
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
  messages: { sender: string; message: string; time: string }[];
}

const initialTickets: Ticket[] = [
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

const Support = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [tickets, setTickets] = useState<Ticket[]>(initialTickets);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [replyMessage, setReplyMessage] = useState("");

  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch =
      ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.passenger.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.id.toLowerCase().includes(searchQuery.toLowerCase());

    if (activeTab === "all") return matchesSearch;
    return matchesSearch && ticket.status === activeTab;
  });

  const openCount = tickets.filter((t) => t.status === "open").length;
  const inProgressCount = tickets.filter((t) => t.status === "in_progress").length;
  const resolvedCount = tickets.filter((t) => t.status === "resolved").length;

  const viewTicketDetails = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setDetailsOpen(true);
    setReplyMessage("");
  };

  const updateTicketStatus = (id: string, status: Ticket["status"]) => {
    setTickets((prev) => prev.map((t) => (t.id === id ? { ...t, status, lastUpdated: "Just now" } : t)));
    if (selectedTicket?.id === id) {
      setSelectedTicket((prev) => (prev ? { ...prev, status, lastUpdated: "Just now" } : null));
    }
    toast({
      title: "Status Updated",
      description: `Ticket marked as ${status === "in_progress" ? "In Progress" : status === "resolved" ? "Resolved" : "Open"}`,
    });
  };

  const sendReply = () => {
    if (!replyMessage.trim() || !selectedTicket) return;

    const newMessage = {
      sender: "Support",
      message: replyMessage,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setTickets((prev) =>
      prev.map((t) =>
        t.id === selectedTicket.id ? { ...t, messages: [...t.messages, newMessage], lastUpdated: "Just now" } : t,
      ),
    );
    setSelectedTicket((prev) =>
      prev ? { ...prev, messages: [...prev.messages, newMessage], lastUpdated: "Just now" } : null,
    );
    setReplyMessage("");
    toast({ title: "Reply Sent", description: "Your response has been sent to the passenger." });
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="Customer Support"
        subtitle="Manage support tickets and queries"
        actions={
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Ticket
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard
          title="Open Tickets"
          value={openCount}
          icon={AlertCircle}
          iconColor="text-destructive"
          vibrant={true}
        />
        <StatCard title="In Progress" value={inProgressCount} icon={Clock} iconColor="text-warning" vibrant={true} />
        <StatCard
          title="Resolved Today"
          value={resolvedCount}
          icon={CheckCircle}
          iconColor="text-success"
          vibrant={true}
        />
      </div>

      {/* Filters */}
      <div className="dashboard-card p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="all">All ({tickets.length})</TabsTrigger>
              <TabsTrigger value="open">Open ({openCount})</TabsTrigger>
              <TabsTrigger value="in_progress">In Progress ({inProgressCount})</TabsTrigger>
              <TabsTrigger value="resolved">Resolved ({resolvedCount})</TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tickets..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ticket</TableHead>
              <TableHead>Passenger</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTickets.map((ticket) => (
              <TableRow
                key={ticket.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => viewTicketDetails(ticket)}
              >
                <TableCell>
                  <div>
                    <p className="text-sm font-medium">{ticket.id}</p>
                    <p className="text-xs text-muted-foreground truncate max-w-[200px]">{ticket.subject}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <p className="text-sm font-medium">{ticket.passenger}</p>
                    <p className="text-xs text-muted-foreground">{ticket.phone}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{ticket.category}</Badge>
                </TableCell>
                <TableCell>
                  <span
                    className={cn(
                      "badge",
                      ticket.priority === "high" && "badge-error",
                      ticket.priority === "medium" && "badge-warning",
                      ticket.priority === "low" && "badge-info",
                    )}
                  >
                    {ticket.priority}
                  </span>
                </TableCell>
                <TableCell>
                  <span
                    className={cn(
                      "badge",
                      ticket.status === "open" && "badge-error",
                      ticket.status === "in_progress" && "badge-warning",
                      ticket.status === "resolved" && "badge-success",
                    )}
                  >
                    {ticket.status === "in_progress" ? "In Progress" : ticket.status}
                  </span>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">{ticket.createdAt}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{ticket.lastUpdated}</TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => viewTicketDetails(ticket)}>
                        <MessageSquare className="h-4 w-4 mr-2" />
                        View & Reply
                      </DropdownMenuItem>
                      {ticket.status !== "in_progress" && (
                        <DropdownMenuItem onClick={() => updateTicketStatus(ticket.id, "in_progress")}>
                          <Clock className="h-4 w-4 mr-2" />
                          Mark In Progress
                        </DropdownMenuItem>
                      )}
                      {ticket.status !== "resolved" && (
                        <DropdownMenuItem onClick={() => updateTicketStatus(ticket.id, "resolved")}>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Mark Resolved
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Ticket Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedTicket?.id} - {selectedTicket?.subject}
            </DialogTitle>
            <DialogDescription>Ticket from {selectedTicket?.passenger}</DialogDescription>
          </DialogHeader>

          {selectedTicket && (
            <div className="space-y-4">
              {/* Passenger Info */}
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                <div>
                  <p className="font-medium">{selectedTicket.passenger}</p>
                  <p className="text-sm text-muted-foreground">{selectedTicket.email}</p>
                </div>
                <Button variant="outline" size="sm">
                  <Phone className="h-4 w-4 mr-2" />
                  {selectedTicket.phone}
                </Button>
              </div>

              {/* Ticket Info */}
              <div className="grid grid-cols-3 gap-4">
                <div className="p-3 rounded-lg border">
                  <p className="text-xs text-muted-foreground">Category</p>
                  <Badge variant="outline" className="mt-1">
                    {selectedTicket.category}
                  </Badge>
                </div>
                <div className="p-3 rounded-lg border">
                  <p className="text-xs text-muted-foreground">Priority</p>
                  <span
                    className={cn(
                      "badge mt-1",
                      selectedTicket.priority === "high" && "badge-error",
                      selectedTicket.priority === "medium" && "badge-warning",
                      selectedTicket.priority === "low" && "badge-info",
                    )}
                  >
                    {selectedTicket.priority}
                  </span>
                </div>
                <div className="p-3 rounded-lg border">
                  <p className="text-xs text-muted-foreground">Status</p>
                  <span
                    className={cn(
                      "badge mt-1",
                      selectedTicket.status === "open" && "badge-error",
                      selectedTicket.status === "in_progress" && "badge-warning",
                      selectedTicket.status === "resolved" && "badge-success",
                    )}
                  >
                    {selectedTicket.status === "in_progress" ? "In Progress" : selectedTicket.status}
                  </span>
                </div>
              </div>

              {/* Description */}
              <div className="p-4 rounded-lg border">
                <p className="text-xs text-muted-foreground mb-2">Description</p>
                <p className="text-sm">{selectedTicket.description}</p>
              </div>

              {/* Conversation */}
              <div className="border rounded-lg">
                <div className="p-3 border-b bg-muted/50">
                  <p className="text-sm font-medium">Conversation</p>
                </div>
                <div className="p-4 max-h-[200px] overflow-y-auto space-y-3">
                  {selectedTicket.messages.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">No messages yet</p>
                  ) : (
                    selectedTicket.messages.map((msg, index) => (
                      <div
                        key={index}
                        className={cn(
                          "p-3 rounded-lg max-w-[80%]",
                          msg.sender === "Support" ? "bg-primary/10 ml-auto" : "bg-muted",
                        )}
                      >
                        <p className="text-xs text-muted-foreground mb-1">
                          {msg.sender} • {msg.time}
                        </p>
                        <p className="text-sm">{msg.message}</p>
                      </div>
                    ))
                  )}
                </div>
                <div className="p-3 border-t flex gap-2">
                  <Textarea
                    placeholder="Type your reply..."
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    className="min-h-[60px]"
                  />
                  <Button onClick={sendReply} disabled={!replyMessage.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-4 border-t">
                {selectedTicket.status !== "in_progress" && (
                  <Button variant="outline" onClick={() => updateTicketStatus(selectedTicket.id, "in_progress")}>
                    <Clock className="h-4 w-4 mr-2" />
                    Mark In Progress
                  </Button>
                )}
                {selectedTicket.status !== "resolved" && (
                  <Button onClick={() => updateTicketStatus(selectedTicket.id, "resolved")}>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mark Resolved
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Support;
