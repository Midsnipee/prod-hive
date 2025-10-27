import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: {
    value: string;
    positive: boolean;
  };
  className?: string;
  onClick?: () => void;
  style?: React.CSSProperties;
}

export const StatCard = ({ 
  title, 
  value, 
  icon: Icon, 
  description, 
  trend,
  className,
  onClick,
  style
}: StatCardProps) => {
  return (
    <Card 
      className={cn(
        "transition-all duration-200",
        onClick && "cursor-pointer hover:shadow-md hover:border-primary/50",
        className
      )}
      onClick={onClick}
      style={style}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center transition-transform duration-200 hover:scale-110">
          <Icon className="h-5 w-5 text-primary" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
        {trend && (
          <div className={cn(
            "text-xs font-medium mt-2",
            trend.positive ? "text-success" : "text-destructive"
          )}>
            {trend.positive ? "↑" : "↓"} {trend.value}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
