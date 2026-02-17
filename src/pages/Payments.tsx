import { DashboardLayout } from "@/layouts/DashboardLayout";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";

import { ROUTES } from "@/constants/routes";

const Payments = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Determine active tab based on URL
  const getActiveTab = () => {
    const path = location.pathname;
    if (path.includes(ROUTES.WALLET_MANAGEMENT)) return "wallets";
    if (path.includes(ROUTES.TRANSACTIONS)) return "transactions";
    if (path.includes(ROUTES.PAYMENT_ANALYTICS)) return "analytics";
    if (path.includes(ROUTES.UNIVERSAL_TRACKER)) return "tracker";
    if (path.includes(ROUTES.PAYMENT_OVERVIEW)) return "overview";
    // Default to overview for /payments
    if (path === ROUTES.PAYMENTS) return "overview";
    return "overview";
  };

  const activeTab = getActiveTab();

  const handleTabChange = (value: string) => {
    switch (value) {
      case "overview":
        navigate(ROUTES.PAYMENT_OVERVIEW);
        break;
      case "transactions":
        navigate(ROUTES.TRANSACTIONS);
        break;
      case "wallets":
        navigate(ROUTES.WALLET_MANAGEMENT);
        break;
      case "analytics":
        navigate(ROUTES.PAYMENT_ANALYTICS);
        break;
      case "tracker":
        navigate(ROUTES.UNIVERSAL_TRACKER);
        break;
      default:
        navigate(ROUTES.PAYMENT_OVERVIEW);
    }
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="Payments & Financials"
        subtitle="Manage payments, transactions, and wallet operations"
        actions={
          <Button
            variant="default"
            className="shadow-lg shadow-primary/20"
            onClick={() => navigate(ROUTES.UNIVERSAL_TRACKER)}
          >
            <Search className="h-4 w-4 mr-2" /> Track Payments
          </Button>
        }
      />

      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 lg:w-[750px]">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="wallets">Wallets</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="tracker">Track</TabsTrigger>
        </TabsList>

        {/* Render child routes */}
        <Outlet />
      </Tabs>
    </DashboardLayout>
  );
};

export default Payments;
