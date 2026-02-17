import { Link } from "react-router-dom";
import { AlertCircle, CheckCircle, Clock } from "lucide-react";
import { ROUTES } from "@/constants/routes";

const tickets = [
  {
    id: "TKT-001",
    subject: "Payment failed but seat allocated",
    passenger: "Priya Sharma",
    priority: "high",
    status: "open",
    time: "10 min ago",
  },
  {
    id: "TKT-002",
    subject: "Request for seat change",
    passenger: "Rajesh Gupta",
    priority: "medium",
    status: "in_progress",
    time: "25 min ago",
  },
  {
    id: "TKT-003",
    subject: "Refund request for cancelled trip",
    passenger: "Meera Patel",
    priority: "high",
    status: "open",
    time: "1 hour ago",
  },
  {
    id: "TKT-004",
    subject: "Bus delay complaint",
    passenger: "Arun Verma",
    priority: "low",
    status: "resolved",
    time: "2 hours ago",
  },
];

export function RecentTickets() {
  return (
    <div className="dashboard-card">
      <div className="p-5 border-b border-border flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Recent Support Tickets</h3>
          <p className="text-xs text-muted-foreground">Latest customer queries</p>
        </div>
        <Link to={ROUTES.SUPPORT} className="text-xs text-primary hover:underline font-medium">
          View all
        </Link>
      </div>
      <div className="divide-y divide-border">
        {tickets.map((ticket) => (
          <div key={ticket.id} className="p-4 hover:bg-muted/50 transition-colors">
            <div className="flex items-start gap-3">
              <div
                className={`mt-0.5 h-8 w-8 rounded-lg flex items-center justify-center ${
                  ticket.status === "open"
                    ? "bg-destructive-light"
                    : ticket.status === "in_progress"
                      ? "bg-warning-light"
                      : "bg-success-light"
                }`}
              >
                {ticket.status === "open" ? (
                  <AlertCircle className="h-4 w-4 text-destructive" />
                ) : ticket.status === "in_progress" ? (
                  <Clock className="h-4 w-4 text-warning" />
                ) : (
                  <CheckCircle className="h-4 w-4 text-success" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium text-foreground truncate">{ticket.subject}</p>
                    <p className="text-xs text-muted-foreground">{ticket.passenger}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span
                      className={
                        ticket.priority === "high"
                          ? "badge-error"
                          : ticket.priority === "medium"
                            ? "badge-warning"
                            : "badge-info"
                      }
                    >
                      {ticket.priority}
                    </span>
                    <p className="text-2xs text-muted-foreground mt-1">{ticket.time}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
