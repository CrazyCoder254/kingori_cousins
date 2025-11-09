import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Users, DollarSign, Calendar, TrendingUp, Activity } from "lucide-react";

const Reports = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalContributions: 0,
    totalMembers: 0,
    totalEvents: 0,
    upcomingEvents: 0,
    blogPosts: 0,
    monthlyContributions: 0,
  });

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
      await loadStatistics();
      setLoading(false);
    };

    checkUser();
  }, [navigate]);

  const loadStatistics = async () => {
    const [contributions, members, events, posts] = await Promise.all([
      supabase.from("contributions").select("amount, created_at"),
      supabase.from("profiles").select("id", { count: "exact" }),
      supabase.from("events").select("event_date"),
      supabase.from("blog_posts").select("id", { count: "exact" }),
    ]);

    const totalContributions = contributions.data?.reduce(
      (sum, c) => sum + Number(c.amount),
      0
    ) || 0;

    const now = new Date();
    const monthlyContributions = contributions.data
      ?.filter((c) => {
        const date = new Date(c.created_at);
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
      })
      .reduce((sum, c) => sum + Number(c.amount), 0) || 0;

    const upcomingEvents = events.data?.filter(
      (e) => new Date(e.event_date) > now
    ).length || 0;

    setStats({
      totalContributions,
      totalMembers: members.count || 0,
      totalEvents: events.data?.length || 0,
      upcomingEvents,
      blogPosts: posts.count || 0,
      monthlyContributions,
    });
  };

  if (loading) {
    return <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navigation user={user} />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-serif font-bold text-primary mb-8">
          Reports & Analytics
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="shadow-elegant border-gold/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Contributions</CardTitle>
              <DollarSign className="h-4 w-4 text-gold" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">
                KES {stats.totalContributions.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-1">All-time total</p>
            </CardContent>
          </Card>

          <Card className="shadow-elegant border-gold/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              <TrendingUp className="h-4 w-4 text-gold" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">
                KES {stats.monthlyContributions.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Monthly contributions</p>
            </CardContent>
          </Card>

          <Card className="shadow-elegant border-gold/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Family Members</CardTitle>
              <Users className="h-4 w-4 text-gold" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{stats.totalMembers}</div>
              <p className="text-xs text-muted-foreground mt-1">Registered members</p>
            </CardContent>
          </Card>

          <Card className="shadow-elegant border-gold/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Events</CardTitle>
              <Calendar className="h-4 w-4 text-gold" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{stats.totalEvents}</div>
              <p className="text-xs text-muted-foreground mt-1">All events</p>
            </CardContent>
          </Card>

          <Card className="shadow-elegant border-gold/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
              <Activity className="h-4 w-4 text-gold" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{stats.upcomingEvents}</div>
              <p className="text-xs text-muted-foreground mt-1">Events scheduled</p>
            </CardContent>
          </Card>

          <Card className="shadow-elegant border-gold/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Blog Posts</CardTitle>
              <BarChart className="h-4 w-4 text-gold" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{stats.blogPosts}</div>
              <p className="text-xs text-muted-foreground mt-1">Published posts</p>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle className="font-serif text-primary">Financial Overview</CardTitle>
            <CardDescription>Family contribution summary</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gradient-subtle rounded-lg">
              <div>
                <p className="text-sm font-medium">Average per Member</p>
                <p className="text-2xl font-bold text-primary">
                  KES {stats.totalMembers > 0 ? (stats.totalContributions / stats.totalMembers).toFixed(0) : 0}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-gold" />
            </div>
            <div className="flex items-center justify-between p-4 bg-gradient-subtle rounded-lg">
              <div>
                <p className="text-sm font-medium">Participation Rate</p>
                <p className="text-2xl font-bold text-primary">
                  {stats.totalMembers > 0 ? ((stats.monthlyContributions > 0 ? 1 : 0) * 100).toFixed(0) : 0}%
                </p>
              </div>
              <Activity className="h-8 w-8 text-gold" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Reports;
