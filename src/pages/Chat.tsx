import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Chat = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
      setLoading(false);
    };

    checkUser();
  }, [navigate]);

  if (loading) {
    return <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navigation user={user} />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-serif font-bold text-primary mb-8">
          Family Chat
        </h1>
        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle className="font-serif">Chat Module</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Real-time family chat coming soon...</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Chat;
