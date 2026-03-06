import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
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
import { useCoupon, useCreateCoupon, useUpdateCoupon } from "@/features/coupons/hooks/useCoupons";
import { routeService } from "@/features/routes/api/route.service";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";

const CreateCoupon = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [selectedRoutes, setSelectedRoutes] = useState<string[]>([]);
  const [routeSearchOpen, setRouteSearchOpen] = useState(false);
  const [discountType, setDiscountType] = useState<string>("PERCENTAGE");
  const [isPublic, setIsPublic] = useState(false);
  const [isAutoApply, setIsAutoApply] = useState(false);
  const [tripType, setTripType] = useState<string>("BOTH");

  // Fetch Coupon Details if editing
  const { data: coupon, isLoading: isCouponLoading } = useCoupon(id || "");

  useEffect(() => {
    if (coupon) {
      setSelectedRoutes(coupon.targetRoutes?.map((tr) => tr.routeId) || []);
      setDiscountType(coupon.discountType);
      setIsPublic(coupon.isPublic);
      setIsAutoApply(coupon.isAutoApply);
      setTripType(coupon.tripType || "BOTH");
    }
  }, [coupon]);

  // Fetch Routes for Targeting
  const { data: routesData, isLoading: isRoutesLoading } = useQuery({
    queryKey: ["routes"],
    queryFn: () => routeService.getAll(),
  });

  const routes = routesData?.data || [];

  // Mutations
  const createMutation = useCreateCoupon();
  const updateMutation = useUpdateCoupon();

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
      tripType,
      targetRouteIds: selectedRoutes,
    };

    if (isEditing) {
      updateMutation.mutate(
        { id: id!, data: payload },
        {
          onSuccess: () => {
            navigate(ROUTES.COUPONS);
          },
        },
      );
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => {
          navigate(ROUTES.COUPONS);
        },
      });
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
                            {routes.length > 0 ? (
                              routes.map((route) => (
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
                              ))
                            ) : (
                              <div className="py-6 text-center text-sm text-muted-foreground">No routes available</div>
                            )}
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

                <div className="space-y-2">
                  <Label
                    htmlFor="tripType"
                    className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
                  >
                    Valid For
                  </Label>
                  <Select value={tripType} onValueChange={setTripType}>
                    <SelectTrigger id="tripType" className="bg-background">
                      <SelectValue placeholder="Select trip type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BOTH">Both (No Restriction)</SelectItem>
                      <SelectItem value="SINGLE_TRIP">One-Way Trips Only</SelectItem>
                      <SelectItem value="ROUND_TRIP">Round-Trips Only</SelectItem>
                    </SelectContent>
                  </Select>
                  {tripType === "ROUND_TRIP" && (
                    <p className="text-[10px] text-amber-600 bg-amber-50 border border-amber-100 rounded-lg px-2 py-1.5 leading-relaxed">
                      ⚠️ Round-trip tip: Set Max Rides to an <strong>even number</strong> (e.g. 4 = 2 round trips). An
                      odd limit can strand a user who has 1 ride left but needs 2 for a round trip.
                    </p>
                  )}
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

        {/* Help Reference Card */}
        <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50/60 to-white p-6 space-y-6 pb-12">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0">
              <Info className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Coupon Field Reference</h2>
              <p className="text-xs text-gray-500">Quick guide on how each setting works</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Discount Types */}
            <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-3">
              <p className="text-xs font-bold uppercase tracking-wider text-blue-600">Discount Types</p>
              <div className="space-y-2.5">
                <div>
                  <p className="text-sm font-semibold text-gray-800">Percentage (%)</p>
                  <p className="text-xs text-gray-500">
                    Deducts a % off the cart total. Use{" "}
                    <span className="font-mono bg-gray-100 px-1 rounded">Max Discount</span> to cap the savings.
                  </p>
                  <p className="text-[11px] text-green-700 mt-1 bg-green-50 px-2 py-0.5 rounded">
                    e.g. 20% off, max ₹100 → on ₹600 cart: saves ₹100
                  </p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">Flat Amount (₹)</p>
                  <p className="text-xs text-gray-500">
                    Deducts a fixed ₹ amount from the cart, regardless of cart size.
                  </p>
                  <p className="text-[11px] text-green-700 mt-1 bg-green-50 px-2 py-0.5 rounded">
                    e.g. ₹91 off → on ₹180 cart: user pays ₹89
                  </p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">Fixed Price (₹)</p>
                  <p className="text-xs text-gray-500">Overrides the entire cart total to be exactly this value.</p>
                  <p className="text-[11px] text-amber-700 mt-1 bg-amber-50 px-2 py-0.5 rounded">
                    ⚠️ On a ₹360 round-trip, Fixed Price ₹89 = both legs for ₹89 total. Use <strong>₹178</strong> for
                    round-trips.
                  </p>
                </div>
              </div>
            </div>

            {/* Validity & Limits */}
            <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-3">
              <p className="text-xs font-bold uppercase tracking-wider text-blue-600">Validity & Limits</p>
              <div className="space-y-2.5">
                <div>
                  <p className="text-sm font-semibold text-gray-800">Campaign Start / End</p>
                  <p className="text-xs text-gray-500">
                    Coupon silently becomes inactive before start and after end date. No manual toggling needed.
                  </p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">Min Order (₹)</p>
                  <p className="text-xs text-gray-500">
                    Cart must be at least this value for the coupon to apply. Set{" "}
                    <span className="font-mono bg-gray-100 px-1 rounded">0</span> for no minimum.
                  </p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">Uses Per User</p>
                  <p className="text-xs text-gray-500">
                    How many times a single user can redeem this coupon. Default is{" "}
                    <span className="font-mono bg-gray-100 px-1 rounded">1</span>.
                  </p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">Total Cap</p>
                  <p className="text-xs text-gray-500">
                    Global maximum across all users. Leave blank for unlimited redemptions.
                  </p>
                </div>
              </div>
            </div>

            {/* Journey Targeting */}
            <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-3">
              <p className="text-xs font-bold uppercase tracking-wider text-blue-600">Journey Targeting</p>
              <div className="space-y-2.5">
                <div>
                  <p className="text-sm font-semibold text-gray-800">Applicable Routes</p>
                  <p className="text-xs text-gray-500">
                    Leave empty to allow on all routes, or pick specific routes to limit the promo geographically.
                  </p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">Min / Max Rides</p>
                  <p className="text-xs text-gray-500">
                    Controls eligibility based on a user's prior confirmed rides on the route.
                  </p>
                  <p className="text-[11px] text-blue-700 mt-1 bg-blue-50 px-2 py-0.5 rounded">
                    e.g. Min 0, Max 2 = applies only to the user's 1st, 2nd, 3rd rides.
                  </p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">Valid For (Trip Type)</p>
                  <p className="text-xs text-gray-500">Restricts the coupon to a booking type.</p>
                  <ul className="text-[11px] text-gray-500 space-y-0.5 mt-1 list-disc list-inside">
                    <li>
                      <strong>Both</strong> — no restriction
                    </li>
                    <li>
                      <strong>One-Way Only</strong> — blocks round-trip checkout
                    </li>
                    <li>
                      <strong>Round-Trip Only</strong> — blocks single-leg checkout
                    </li>
                  </ul>
                  <p className="text-[11px] text-amber-700 mt-1 bg-amber-50 px-2 py-0.5 rounded">
                    ⚠️ Round-trip coupons: always use even Max Ride counts (2, 4, 6…)
                  </p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">Auto-Apply</p>
                  <p className="text-xs text-gray-500">
                    System automatically finds and applies this coupon at checkout — user doesn't need to enter a code.
                  </p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">Make Public</p>
                  <p className="text-xs text-gray-500">
                    Shows the coupon in the user's "Offers" or "Promos" list in the app. Private coupons still work if
                    the user enters the code manually.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CreateCoupon;
