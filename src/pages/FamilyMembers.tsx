import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, Mail, Phone, Calendar, User } from "lucide-react";

const FamilyMembers = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState<any[]>([]);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();
      
      setUser(profile);
      await loadMembers();
      setLoading(false);
    };

    checkUser();
  }, [navigate]);

  const loadMembers = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("full_name");

    if (!error) {
      setMembers(data || []);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center">
        <div className="fixed inset-0 bg-gradient-subtle" />
        <div className="relative z-10 text-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Premium gradient background */}
      <div className="fixed inset-0 bg-gradient-subtle" />
      
      {/* Animated gradient overlay */}
      <div className="fixed inset-0 opacity-30">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>
      
      {/* Content */}
      <div className="relative z-10">
        <Navigation user={user} />
      
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-serif font-bold text-primary mb-2">Family Members</h1>
            <p className="text-muted-foreground">Meet the Kingori family</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {members.map((member) => (
              <Card 
                key={member.id} 
                className="shadow-elegant border-primary/20 hover:border-secondary/50 transition-all"
              >
                <CardHeader className="text-center">
                  <Avatar className="w-24 h-24 mx-auto mb-4 border-2 border-secondary">
                    <AvatarImage src={member.avatar_url} alt={member.full_name} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                      {getInitials(member.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <CardTitle className="font-serif text-primary">{member.full_name}</CardTitle>
                  {member.bio && (
                    <CardDescription className="text-sm">{member.bio}</CardDescription>
                  )}
                </CardHeader>
                <CardContent className="space-y-3">
                  {member.email && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="h-4 w-4 text-secondary" />
                      <span className="truncate">{member.email}</span>
                    </div>
                  )}
                  {member.phone && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="h-4 w-4 text-secondary" />
                      <span>{member.phone}</span>
                    </div>
                  )}
                  {member.birthday && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4 text-secondary" />
                      <span>{new Date(member.birthday).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {members.length === 0 && (
            <Card className="shadow-elegant">
              <CardContent className="py-12 text-center">
                <Users className="mx-auto h-12 w-12 text-secondary mb-4" />
                <p className="text-muted-foreground">No family members found.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default FamilyMembers;
