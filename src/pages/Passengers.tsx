import { useState } from "react";
import { Plus, Search, MoreVertical, Edit, Trash2, Eye, Phone, Mail } from "lucide-react";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const passengers = [
  {
    id: "PSG-001",
    name: "Priya Sharma",
    phone: "+91 98765 43210",
    email: "priya.sharma@email.com",
    route: "Mehboobnagar → Hyderabad",
    seatType: "Monthly Pass",
    totalTrips: 45,
    pendingAmount: 0,
    status: "Active",
  },
  {
    id: "PSG-002",
    name: "Rajesh Gupta",
    phone: "+91 87654 32109",
    email: "rajesh.g@email.com",
    route: "Mehboobnagar → Hyderabad",
    seatType: "Daily",
    totalTrips: 12,
    pendingAmount: 150,
    status: "Active",
  },
  {
    id: "PSG-003",
    name: "Meera Patel",
    phone: "+91 76543 21098",
    email: "meera.p@email.com",
    route: "Hyderabad → Mehboobnagar",
    seatType: "Monthly Pass",
    totalTrips: 38,
    pendingAmount: 0,
    status: "Active",
  },
  {
    id: "PSG-004",
    name: "Arun Verma",
    phone: "+91 65432 10987",
    email: "arun.v@email.com",
    route: "Suburban Express",
    seatType: "Weekly",
    totalTrips: 8,
    pendingAmount: 500,
    status: "Pending",
  },
  {
    id: "PSG-005",
    name: "Kavitha Reddy",
    phone: "+91 54321 09876",
    email: "kavitha.r@email.com",
    route: "Mehboobnagar → Hyderabad",
    seatType: "Monthly Pass",
    totalTrips: 52,
    pendingAmount: 0,
    status: "Active",
  },
];

const Passengers = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPassengers = passengers.filter(
    (passenger) =>
      passenger.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      passenger.phone.includes(searchQuery) ||
      passenger.email.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <DashboardLayout>
      <PageHeader
        title="Passenger Management"
        subtitle={`Manage ${passengers.length} registered passengers`}
        actions={
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Passenger
          </Button>
        }
      />

      {/* Filters */}
      <div className="dashboard-card p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, phone, or email..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              All Routes
            </Button>
            <Button variant="outline" size="sm">
              All Status
            </Button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Passenger</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Route</TableHead>
              <TableHead>Seat Type</TableHead>
              <TableHead>Total Trips</TableHead>
              <TableHead>Pending Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPassengers.map((passenger) => (
              <TableRow key={passenger.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                      <span className="text-xs font-medium text-primary">
                        {passenger.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium">{passenger.name}</p>
                      <p className="text-xs text-muted-foreground">{passenger.id}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-xs">
                      <Phone className="h-3 w-3 text-muted-foreground" />
                      {passenger.phone}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Mail className="h-3 w-3" />
                      {passenger.email}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="max-w-[150px] truncate">{passenger.route}</TableCell>
                <TableCell>
                  <span
                    className={
                      passenger.seatType === "Monthly Pass"
                        ? "badge-success"
                        : passenger.seatType === "Weekly"
                          ? "badge-info"
                          : "badge-warning"
                    }
                  >
                    {passenger.seatType}
                  </span>
                </TableCell>
                <TableCell>{passenger.totalTrips}</TableCell>
                <TableCell>
                  <span className={passenger.pendingAmount > 0 ? "text-destructive font-medium" : "text-success"}>
                    ₹{passenger.pendingAmount}
                  </span>
                </TableCell>
                <TableCell>
                  <span className={passenger.status === "Active" ? "badge-success" : "badge-warning"}>
                    {passenger.status}
                  </span>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Eye className="h-4 w-4 mr-2" />
                        View Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </DashboardLayout>
  );
};

export default Passengers;
