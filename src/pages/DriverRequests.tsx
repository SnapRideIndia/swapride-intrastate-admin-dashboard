import { useState } from "react";
import { Search, MoreVertical, Eye, CheckCircle, XCircle, FileText, Phone, Mail, Calendar, Bus } from "lucide-react";
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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface DriverRequest {
  id: string;
  name: string;
  phone: string;
  email: string;
  licenseNumber: string;
  licenseExpiry: string;
  experience: string;
  busDetails: {
    registrationNumber: string;
    make: string;
    model: string;
    capacity: number;
    yearOfManufacture: number;
  };
  documents: string[];
  status: "Pending" | "Approved" | "Rejected";
  appliedDate: string;
  notes?: string;
}

const initialRequests: DriverRequest[] = [
  {
    id: "REQ-001",
    name: "Suresh Kumar",
    phone: "+91 98765 43210",
    email: "suresh.kumar@email.com",
    licenseNumber: "TS-DL-2020-123456",
    licenseExpiry: "2027-05-15",
    experience: "8 years",
    busDetails: {
      registrationNumber: "TS07-4321",
      make: "Ashok Leyland",
      model: "Viking BS6",
      capacity: 48,
      yearOfManufacture: 2022,
    },
    documents: ["License", "Insurance", "RC Book", "Fitness Certificate"],
    status: "Pending",
    appliedDate: "2024-01-18",
  },
  {
    id: "REQ-002",
    name: "Ravi Shankar",
    phone: "+91 87654 32109",
    email: "ravi.shankar@email.com",
    licenseNumber: "TS-DL-2019-654321",
    licenseExpiry: "2026-08-20",
    experience: "10 years",
    busDetails: {
      registrationNumber: "TS07-8765",
      make: "Tata",
      model: "Starbus Ultra",
      capacity: 52,
      yearOfManufacture: 2021,
    },
    documents: ["License", "Insurance", "RC Book"],
    status: "Pending",
    appliedDate: "2024-01-17",
  },
  {
    id: "REQ-003",
    name: "Prakash Reddy",
    phone: "+91 76543 21098",
    email: "prakash.r@email.com",
    licenseNumber: "TS-DL-2018-789012",
    licenseExpiry: "2025-12-10",
    experience: "12 years",
    busDetails: {
      registrationNumber: "TS07-5432",
      make: "Eicher",
      model: "Skyline Pro",
      capacity: 45,
      yearOfManufacture: 2023,
    },
    documents: ["License", "Insurance", "RC Book", "Fitness Certificate", "PUC"],
    status: "Approved",
    appliedDate: "2024-01-10",
  },
  {
    id: "REQ-004",
    name: "Mahesh Babu",
    phone: "+91 65432 10987",
    email: "mahesh.b@email.com",
    licenseNumber: "TS-DL-2021-456789",
    licenseExpiry: "2024-03-25",
    experience: "5 years",
    busDetails: {
      registrationNumber: "TS07-9876",
      make: "Ashok Leyland",
      model: "Viking BS6",
      capacity: 50,
      yearOfManufacture: 2020,
    },
    documents: ["License", "RC Book"],
    status: "Rejected",
    appliedDate: "2024-01-08",
    notes: "License expiring soon, incomplete documents",
  },
];

const DriverRequests = () => {
  const [requests, setRequests] = useState(initialRequests);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRequest, setSelectedRequest] = useState<DriverRequest | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("pending");

  const getStatusBadge = (status: DriverRequest["status"]) => {
    switch (status) {
      case "Pending":
        return "badge-warning";
      case "Approved":
        return "badge-success";
      case "Rejected":
        return "badge-error";
    }
  };

  const filteredRequests = requests.filter((request) => {
    const matchesSearch =
      request.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.busDetails.registrationNumber.toLowerCase().includes(searchQuery.toLowerCase());

    if (activeTab === "all") return matchesSearch;
    return matchesSearch && request.status.toLowerCase() === activeTab;
  });

  const handleApprove = (id: string) => {
    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status: "Approved" as const } : r)));
    toast({
      title: "Driver Approved",
      description: "The driver application has been approved. Notification sent.",
    });
    setDetailsOpen(false);
  };

  const handleReject = (id: string) => {
    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status: "Rejected" as const } : r)));
    toast({
      title: "Driver Rejected",
      description: "The driver application has been rejected. Notification sent.",
      variant: "destructive",
    });
    setDetailsOpen(false);
  };

  const viewDetails = (request: DriverRequest) => {
    setSelectedRequest(request);
    setDetailsOpen(true);
  };

  const pendingCount = requests.filter((r) => r.status === "Pending").length;
  const approvedCount = requests.filter((r) => r.status === "Approved").length;
  const rejectedCount = requests.filter((r) => r.status === "Rejected").length;

  return (
    <DashboardLayout>
      <PageHeader
        title="Driver Requests"
        subtitle={`Review and manage driver applications (${pendingCount} pending)`}
      />

      {/* Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="dashboard-card p-4 flex items-center gap-4">
          <div className="p-3 rounded-full bg-warning/10">
            <Calendar className="h-5 w-5 text-warning" />
          </div>
          <div>
            <p className="text-2xl font-semibold">{pendingCount}</p>
            <p className="text-sm text-muted-foreground">Pending Review</p>
          </div>
        </div>
        <div className="dashboard-card p-4 flex items-center gap-4">
          <div className="p-3 rounded-full bg-success/10">
            <CheckCircle className="h-5 w-5 text-success" />
          </div>
          <div>
            <p className="text-2xl font-semibold">{approvedCount}</p>
            <p className="text-sm text-muted-foreground">Approved</p>
          </div>
        </div>
        <div className="dashboard-card p-4 flex items-center gap-4">
          <div className="p-3 rounded-full bg-destructive/10">
            <XCircle className="h-5 w-5 text-destructive" />
          </div>
          <div>
            <p className="text-2xl font-semibold">{rejectedCount}</p>
            <p className="text-sm text-muted-foreground">Rejected</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="dashboard-card p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
            <TabsList>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="approved">Approved</TabsTrigger>
              <TabsTrigger value="rejected">Rejected</TabsTrigger>
              <TabsTrigger value="all">All</TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or bus..."
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
              <TableHead>Request ID</TableHead>
              <TableHead>Driver Name</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Bus Details</TableHead>
              <TableHead>Experience</TableHead>
              <TableHead>Applied Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRequests.map((request) => (
              <TableRow key={request.id}>
                <TableCell className="font-medium">{request.id}</TableCell>
                <TableCell>{request.name}</TableCell>
                <TableCell>
                  <div className="text-sm">
                    <p>{request.phone}</p>
                    <p className="text-muted-foreground text-xs">{request.email}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    <p className="font-medium">{request.busDetails.registrationNumber}</p>
                    <p className="text-muted-foreground text-xs">
                      {request.busDetails.make} {request.busDetails.model}
                    </p>
                  </div>
                </TableCell>
                <TableCell>{request.experience}</TableCell>
                <TableCell>{request.appliedDate}</TableCell>
                <TableCell>
                  <span className={getStatusBadge(request.status)}>{request.status}</span>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => viewDetails(request)}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      {request.status === "Pending" && (
                        <>
                          <DropdownMenuItem onClick={() => handleApprove(request.id)} className="text-success">
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Approve
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleReject(request.id)} className="text-destructive">
                            <XCircle className="h-4 w-4 mr-2" />
                            Reject
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Driver Application Details</DialogTitle>
            <DialogDescription>Review the driver and bus information before making a decision.</DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-6">
              {/* Driver Info */}
              <div>
                <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary"></span>
                  Driver Information
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Full Name</p>
                    <p className="font-medium">{selectedRequest.name}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Experience</p>
                    <p className="font-medium">{selectedRequest.experience}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <p>{selectedRequest.phone}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <p>{selectedRequest.email}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">License Number</p>
                    <p className="font-medium">{selectedRequest.licenseNumber}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">License Expiry</p>
                    <p className="font-medium">{selectedRequest.licenseExpiry}</p>
                  </div>
                </div>
              </div>

              {/* Bus Info */}
              <div>
                <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <Bus className="h-4 w-4 text-primary" />
                  Bus Information
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Registration</p>
                    <p className="font-medium">{selectedRequest.busDetails.registrationNumber}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Make & Model</p>
                    <p className="font-medium">
                      {selectedRequest.busDetails.make} {selectedRequest.busDetails.model}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Seating Capacity</p>
                    <p className="font-medium">{selectedRequest.busDetails.capacity} seats</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Year of Manufacture</p>
                    <p className="font-medium">{selectedRequest.busDetails.yearOfManufacture}</p>
                  </div>
                </div>
              </div>

              {/* Documents */}
              <div>
                <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  Submitted Documents
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedRequest.documents.map((doc) => (
                    <Badge key={doc} variant="secondary" className="cursor-pointer hover:bg-secondary/80">
                      {doc}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Status & Notes */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div>
                  <p className="text-sm text-muted-foreground">Current Status</p>
                  <span className={cn("mt-1 inline-block", getStatusBadge(selectedRequest.status))}>
                    {selectedRequest.status}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Applied On</p>
                  <p className="font-medium">{selectedRequest.appliedDate}</p>
                </div>
              </div>

              {selectedRequest.notes && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                  <p className="text-sm font-medium text-destructive">Rejection Reason:</p>
                  <p className="text-sm text-muted-foreground">{selectedRequest.notes}</p>
                </div>
              )}

              {/* Actions */}
              {selectedRequest.status === "Pending" && (
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => handleReject(selectedRequest.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject Application
                  </Button>
                  <Button onClick={() => handleApprove(selectedRequest.id)}>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve Application
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default DriverRequests;
