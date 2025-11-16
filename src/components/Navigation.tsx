import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Users, Calendar, Image, BarChart3, MessageCircle, BookOpen } from "lucide-react";
import crownLogo from "@/assets/crown-logo.png";

interface NavigationProps {
  user: any;
}

const Navigation = ({ user }: NavigationProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Logged out successfully",
    });
    navigate("/auth");
  };

  return (
    <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img src={crownLogo} alt="Crown Logo" className="w-10 h-10" />
            <span className="text-xl font-serif font-semibold text-primary">Kingori Family</span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link to="/dashboard" className="text-sm font-medium hover:text-primary transition-colors">
              Dashboard
            </Link>
            <Link to="/contributions" className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-1">
              <Users className="w-4 h-4" />
              Contributions
            </Link>
            <Link to="/events" className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              Events
            </Link>
            <Link to="/gallery" className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-1">
              <Image className="w-4 h-4" />
              Gallery
            </Link>
            <Link to="/blog" className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-1">
              <BookOpen className="w-4 h-4" />
              Blog
            </Link>
            <Link to="/chat" className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-1">
              <MessageCircle className="w-4 h-4" />
              Chat
            </Link>
            <Link to="/reports" className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-1">
              <BarChart3 className="w-4 h-4" />
              Reports
            </Link>
          </div>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar>
                    <AvatarImage src={user.avatar_url} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {user.full_name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => navigate("/dashboard")}>
                  Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button onClick={() => navigate("/auth")} variant="default">
              Login
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;