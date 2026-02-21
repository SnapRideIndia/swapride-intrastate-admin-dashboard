import { useState, useMemo } from "react";
import { DriverRequest } from "../types";
import { useToast } from "@/hooks/use-toast";

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

export const useDriverRequests = () => {
  const [requests, setRequests] = useState<DriverRequest[]>(initialRequests);
  const { toast } = useToast();

  const approveRequest = (id: string) => {
    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status: "Approved" } : r)));
    toast({
      title: "Driver Approved",
      description: "The driver application has been approved. Notification sent.",
    });
  };

  const rejectRequest = (id: string) => {
    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status: "Rejected" } : r)));
    toast({
      title: "Driver Rejected",
      description: "The driver application has been rejected. Notification sent.",
      variant: "destructive",
    });
  };

  const stats = useMemo(() => {
    return {
      pending: requests.filter((r) => r.status === "Pending").length,
      approved: requests.filter((r) => r.status === "Approved").length,
      rejected: requests.filter((r) => r.status === "Rejected").length,
      total: requests.length,
    };
  }, [requests]);

  return {
    requests,
    approveRequest,
    rejectRequest,
    stats,
  };
};
