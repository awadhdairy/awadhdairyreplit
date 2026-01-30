import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: React.ComponentType<{ className?: string }>;
  };
  children?: React.ReactNode;
  className?: string;
}

export function PageHeader({ 
  title, 
  description, 
  action, 
  children,
  className 
}: PageHeaderProps) {
  const ActionIcon = action?.icon || Plus;

  return (
    <div className={cn("flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6", className)}>
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight" data-testid="page-title">
          {title}
        </h1>
        {description && (
          <p className="text-muted-foreground mt-1" data-testid="page-description">
            {description}
          </p>
        )}
      </div>
      <div className="flex items-center gap-2">
        {children}
        {action && (
          <Button onClick={action.onClick} data-testid="button-page-action">
            <ActionIcon className="h-4 w-4 mr-2" />
            {action.label}
          </Button>
        )}
      </div>
    </div>
  );
}
