import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Save, Calendar as CalendarIcon, Ticket, Check, ChevronsUpDown, Search, X, Info } from "lucide-react";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FullPageLoader } from "@/components/ui/full-page-loader";
import { PageHeader } from "@/components/ui/page-header";
import { couponService } from "@\/api\/coupons";
import { routeService } from "@/features/routes/api/route.service";
import { toast } from "@/components/ui/sonner";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";

const CreateCoupon = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditing = Boolean(id);

  const [selectedRoutes, setSelectedRoutes] = useState<string[]>([]);
  const [routeSearchOpen, setRouteSearchOpen] = useState(false);
  const [discountType, setDiscountType] = useState<string>("PERCENTAGE");
  const [isPublic, setIsPublic] = useState(false);
  const [isAutoApply, setIsAutoApply] = useState(false);

  // Fetch Coupon Details if editing
  const { data: coupon, isLoading: isCouponLoading } = useQuery({
    queryKey: ["coupon", id],
    queryFn: () => couponService.getCouponById(id!),
    enabled: isEditing,
  });

  useEffect(() => {
    if (coupon) {
      setSelectedRoutes(coupon.targetRoutes?.map((tr) => tr.routeId) || []);
      setDiscountType(coupon.discountType);
      setIsPublic(coupon.isPublic);
      setIsAutoApply(coupon.isAutoApply);
    }
  }, [coupon]);

  // Fetch Routes for Targeting
  const { data: routes = [], isLoading: isRoutesLoading } = useQuery({
    queryKey: ["routes"],
    queryFn: routeService.getAll,
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: couponService.createCoupon,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coupons"] });
      toast.success("Coupon created successfully");
      navigate(ROUTES.COUPONS);
    },
    onError: (error: any) => toast.error(error.message || "Failed to create coupon"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => couponService.updateCoupon(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coupons"] });
      toast.success("Coupon updated successfully");
      navigate(ROUTES.COUPONS);
    },
    onError: (error: any) => toast.error(error.message || "Failed to update coupon"),
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const payload: any = {
      code: formData.get("code") as string,
      description: formData.get("description") as string,
      discountType: discountType as any,
      discountValue: Number(formData.get("discountValue")),
      minOrderValue: Number(formData.get("minOrderValue")),
      maxDiscount: formData.get("maxDiscount") ? Number(formData.get("maxDiscount")) : null,
      startDate: formData.get("startDate") as string,
      endDate: formData.get("endDate") as string,
      usageLimit: formData.get("usageLimit") ? Number(formData.get("usageLimit")) : null,
      perUserLimit: Number(formData.get("perUserLimit") || 1),
      isPublic,
      isAutoApply,
      minRideCount: formData.get("minRideCount") ? Number(formData.get("minRideCount")) : null,
      maxRideCount: formData.get("maxRideCount") ? Number(formData.get("maxRideCount")) : null,
      targetRouteIds: selectedRoutes,
    };

    if (isEditing) {
      updateMutation.mutate({ id: id!, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const toggleRoute = (routeId: string) => {
    setSelectedRoutes((prev) => (prev.includes(routeId) ? prev.filter((id) => id !== routeId) : [...prev, routeId]));
  };

  const isAnyLoading = isCouponLoading || isRoutesLoading || createMutation.isPending || updateMutation.isPending;

  return (
    <DashboardLayout>
      <FullPageLoader show={isAnyLoading} label={isCouponLoading ? "Fetching Details..." : "Saving Changes..."} />

      <div className="space-y-8">
        {/* Header */}
        <PageHeader
          title={isEditing ? "Edit Coupon" : "Create New Coupon"}
          subtitle={
            isEditing
              ? `Update configuration for coupon ${coupon?.code || ""}`
              : "Define discount rules and campaign targeting"
          }
          backUrl={ROUTES.COUPONS}
        />

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-12">
          {/* Main Configuration */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="shadow-sm border-border/60">
              <CardHeader>
                <div className="flex items-center gap-2 mb-1">
                  <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center">
                    <Ticket className="h-4 w-4 text-blue-600" />
                  </div>
                  <CardTitle className="text-lg">Core Details</CardTitle>
                </div>
                <CardDescription>Setup the base properties of your promotional code</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="code" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Coupon Code
                    </Label>
                    <Input
                      id="code"
                      name="code"
                      placeholder="e.g. SUMMER89"
                      defaultValue={coupon?.code}
                      required
                      className="uppercase font-bold text-lg h-12 border-2 focus-visible:ring-blue-500/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="discountType"
                      className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
                    >
                      Discount Type
                    </Label>
                    <Select value={discountType} onValueChange={setDiscountType}>
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PERCENTAGE">Percentage (%)</SelectItem>
                        <SelectItem value="FLAT">Flat Amount (₹)</SelectItem>
                        <SelectItem value="FIXED_PRICE">Fixed Price (₹)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label
                      htmlFor="discountValue"
                      className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
                    >
                      Value
                    </Label>
                    <div className="relative">
                      <Input
                        id="discountValue"
                        name="discountValue"
                        type="number"
                        placeholder="0"
                        defaultValue={coupon?.discountValue}
                        required
                        className="h-12 pl-8"
                      />
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                        {/* Placeholder logic for prefix/suffix could go here */}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="maxDiscount"
                      className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
                    >
                      Max Discount <span className="text-[10px] font-normal lowercase">(Optional)</span>
                    </Label>
                    <Input
                      id="maxDiscount"
                      name="maxDiscount"
                      type="number"
                      placeholder="No Limit"
                      defaultValue={coupon?.maxDiscount}
                      className="h-12"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="description"
                    className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
                  >
                    Marketing Description
                  </Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Describe this offer to passengers..."
                    defaultValue={coupon?.description}
                    required
                    className="min-h-[100px] resize-none border-dashed"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-border/60">
              <CardHeader>
                <div className="flex items-center gap-2 mb-1">
                  <div className="h-8 w-8 rounded-lg bg-orange-50 flex items-center justify-center">
                    <CalendarIcon className="h-4 w-4 text-orange-600" />
                  </div>
                  <CardTitle className="text-lg">Validity & Limits</CardTitle>
                </div>
                <CardDescription>Control when and how many times this can be used</CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label
                      htmlFor="startDate"
                      className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
                    >
                      Campaign Start
                    </Label>
                    <Input
                      id="startDate"
                      name="startDate"
                      type="date"
                      defaultValue={coupon?.startDate?.split("T")[0]}
                      required
                      className="h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="endDate"
                      className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
                    >
                      Campaign End
                    </Label>
                    <Input
                      id="endDate"
                      name="endDate"
                      type="date"
                      defaultValue={coupon?.endDate?.split("T")[0]}
                      required
                      className="h-12"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label
                      htmlFor="minOrderValue"
                      className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
                    >
                      Min Order ₹
                    </Label>
                    <Input
                      id="minOrderValue"
                      name="minOrderValue"
                      type="number"
                      defaultValue={coupon?.minOrderValue || 0}
                      required
                      className="h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="perUserLimit"
                      className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
                    >
                      Uses Per User
                    </Label>
                    <Input
                      id="perUserLimit"
                      name="perUserLimit"
                      type="number"
                      defaultValue={coupon?.perUserLimit || 1}
                      required
                      className="h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="usageLimit"
                      className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
                    >
                      Total Cap
                    </Label>
                    <Input
                      id="usageLimit"
                      name="usageLimit"
                      type="number"
                      placeholder="∞"
                      defaultValue={coupon?.usageLimit || ""}
                      className="h-12"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Targeting & Visibility */}
          <div className="space-y-6">
            <Card className="shadow-sm border-border/60 bg-blue-50/20">
              <CardHeader>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Search className="h-4 w-4 text-blue-600" />
                  Journey Targeting
                </CardTitle>
                <CardDescription>Restrict coupon to specific journeys</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex justify-between items-center">
                    Applicable Routes
                    <Badge variant="outline" className="text-[10px] font-normal normal-case">
                      {selectedRoutes.length > 0 ? `${selectedRoutes.length} Selected` : "All Routes"}
                    </Badge>
                  </Label>

                  <Popover open={routeSearchOpen} onOpenChange={setRouteSearchOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={routeSearchOpen}
                        className="w-full justify-between h-11 bg-background text-sm font-normal"
                      >
                        {selectedRoutes.length > 0
                          ? `Selected ${selectedRoutes.length} Routes`
                          : "Select Targeted Routes..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[300px] p-0" align="start">
                      <Command>
                        <CommandInput placeholder="Search routes..." />
                        <CommandList>
                          <CommandEmpty>No route found.</CommandEmpty>
                          <CommandGroup>
                            {routes.map((route) => (
                              <CommandItem
                                key={route.id}
                                value={route.routeName}
                                onSelect={() => toggleRoute(route.id)}
                                className="flex items-center gap-2 cursor-pointer"
                              >
                                <div
                                  className={cn(
                                    "flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                                    selectedRoutes.includes(route.id)
                                      ? "bg-primary text-primary-foreground"
                                      : "opacity-50 [&_svg]:invisible",
                                  )}
                                >
                                  <Check className="h-3 w-3" />
                                </div>
                                <span className="flex-1 truncate">{route.routeName}</span>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>

                  {selectedRoutes.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {selectedRoutes.map((routeId) => {
                        const route = routes.find((r) => r.id === routeId);
                        return route ? (
                          <Badge
                            key={routeId}
                            variant="secondary"
                            className="gap-1 bg-white border-blue-100 text-[10px]"
                          >
                            {route.routeName}
                            <X
                              className="h-3 w-3 cursor-pointer hover:text-destructive"
                              onClick={() => toggleRoute(routeId)}
                            />
                          </Badge>
                        ) : null;
                      })}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="minRideCount"
                      className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
                    >
                      Min Rides
                    </Label>
                    <Input
                      id="minRideCount"
                      name="minRideCount"
                      type="number"
                      placeholder="0"
                      defaultValue={coupon?.minRideCount || ""}
                      className="bg-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="maxRideCount"
                      className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
                    >
                      Max Rides
                    </Label>
                    <Input
                      id="maxRideCount"
                      name="maxRideCount"
                      type="number"
                      placeholder="Any"
                      defaultValue={coupon?.maxRideCount || ""}
                      className="bg-background"
                    />
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-blue-50/50 border border-blue-100/50 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="isAutoApply" className="text-sm font-bold text-blue-900">
                        Auto-Apply
                      </Label>
                      <p className="text-[10px] text-blue-700/70">Applied during search automatically</p>
                    </div>
                    <Switch id="isAutoApply" checked={isAutoApply} onCheckedChange={setIsAutoApply} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="isPublic" className="text-sm font-bold text-blue-900">
                        Make Public
                      </Label>
                      <p className="text-[10px] text-blue-700/70">Visible in user's offers list</p>
                    </div>
                    <Switch id="isPublic" checked={isPublic} onCheckedChange={setIsPublic} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-3">
              <Button
                type="submit"
                className="w-full h-12 text-base font-bold shadow-lg shadow-blue-200"
                disabled={isAnyLoading}
              >
                <Save className="h-5 w-5 mr-2" />
                {isEditing ? "Save Configuration" : "Publish"}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full h-12"
                onClick={() => navigate(ROUTES.COUPONS)}
                disabled={isAnyLoading}
              >
                Cancel
              </Button>
            </div>

            <div className="p-4 rounded-xl border border-dashed border-muted-foreground/30 bg-muted/5">
              <div className="flex gap-3">
                <Info className="h-5 w-5 text-muted-foreground shrink-0" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Coupons are evaluated sequentially. Auto-apply coupons with higher discount values will be prioritized
                  for the user.
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default CreateCoupon;
