import { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface PageHeaderProps {
  title: string;
  subtitle?: ReactNode;
  backUrl?: string;
  actions?: ReactNode;
}

export function PageHeader({ title, subtitle, backUrl, actions }: PageHeaderProps) {
  const navigate = useNavigate();

  return (
    <div className="page-header">
      <div className="flex items-center gap-4">
        {backUrl && (
          <Button variant="ghost" size="icon" onClick={() => navigate(backUrl)} className="rounded-full h-9 w-9">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}
        <div>
          <h1 className="page-title">{title}</h1>
          {subtitle && <p className="page-subtitle">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="flex gap-2 items-center">{actions}</div>}
    </div>
  );
}
