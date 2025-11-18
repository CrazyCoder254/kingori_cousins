import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";

interface DashboardCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  link: string;
  value?: string | number;
  trend?: string;
}

const DashboardCard = ({ title, description, icon: Icon, link, value, trend }: DashboardCardProps) => {
  return (
    <Card className="shadow-elegant border-primary/20 hover:border-secondary/50 transition-all hover:scale-105">
      <CardHeader>
        <div className="flex items-center justify-between">
          <Icon className="h-8 w-8 text-secondary" />
          {trend && (
            <span className="text-xs text-muted-foreground">{trend}</span>
          )}
        </div>
        <CardTitle className="font-serif text-primary mt-4">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {value && (
          <div className="text-3xl font-bold text-foreground mb-4">{value}</div>
        )}
        <Link to={link}>
          <Button className="w-full bg-primary hover:bg-primary/90">
            View {title}
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
};

export default DashboardCard;
