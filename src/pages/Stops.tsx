import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/constants/routes";
import { DashboardLayout } from "@/layouts/DashboardLayout";

const Stops = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate(ROUTES.ROUTES, { replace: true });
  }, [navigate]);

  return (
    <DashboardLayout>
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Redirecting to Routes...</p>
      </div>
    </DashboardLayout>
  );
};

export default Stops;
