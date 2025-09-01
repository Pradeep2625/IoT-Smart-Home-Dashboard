import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface MetricCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  metric: string;
  unit: string;
  icon: React.ReactNode;
}

export function MetricCard({
  title,
  metric,
  unit,
  icon,
  className,
  ...props
}: MetricCardProps) {
  return (
    <Card className={cn("metric-card", className)} {...props}>
      <CardHeader className="flex items-center justify-between gap-3">
        <CardTitle className="glow-text">{title}</CardTitle>
        <div className="text-primary">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-2">
          <span className="text-4xl md:text-5xl font-extrabold tracking-tight">{metric}</span>
          <span className="text-xl md:text-2xl opacity-80">{unit}</span>
        </div>
      </CardContent>
    </Card>
  );
}
