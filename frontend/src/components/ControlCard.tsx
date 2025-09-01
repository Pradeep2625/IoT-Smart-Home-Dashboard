// src/components/ControlCard.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ControlCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  icon: React.ReactNode;
  controlComponent: React.ReactNode;
}

export function ControlCard({
  title,
  icon,
  controlComponent,
  className,
  ...props
}: ControlCardProps) {
  return (
    <Card className={cn("control-card", className)} {...props}>
      <CardHeader className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {icon}
          <CardTitle className="glow-text">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex items-center justify-between">
        {controlComponent}
      </CardContent>
    </Card>
  );
}
