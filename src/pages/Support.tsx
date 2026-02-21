import { useState, useMemo, useEffect } from "react";
import { Plus, Search, MoreVertical, MessageSquare, CheckCircle, Clock, AlertCircle, Send, Phone } from "lucide-react";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TablePagination } from "@/components/ui/table-pagination";
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
import { useSupportTickets, useUpdateTicketStatus, useReplyTicket } from "@/features/support/hooks/useSupport";
import { Ticket } from "@/features/support/api/support.service";
import { FullPageLoader } from "@/components/ui/full-page-loader";

const Support = () => {
  const [searchQuery, setSearchQuery] = useState("");
  /* eslint-disable @typescript-eslint/no-unused-vars */
  const [activeTab, setActiveTab] = useState("all");
  /* eslint-enable @typescript-eslint/no-unused-vars */
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [replyMessage, setReplyMessage] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const { data: ticketsData, isLoading } = useSupportTickets({
    page: currentPage,
    limit: pageSize,
    q: searchQuery,
    status: activeTab !== "all" ? activeTab : undefined,
  });

  const tickets = ticketsData?.data || [];
  const totalCount = ticketsData?.total || 0;

  const updateStatusMutation = useUpdateTicketStatus();
  const replyMutation = useReplyTicket();

  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch =
      ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.passenger.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.id.toLowerCase().includes(searchQuery.toLowerCase());

    if (activeTab === "all") return matchesSearch;
    return matchesSearch && ticket.status === activeTab;
  });

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeTab]);

  const paginatedTickets = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return filteredTickets.slice(start, end);
  }, [filteredTickets, currentPage, pageSize]);

  const openCount = 0; // Stats need separate API or calculation from list
  const inProgressCount = 0;
  const resolvedCount = 0;

  const viewTicketDetails = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setDetailsOpen(true);
    setReplyMessage("");
  };

  const updateTicketStatus = (id: string, status: Ticket["status"]) => {
    updateStatusMutation.mutate({ id, status });
    if (selectedTicket) {
      setSelectedTicket({ ...selectedTicket, status });
    }
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
            {paginatedTickets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                  No support tickets found.
                </TableCell>
              </TableRow>
            ) : (
              paginatedTickets.map((ticket) => (
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
              ))
            )}
          </TableBody>
        </Table>

        <TablePagination
          currentPage={currentPage}
          totalCount={filteredTickets.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setCurrentPage(1);
          }}
        />
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
