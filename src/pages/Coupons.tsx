import { useNavigate, useSearchParams } from "react-router-dom";
import { useDebounce } from "@/hooks/useDebounce";
import {
  Plus,
  Search,
  Tag,
  MoreHorizontal,
  Edit,
  Trash2,
  ToggleLeft,
  ToggleRight,
  CheckCircle2,
  Ticket,
  X,
} from "lucide-react";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCoupons, useUpdateCoupon, useDeleteCoupon } from "@/features/coupons/hooks/useCoupons";
import { Coupon } from "@/features/coupons/api/coupon.service";
import { toast } from "@/components/ui/sonner";
import { FullPageLoader } from "@/components/ui/full-page-loader";
import { ROUTES } from "@/constants/routes";
import { TablePagination } from "@/components/ui/table-pagination";

export default function Coupons() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Filters from URL
  const search = searchParams.get("q") || "";
  const statusFilter = searchParams.get("status") || "all";
  const typeFilter = searchParams.get("type") || "all";
  const currentPage = Number(searchParams.get("page")) || 1;
  const pageSize = Number(searchParams.get("limit")) || 20;

  const debouncedSearch = useDebounce(search, 500);

  // Fetch Coupons (Server-side)
  const { data: couponsData, isLoading: isCouponsLoading } = useCoupons({
    page: currentPage,
    limit: pageSize,
    search: debouncedSearch,
    status: statusFilter,
    type: typeFilter,
  });

  const coupons = couponsData?.data || [];
  const totalCount = couponsData?.total || 0;

  // Mutations
  const updateMutation = useUpdateCoupon();
  const deleteMutation = useDeleteCoupon();

  const updateFilters = (updates: Record<string, string | number | null>) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === "all" || value === "" || (key === "page" && value === 1)) {
        newParams.delete(key);
      } else {
        newParams.set(key, String(value));
      }
    });

    // Reset page if filters change (except when page itself is being changed)
    if (!updates.page) {
      newParams.delete("page");
    }

    setSearchParams(newParams, { replace: true });
  };

  const handleToggleActive = (coupon: Coupon) => {
    updateMutation.mutate({
      id: coupon.id,
      data: { isActive: !coupon.isActive },
    });
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this coupon?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleEdit = (id: string) => {
    navigate(ROUTES.COUPON_EDIT.replace(":id", id));
  };

  const isAnyLoading = isCouponsLoading || updateMutation.isPending || deleteMutation.isPending;

  return (
    <DashboardLayout>
      <FullPageLoader show={isAnyLoading} label={isCouponsLoading ? "Loading Data..." : "Processing..."} />
      <div className="space-y-6">
        {/* Header */}
        <PageHeader
          title="Coupons"
          subtitle="Manage discount codes and promotional offers for your passengers."
          actions={
            <Button
              onClick={() => navigate(ROUTES.COUPON_CREATE)}
              className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200"
            >
              <Plus className="h-4 w-4 mr-2" /> Create Coupon
            </Button>
          }
        />

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-none shadow-sm bg-gradient-to-br from-blue-50 to-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-900">Active Coupons</CardTitle>
              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                <Tag className="h-4 w-4 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-950">{coupons.filter((c) => c.isActive).length}</div>
              <p className="text-xs text-blue-600/80 mt-1 font-medium flex items-center">
                <CheckCircle2 className="h-3 w-3 mr-1" /> Campaign status updated
              </p>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm bg-gradient-to-br from-green-50 to-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-900">Total Redemptions</CardTitle>
              <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-950">
                {coupons.reduce((acc, curr) => acc + (curr.usedCount || 0), 0)}
              </div>
              <p className="text-xs text-green-600/80 mt-1 font-medium flex items-center">
                <CheckCircle2 className="h-3 w-3 mr-1" /> Synced from history
              </p>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm bg-gradient-to-br from-purple-50 to-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-900">Auto-Apply Offers</CardTitle>
              <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center font-bold text-purple-600">
                <Ticket className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-950">{coupons.filter((c) => c.isAutoApply).length}</div>
              <p className="text-xs text-purple-600/80 mt-1 font-medium flex items-center">
                <Tag className="h-3 w-3 mr-1" /> Dynamic journey rules
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Actions */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by code or description..."
                className="pl-10 h-10 border-gray-200 focus:ring-blue-500 rounded-lg"
                value={search}
                onChange={(e) => updateFilters({ q: e.target.value })}
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <Select value={statusFilter} onValueChange={(val) => updateFilters({ status: val })}>
                <SelectTrigger className="w-full md:w-[130px] h-10 border-gray-200 rounded-lg">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>

              <Select value={typeFilter} onValueChange={(val) => updateFilters({ type: val })}>
                <SelectTrigger className="w-full md:w-[150px] h-10 border-gray-200 rounded-lg">
                  <SelectValue placeholder="Discount Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="PERCENTAGE">Percentage</SelectItem>
                  <SelectItem value="FLAT">Flat Amount</SelectItem>
                  <SelectItem value="FIXED_PRICE">Fixed Price</SelectItem>
                </SelectContent>
              </Select>

              {(search || statusFilter !== "all" || typeFilter !== "all") && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearchParams({})}
                  className="text-gray-500 hover:text-red-500 h-10 px-3"
                >
                  <X className="h-4 w-4 mr-1" /> Reset
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden translate-y-0 transition-all hover:shadow-md">
          <Table>
            <TableHeader className="bg-gray-50/50">
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[300px]">Coupon Details</TableHead>
                <TableHead>Discount Structure</TableHead>
                <TableHead>Validity Period</TableHead>
                <TableHead>Usage Stats</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Manage</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {coupons.length > 0 ? (
                coupons.map((coupon) => (
                  <TableRow
                    key={coupon.id}
                    className="group hover:bg-gray-50/50 transition-colors cursor-pointer"
                    onClick={() => handleEdit(coupon.id)}
                  >
                    <TableCell>
                      <div className="flex items-start gap-3">
                        <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                          <Ticket className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="space-y-0.5">
                          <div className="font-bold text-gray-900 group-hover:text-blue-700 transition-colors flex items-center gap-2">
                            {coupon.code}
                            {coupon.isAutoApply && (
                              <Badge className="bg-blue-100 text-blue-600 hover:bg-blue-100 border-none text-[8px] h-4 px-1 uppercase letter-spacing-wide">
                                Auto
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-gray-500 line-clamp-1 max-w-[180px]" title={coupon.description}>
                            {coupon.description}
                          </div>
                          <div className="flex gap-2">
                            {coupon.isPublic ? (
                              <Badge
                                variant="secondary"
                                className="bg-blue-50 text-blue-600 hover:bg-blue-100 border-none text-[10px] px-1.5 py-0 h-4"
                              >
                                Public
                              </Badge>
                            ) : (
                              <Badge
                                variant="secondary"
                                className="bg-gray-50 text-gray-500 hover:bg-gray-100 border-none text-[10px] px-1.5 py-0 h-4"
                              >
                                Private
                              </Badge>
                            )}
                            {coupon.targetRoutes && coupon.targetRoutes.length > 0 && (
                              <Badge
                                variant="secondary"
                                className="bg-orange-50 text-orange-600 hover:Orange-100 border-none text-[10px] px-1.5 py-0 h-4"
                              >
                                Targeted
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-semibold text-gray-800">
                          {coupon.discountType === "PERCENTAGE" && `${coupon.discountValue}% Off`}
                          {coupon.discountType === "FLAT" && `₹${coupon.discountValue} Flat`}
                          {coupon.discountType === "FIXED_PRICE" && `Ride @ ₹${coupon.discountValue}`}
                        </div>
                        <div className="flex flex-col text-[11px] text-gray-500 gap-0.5">
                          {coupon.maxDiscount && <span>• Up to ₹{coupon.maxDiscount}</span>}
                          {coupon.minOrderValue > 0 && <span>• Min Order ₹{coupon.minOrderValue}</span>}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center text-xs text-gray-600">
                          <div className="h-1.5 w-1.5 rounded-full bg-green-500 mr-2" />
                          <span className="font-medium mr-1">Start:</span>{" "}
                          {new Date(coupon.startDate).toLocaleDateString()}
                        </div>
                        <div className="flex items-center text-xs text-gray-600">
                          <div className="h-1.5 w-1.5 rounded-full bg-red-500 mr-2" />
                          <span className="font-medium mr-1">End:</span> {new Date(coupon.endDate).toLocaleDateString()}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between max-w-[120px]">
                          <span className="text-xs font-medium text-gray-700">{coupon.usedCount || 0} redemptions</span>
                        </div>
                        <div className="w-full max-w-[120px] bg-gray-100 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-blue-500 h-full rounded-full transition-all duration-1000"
                            style={{
                              width: `${coupon.usageLimit ? Math.min((coupon.usedCount / coupon.usageLimit) * 100, 100) : 100}%`,
                            }}
                          />
                        </div>
                        {coupon.usageLimit && (
                          <div className="text-[10px] text-gray-400 italic">
                            Limit: {coupon.usedCount}/{coupon.usageLimit} total
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {coupon.isActive ? (
                        <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-none shadow-none font-semibold px-2.5">
                          Active
                        </Badge>
                      ) : (
                        <Badge
                          variant="secondary"
                          className="bg-gray-100 text-gray-500 hover:bg-gray-200 border-none shadow-none font-semibold px-2.5"
                        >
                          Paused
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-gray-100 rounded-full">
                            <MoreHorizontal className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[180px] rounded-xl shadow-xl border-gray-100">
                          <DropdownMenuLabel className="text-xs text-gray-400 font-normal py-2 px-3">
                            Actions for {coupon.code}
                          </DropdownMenuLabel>
                          <DropdownMenuItem
                            onClick={() => handleEdit(coupon.id)}
                            className="cursor-pointer py-2.5 px-3"
                          >
                            <Edit className="h-4 w-4 mr-2 text-blue-500" /> Edit Configuration
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleToggleActive(coupon)}
                            className="cursor-pointer py-2.5 px-3"
                          >
                            {coupon.isActive ? (
                              <>
                                <ToggleLeft className="h-4 w-4 mr-2 text-orange-500" /> Pause Coupon
                              </>
                            ) : (
                              <>
                                <ToggleRight className="h-4 w-4 mr-2 text-green-500" /> Resume Coupon
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-gray-50" />
                          <DropdownMenuItem
                            onClick={() => handleDelete(coupon.id)}
                            className="cursor-pointer text-red-600 py-2.5 px-3 focus:bg-red-50 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4 mr-2" /> Remove Coupon
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
                      <Ticket className="h-12 w-12 mb-2 text-gray-300" />
                      <p className="text-lg font-medium">No coupons found</p>
                      <Button variant="link" onClick={() => setSearchParams({})}>
                        Clear filters
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          <TablePagination
            className="mt-4"
            currentPage={currentPage}
            totalCount={totalCount}
            pageSize={pageSize}
            onPageChange={(page) => updateFilters({ page })}
            onPageSizeChange={(limit) => updateFilters({ limit, page: 1 })}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
