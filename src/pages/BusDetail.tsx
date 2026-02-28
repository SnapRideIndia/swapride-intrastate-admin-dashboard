import { useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { Edit3, Trash2, AlertTriangle } from "lucide-react";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { FullPageLoader } from "@/components/ui/full-page-loader";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/constants/routes";
import { useBus, EditBusDialog, useDeleteBus } from "@/features/buses";
import { toast } from "@/hooks/use-toast";
import { BusQRCode } from "@/features/buses/components/BusQRCode";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Domain Components
import { BusQuickOverview } from "@/features/buses/components/detail/BusQuickOverview";
import { BusTechnicalDetails } from "@/features/buses/components/detail/BusTechnicalDetails";
import { BusAnalytics } from "@/features/buses/components/detail/BusAnalytics";
import { BusCondition } from "@/features/buses/components/detail/BusCondition";
import { BusSeatingLayout } from "@/features/buses/components/detail/BusSeatingLayout";

const BusDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [editOpen, setEditOpen] = useState(false);

  const activeTab = searchParams.get("tab") || "details";

  const setActiveTab = (tab: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("tab", tab);
    setSearchParams(params, { replace: true });
  };

  const { data: bus, isLoading, isError, refetch } = useBus(id || "");
  const { mutate: deleteBus } = useDeleteBus();

  if (isLoading) return <FullPageLoader show={true} label="Loading bus profile..." />;

  if (isError || !bus) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-6">
          <div className="bg-destructive/10 p-4 rounded-full mb-4">
            <AlertTriangle className="h-10 w-10 text-destructive" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Bus Not Found</h2>
          <p className="text-muted-foreground max-w-md mb-6">
            The bus you are looking for might have been removed or the ID is incorrect.
          </p>
          <Button variant="outline" onClick={() => window.history.back()}>
            Go Back
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <PageHeader
        title={`Bus ${bus.busNumber}`}
        subtitle={
          <div className="flex items-center gap-2 mt-1">
            <span
              className={cn(
                "px-2 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase",
                bus.status === "ACTIVE"
                  ? "bg-success/20 text-success border border-success/30"
                  : bus.status === "MAINTENANCE"
                    ? "bg-warning/20 text-warning border border-warning/30"
                    : "bg-muted text-muted-foreground border border-border",
              )}
            >
              {bus.status}
            </span>
            <span className="text-muted-foreground/40">•</span>
            <span className="text-sm font-medium text-muted-foreground">{bus.model || "Unknown Model"}</span>
          </div>
        }
        backUrl={ROUTES.BUSES}
        actions={
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                if (window.confirm("Are you sure you want to delete this bus?")) {
                  deleteBus(bus.id, {
                    onSuccess: () => {
                      toast({ title: "Bus Deleted" });
                      window.history.back();
                    },
                  });
                }
              }}
              className="text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            <Button onClick={() => setEditOpen(true)} className="gap-2 shadow-sm font-semibold">
              <Edit3 className="h-4 w-4" /> Edit Profile
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Quick Overview */}
        <div className="lg:col-span-1">
          <BusQuickOverview bus={bus} onViewQR={() => setActiveTab("qr")} />
        </div>

        {/* Right Column: Main Content Tabs */}
        <div className="lg:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="condition">Condition</TabsTrigger>
              <TabsTrigger value="layout">Layout</TabsTrigger>
              <TabsTrigger value="qr">QR Code</TabsTrigger>
            </TabsList>

            <TabsContent value="details">
              <BusTechnicalDetails bus={bus} />
            </TabsContent>

            <TabsContent value="analytics">
              <BusAnalytics busId={bus.id} />
            </TabsContent>

            <TabsContent value="condition">
              <BusCondition bus={bus} />
            </TabsContent>

            <TabsContent value="layout">
              <BusSeatingLayout bus={bus} />
            </TabsContent>

            <TabsContent value="qr">
              <BusQRCode busId={bus.id} busNumber={bus.busNumber} />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <EditBusDialog bus={bus} open={editOpen} onOpenChange={setEditOpen} onBusUpdated={() => refetch()} />
    </DashboardLayout>
  );
};

export default BusDetail;
