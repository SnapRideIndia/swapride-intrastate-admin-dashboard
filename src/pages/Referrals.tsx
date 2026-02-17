import { useState } from "react";
import {
  Plus,
  Search,
  MoreVertical,
  Filter,
  Trash2,
  Calendar as CalendarIcon,
  CheckCircle2,
  Users,
  ArrowUpRight,
  Gift,
  Eye,
} from "lucide-react";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@\/components\/ui\/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Mock Data Types
type Referral = {
  id: string;
  referrerName: string;
  referrerEmail: string;
  refereeName: string;
  refereeEmail: string;
  status: "PENDING" | "COMPLETED" | "EXPIRED";
  rewardAmount: number;
  rewardStatus: "CLAIMED" | "UNCLAIMED" | "N/A";
  date: string;
};

const MOCK_REFERRALS: Referral[] = [
  {
    id: "1",
    referrerName: "Amit Sharma",
    referrerEmail: "amit@example.com",
    refereeName: "Sanjay Gupta",
    refereeEmail: "sanjay@gmail.com",
    status: "COMPLETED",
    rewardAmount: 50,
    rewardStatus: "CLAIMED",
    date: "2026-02-10",
  },
  {
    id: "2",
    referrerName: "Priya Das",
    referrerEmail: "priya@example.com",
    refereeName: "Rahul Verma",
    refereeEmail: "rahul.v@yahoo.com",
    status: "PENDING",
    rewardAmount: 50,
    rewardStatus: "UNCLAIMED",
    date: "2026-02-11",
  },
  {
    id: "3",
    referrerName: "Amit Sharma",
    referrerEmail: "amit@example.com",
    refereeName: "Vikram Singh",
    refereeEmail: "vik@hotmail.com",
    status: "EXPIRED",
    rewardAmount: 0,
    rewardStatus: "N/A",
    date: "2026-02-05",
  },
];

export default function Referrals() {
  const [referrals] = useState<Referral[]>(MOCK_REFERRALS);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredReferrals = referrals.filter((r) => {
    const matchesSearch =
      r.referrerName.toLowerCase().includes(search.toLowerCase()) ||
      r.refereeName.toLowerCase().includes(search.toLowerCase()) ||
      r.referrerEmail.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" ? true : r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-100 text-green-700";
      case "PENDING":
        return "bg-yellow-100 text-yellow-700";
      case "EXPIRED":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <PageHeader
          title="Referral Program"
          subtitle="Track and manage user referrals and reward distributions."
          actions={
            <div className="flex gap-2">
              <Button variant="outline" className="border-gray-200">
                <Gift className="h-4 w-4 mr-2 text-purple-600" /> Configure Rewards
              </Button>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" /> Manual Assignment
              </Button>
            </div>
          }
        />

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="dashboard-card border-none bg-gradient-to-br from-blue-50/50 to-white shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-blue-900">Total Referrals</p>
                <Users className="h-4 w-4 text-blue-600" />
              </div>
              <p className="text-3xl font-bold text-blue-950">{referrals.length}</p>
              <div className="mt-2 flex items-center text-xs text-blue-600 font-medium">
                <ArrowUpRight className="h-3 w-3 mr-1" /> 15% increase
              </div>
            </CardContent>
          </Card>

          <Card className="dashboard-card border-none bg-gradient-to-br from-green-50/50 to-white shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-green-900">Success Rate</p>
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              </div>
              <p className="text-3xl font-bold text-green-950">
                {Math.round((referrals.filter((r) => r.status === "COMPLETED").length / referrals.length) * 100)}%
              </p>
              <div className="mt-2 flex items-center text-xs text-green-600 font-medium">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500 mr-2" /> Healthy
              </div>
            </CardContent>
          </Card>

          <Card className="dashboard-card border-none bg-gradient-to-br from-yellow-50/50 to-white shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-yellow-900">Pending Actions</p>
                <CalendarIcon className="h-4 w-4 text-yellow-600" />
              </div>
              <p className="text-3xl font-bold text-yellow-950">
                {referrals.filter((r) => r.status === "PENDING").length}
              </p>
              <p className="mt-2 text-xs text-yellow-600 font-medium italic">Requires verification</p>
            </CardContent>
          </Card>

          <Card className="dashboard-card border-none bg-gradient-to-br from-purple-50/50 to-white shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-purple-900">Rewards Disbursed</p>
                <div className="h-4 w-4 rounded-full bg-purple-600 text-[10px] text-white flex items-center justify-center font-bold">
                  ₹
                </div>
              </div>
              <p className="text-3xl font-bold text-purple-950">
                ₹{referrals.reduce((sum, r) => sum + (r.rewardStatus === "CLAIMED" ? r.rewardAmount : 0), 0)}
              </p>
              <div className="mt-2 flex items-center text-xs text-purple-600 font-medium">
                <Gift className="h-3 w-3 mr-1" /> Budget: ₹5,000
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Content Tabs */}
        <Card className="dashboard-card border-gray-100 overflow-hidden shadow-sm">
          <div className="p-4 border-b border-gray-100 bg-gray-50/30 flex flex-col md:flex-row justify-between gap-4">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by referrer or referee..."
                className="pl-10 h-10 border-gray-200 focus:ring-blue-500 bg-white"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[160px] h-10 bg-white">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Everywhere</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="EXPIRED">Expired</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon" className="h-10 w-10 bg-white">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <Table>
            <TableHeader className="bg-gray-50/50">
              <TableRow>
                <TableHead>Referrer (Sender)</TableHead>
                <TableHead>Referee (Receiver)</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Reward</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReferrals.length > 0 ? (
                filteredReferrals.map((r) => (
                  <TableRow key={r.id} className="hover:bg-gray-50/30 transition-colors">
                    <TableCell>
                      <div className="space-y-0.5">
                        <div className="font-semibold text-gray-900">{r.referrerName}</div>
                        <div className="text-xs text-gray-500">{r.referrerEmail}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-0.5">
                        <div className="font-semibold text-gray-900">{r.refereeName}</div>
                        <div className="text-xs text-gray-500">{r.refereeEmail}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${getStatusBadge(r.status)} border-none shadow-none font-medium`}>
                        {r.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-bold text-gray-900">₹{r.rewardAmount}</div>
                        {r.rewardStatus !== "N/A" && (
                          <div
                            className={`text-[10px] font-bold ${r.rewardStatus === "CLAIMED" ? "text-green-600" : "text-orange-500"} uppercase`}
                          >
                            {r.rewardStatus}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-gray-600 font-medium">
                        {new Date(r.date).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 hover:bg-gray-100">
                            <MoreVertical className="h-4 w-4 text-gray-400" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[160px]">
                          <DropdownMenuItem className="cursor-pointer">
                            <Eye className="h-4 w-4 mr-2 text-blue-500" /> View History
                          </DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer">
                            <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" /> Approve
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="cursor-pointer text-red-500">
                            <Trash2 className="h-4 w-4 mr-2" /> Revoke
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-64 text-center">
                    <div className="flex flex-col items-center justify-center opacity-40">
                      <Users className="h-12 w-12 mb-2 text-gray-300" />
                      <p className="text-lg font-medium">No referral records found</p>
                      <Button
                        variant="link"
                        onClick={() => {
                          setSearch("");
                          setStatusFilter("all");
                        }}
                      >
                        Clear filters
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          <div className="p-4 border-t border-gray-100 bg-gray-50/20 text-xs text-gray-500 text-center">
            Showing {filteredReferrals.length} of {referrals.length} referral records
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
