import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Calendar, TrendingUp, MessageCircle, Cake, BookOpen, Image } from "lucide-react";
import { format, isToday, isTomorrow, parseISO } from "date-fns";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    myContributions: 0,
    upcomingEvents: 0,
    totalMembers: 0,
    unreadMessages: 0,
    totalPosts: 0,
    totalPhotos: 0,
  });
  const [upcomingBirthdays, setUpcomingBirthdays] = useState<any[]>([]);
  const [recentEvents, setRecentEvents] = useState<any[]>([]);

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
      
      // Fetch dashboard stats
      const [contributions, events, members, posts, photos, upcomingEventsData, profilesData] = await Promise.all([
        supabase
          .from("contributions")
          .select("amount")
          .eq("user_id", session.user.id),
        supabase
          .from("events")
          .select("id", { count: "exact", head: true })
          .gte("event_date", new Date().toISOString()),
        supabase
          .from("profiles")
          .select("id", { count: "exact", head: true }),
        supabase
          .from("blog_posts")
          .select("id", { count: "exact", head: true })
          .eq("status", "published"),
        supabase
          .from("gallery_photos")
          .select("id", { count: "exact", head: true }),
        supabase
          .from("events")
          .select("*")
          .gte("event_date", new Date().toISOString())
          .order("event_date", { ascending: true })
          .limit(3),
        supabase
          .from("profiles")
          .select("full_name, birthday")
          .not("birthday", "is", null),
      ]);

      const myTotal = contributions.data?.reduce((sum, c) => sum + Number(c.amount), 0) || 0;

      setStats({
        myContributions: myTotal,
        upcomingEvents: events.count || 0,
        totalMembers: members.count || 0,
        unreadMessages: 0,
        totalPosts: posts.count || 0,
        totalPhotos: photos.count || 0,
      });

      // Process upcoming birthdays
      if (profilesData.data) {
        const today = new Date();
        const currentMonth = today.getMonth();
        const currentDay = today.getDate();
        
        const birthdaysWithDays = profilesData.data
          .map((p: any) => {
            if (!p.birthday) return null;
            const bday = parseISO(p.birthday);
            const bdayMonth = bday.getMonth();
            const bdayDay = bday.getDate();
            
            let daysUntil;
            if (bdayMonth === currentMonth && bdayDay === currentDay) {
              daysUntil = 0;
            } else if (bdayMonth === currentMonth && bdayDay > currentDay) {
              daysUntil = bdayDay - currentDay;
            } else if (bdayMonth > currentMonth) {
              const daysInCurrentMonth = new Date(today.getFullYear(), currentMonth + 1, 0).getDate();
              daysUntil = (daysInCurrentMonth - currentDay) + bdayDay + (bdayMonth - currentMonth - 1) * 30;
            } else {
              const daysInCurrentMonth = new Date(today.getFullYear(), currentMonth + 1, 0).getDate();
              const monthsUntil = (12 - currentMonth) + bdayMonth;
              daysUntil = (daysInCurrentMonth - currentDay) + bdayDay + (monthsUntil - 1) * 30;
            }
            
            return { ...p, daysUntil };
          })
          .filter((p: any) => p !== null && p.daysUntil <= 30)
          .sort((a: any, b: any) => a.daysUntil - b.daysUntil)
          .slice(0, 5);
        
        setUpcomingBirthdays(birthdaysWithDays);
      }

      setRecentEvents(upcomingEventsData.data || []);

      setLoading(false);
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  if (loading) {
    return <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navigation user={user} />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-serif font-bold text-primary mb-2">
            Welcome back, {user?.full_name}!
          </h1>
          <p className="text-muted-foreground">Here's what's happening in the family</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-elegant hover:shadow-gold transition-shadow cursor-pointer" onClick={() => navigate("/contributions")}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">My Contributions</p>
                  <p className="text-2xl font-bold text-primary">KES {stats.myContributions.toLocaleString()}</p>
                </div>
                <TrendingUp className="w-10 h-10 text-accent" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-elegant hover:shadow-gold transition-shadow cursor-pointer" onClick={() => navigate("/events")}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Upcoming Events</p>
                  <p className="text-2xl font-bold text-primary">{stats.upcomingEvents}</p>
                </div>
                <Calendar className="w-10 h-10 text-accent" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-elegant hover:shadow-gold transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Family Members</p>
                  <p className="text-2xl font-bold text-primary">{stats.totalMembers}</p>
                </div>
                <Users className="w-10 h-10 text-accent" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-elegant hover:shadow-gold transition-shadow cursor-pointer" onClick={() => navigate("/chat")}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Messages</p>
                  <p className="text-2xl font-bold text-primary">{stats.unreadMessages}</p>
                </div>
                <MessageCircle className="w-10 h-10 text-accent" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle className="font-serif">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="outline" className="h-auto py-4 flex flex-col gap-2" onClick={() => navigate("/contributions")}>
                <TrendingUp className="w-6 h-6" />
                <span>Contribute</span>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex flex-col gap-2" onClick={() => navigate("/events")}>
                <Calendar className="w-6 h-6" />
                <span>View Events</span>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex flex-col gap-2" onClick={() => navigate("/gallery")}>
                <Users className="w-6 h-6" />
                <span>Gallery</span>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex flex-col gap-2" onClick={() => navigate("/chat")}>
                <MessageCircle className="w-6 h-6" />
                <span>Family Chat</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;