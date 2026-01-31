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
    <div className={cn("flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 md:mb-6", className)}>
      <div className="min-w-0 flex-1">
        <h1 className="text-xl md:text-2xl lg:text-3xl font-bold tracking-tight truncate sm:overflow-visible sm:whitespace-normal" data-testid="page-title">
          {title}
        </h1>
        {description && (
          <p className="text-sm md:text-base text-muted-foreground mt-0.5 truncate sm:overflow-visible sm:whitespace-normal" data-testid="page-description">
            {description}
          </p>
        )}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {children}
        {action && (
          <Button size="sm" onClick={action.onClick} data-testid="button-page-action" className="whitespace-nowrap">
            <ActionIcon className="h-4 w-4 mr-1.5" />
            {action.label}
          </Button>
        )}
      </div>
    </div>
  );
}
