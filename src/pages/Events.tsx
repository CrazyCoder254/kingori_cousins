import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { Calendar, MapPin, Users, Plus } from "lucide-react";

const Events = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<any[]>([]);
  const [userRole, setUserRole] = useState<string>("");
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    location_url: "",
    event_date: "",
  });

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();
        
        const { data: roleData } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", session.user.id)
          .single();
        
        setUser(profile);
        setUserRole(roleData?.role || "member");
      }
      
      await loadEvents();
      setLoading(false);
    };

    checkUser();
  }, [navigate]);

  const loadEvents = async () => {
    const { data, error } = await supabase
      .from("events")
      .select("*, event_rsvps(count)")
      .order("event_date", { ascending: true });

    if (!error) {
      setEvents(data || []);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { error } = await supabase.from("events").insert({
      ...formData,
      created_by: user.id,
    });

    if (error) {
      toast({ title: "Error creating event", variant: "destructive" });
      return;
    }

    toast({ title: "Event created successfully!" });
    setOpen(false);
    setFormData({ title: "", description: "", location: "", location_url: "", event_date: "" });
    loadEvents();
  };

  const handleRSVP = async (eventId: string, status: string) => {
    if (!user) {
      navigate("/auth");
      return;
    }

    const { error } = await supabase.from("event_rsvps").insert({
      event_id: eventId,
      user_id: user.id,
      status,
    });

    if (error) {
      toast({ title: "Error updating RSVP", variant: "destructive" });
      return;
    }

    toast({ title: `RSVP ${status}!` });
    loadEvents();
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
        <div className="absolute top-0 left-1/3 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.5s' }} />
        <div className="absolute bottom-0 right-1/3 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-pulse" />
      </div>
      
      {/* Content */}
      <div className="relative z-10">
        <Navigation user={user} />
      
        <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-serif font-bold text-primary">Family Events</h1>
          {userRole === "admin" && (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gold hover:bg-gold/90">
                  <Plus className="mr-2 h-4 w-4" /> Create Event
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="font-serif text-primary">New Event</DialogTitle>
                  <DialogDescription>Create a new family event</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label>Event Title</Label>
                    <Input
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Location</Label>
                    <Input
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Google Maps URL (Optional)</Label>
                    <Input
                      type="url"
                      value={formData.location_url}
                      onChange={(e) => setFormData({ ...formData, location_url: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Event Date</Label>
                    <Input
                      type="datetime-local"
                      value={formData.event_date}
                      onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full bg-primary">Create Event</Button>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {events.length === 0 ? (
            <Card className="col-span-2 shadow-elegant">
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No events scheduled yet.</p>
              </CardContent>
            </Card>
          ) : (
            events.map((event) => (
              <Card key={event.id} className="shadow-elegant border-gold/20 hover:border-gold/50 transition-all">
                <CardHeader>
                  <CardTitle className="font-serif text-primary">{event.title}</CardTitle>
                  <CardDescription className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    {new Date(event.event_date).toLocaleDateString()} at {new Date(event.event_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {event.description && (
                    <p className="text-sm">{event.description}</p>
                  )}
                  {event.location && (
                    <div className="flex items-start gap-2 text-sm">
                      <MapPin className="h-4 w-4 mt-0.5 text-gold" />
                      <div>
                        <p>{event.location}</p>
                        {event.location_url && (
                          <a href={event.location_url} target="_blank" rel="noopener noreferrer" className="text-gold hover:underline text-xs">
                            View on Map
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                  <div className="flex gap-2 pt-4">
                    <Button onClick={() => handleRSVP(event.id, "attending")} className="flex-1 bg-primary">
                      Attend
                    </Button>
                    <Button onClick={() => handleRSVP(event.id, "maybe")} variant="outline" className="flex-1">
                      Maybe
                    </Button>
                    <Button onClick={() => handleRSVP(event.id, "declined")} variant="outline" className="flex-1">
                      Decline
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
        </div>
      </div>
    </div>
  );
};

export default Events;
