import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Users, Image as ImageIcon, TrendingUp } from "lucide-react";
import heroImage from "@/assets/hero-family.jpg";

const Index = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState({
    totalMembers: 0,
    totalContributions: 0,
    upcomingEvents: 0,
    totalPhotos: 0,
  });

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();
        setUser(profile);
      }
    };

    const getStats = async () => {
      const [members, contributions, events, photos] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("contributions").select("amount"),
        supabase.from("events").select("id", { count: "exact", head: true }).gte("event_date", new Date().toISOString()),
        supabase.from("gallery_photos").select("id", { count: "exact", head: true }),
      ]);

      const totalContributions = contributions.data?.reduce((sum, c) => sum + Number(c.amount), 0) || 0;

      setStats({
        totalMembers: members.count || 0,
        totalContributions,
        upcomingEvents: events.count || 0,
        totalPhotos: photos.count || 0,
      });
    };

    getUser();
    getStats();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single()
          .then(({ data }) => setUser(data));
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navigation user={user} />
      
      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src={heroImage} 
            alt="Kingori Family" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-background" />
        </div>
        <div className="relative z-10 text-center px-4 max-w-4xl">
          <h1 className="text-5xl md:text-7xl font-serif font-bold text-white mb-6">
            Kingori Family Cousins
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-8 font-light">
            Unity • Heritage • Love
          </p>
          <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
            Stronger together, connected by blood and bound by love. Welcome to our family hub where we celebrate our heritage, support each other, and create lasting memories.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            {user ? (
              <Button size="lg" onClick={() => navigate("/dashboard")} className="shadow-gold">
                Go to Dashboard
              </Button>
            ) : (
              <>
                <Button size="lg" onClick={() => navigate("/auth")} className="shadow-gold">
                  Join the Family
                </Button>
                <Button size="lg" variant="outline" onClick={() => navigate("/auth")} className="bg-white/10 backdrop-blur-sm text-white border-white/20 hover:bg-white/20">
                  Login
                </Button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="shadow-elegant hover:shadow-gold transition-shadow">
              <CardContent className="p-6 text-center">
                <Users className="w-12 h-12 mx-auto mb-4 text-primary" />
                <h3 className="text-3xl font-bold text-primary mb-2">{stats.totalMembers}</h3>
                <p className="text-muted-foreground">Family Members</p>
              </CardContent>
            </Card>
            <Card className="shadow-elegant hover:shadow-gold transition-shadow">
              <CardContent className="p-6 text-center">
                <TrendingUp className="w-12 h-12 mx-auto mb-4 text-accent" />
                <h3 className="text-3xl font-bold text-accent mb-2">KES {stats.totalContributions.toLocaleString()}</h3>
                <p className="text-muted-foreground">Total Contributions</p>
              </CardContent>
            </Card>
            <Card className="shadow-elegant hover:shadow-gold transition-shadow">
              <CardContent className="p-6 text-center">
                <Calendar className="w-12 h-12 mx-auto mb-4 text-primary" />
                <h3 className="text-3xl font-bold text-primary mb-2">{stats.upcomingEvents}</h3>
                <p className="text-muted-foreground">Upcoming Events</p>
              </CardContent>
            </Card>
            <Card className="shadow-elegant hover:shadow-gold transition-shadow">
              <CardContent className="p-6 text-center">
                <ImageIcon className="w-12 h-12 mx-auto mb-4 text-accent" />
                <h3 className="text-3xl font-bold text-accent mb-2">{stats.totalPhotos}</h3>
                <p className="text-muted-foreground">Family Photos</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-card/30">
        <div className="container mx-auto">
          <h2 className="text-4xl font-serif font-bold text-center mb-4 text-primary">
            Stay Connected
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Everything you need to keep our family strong and united
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="shadow-elegant hover:shadow-gold transition-all hover:-translate-y-1">
              <CardContent className="p-6">
                <Users className="w-10 h-10 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">Contributions</h3>
                <p className="text-muted-foreground">Track and manage family contributions with transparent reporting</p>
              </CardContent>
            </Card>
            <Card className="shadow-elegant hover:shadow-gold transition-all hover:-translate-y-1">
              <CardContent className="p-6">
                <Calendar className="w-10 h-10 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">Events</h3>
                <p className="text-muted-foreground">Plan reunions, celebrations, and family gatherings together</p>
              </CardContent>
            </Card>
            <Card className="shadow-elegant hover:shadow-gold transition-all hover:-translate-y-1">
              <CardContent className="p-6">
                <ImageIcon className="w-10 h-10 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">Gallery</h3>
                <p className="text-muted-foreground">Share and preserve precious family memories</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border bg-card/50">
        <div className="container mx-auto text-center text-muted-foreground">
          <p className="font-serif">© 2025 Kingori Family Cousins. Built with love.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;