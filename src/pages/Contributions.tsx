import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { DollarSign, TrendingUp, Users, Calendar } from "lucide-react";

const Contributions = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [contributions, setContributions] = useState<any[]>([]);
  const [stats, setStats] = useState({ total: 0, thisMonth: 0, count: 0 });
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    amount: "",
    contribution_type: "",
    payment_method: "mpesa",
    notes: "",
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
        
        setUser(profile);
        await loadContributions(session.user.id);
      }
      
      setLoading(false);
    };

    checkUser();
  }, [navigate]);

  const loadContributions = async (userId: string) => {
    const { data, error } = await supabase
      .from("contributions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Error loading contributions", variant: "destructive" });
      return;
    }

    setContributions(data || []);
    
    const total = data?.reduce((sum, c) => sum + Number(c.amount), 0) || 0;
    const thisMonth = data?.filter(c => {
      const date = new Date(c.created_at);
      const now = new Date();
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    }).reduce((sum, c) => sum + Number(c.amount), 0) || 0;

    setStats({ total, thisMonth, count: data?.length || 0 });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { error } = await supabase.from("contributions").insert({
      user_id: user.id,
      amount: Number(formData.amount),
      contribution_type: formData.contribution_type,
      payment_method: formData.payment_method,
      notes: formData.notes,
      status: "pending",
    });

    if (error) {
      toast({ title: "Error creating contribution", variant: "destructive" });
      return;
    }

    toast({ title: "Contribution submitted successfully!" });
    setOpen(false);
    setFormData({ amount: "", contribution_type: "", payment_method: "mpesa", notes: "" });
    loadContributions(user.id);
  };

  if (loading) {
    return <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navigation user={user} />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-serif font-bold text-primary">Family Contributions</h1>
          {user ? (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gold hover:bg-gold/90">Make Contribution</Button>
              </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="font-serif text-primary">New Contribution</DialogTitle>
                <DialogDescription>Submit your family contribution</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label>Amount (KES)</Label>
                  <Input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label>Type</Label>
                  <Select value={formData.contribution_type} onValueChange={(value) => setFormData({ ...formData, contribution_type: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="annual">Annual</SelectItem>
                      <SelectItem value="event">Event</SelectItem>
                      <SelectItem value="emergency">Emergency</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Payment Method</Label>
                  <Select value={formData.payment_method} onValueChange={(value) => setFormData({ ...formData, payment_method: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mpesa">M-Pesa</SelectItem>
                      <SelectItem value="bank">Bank Transfer</SelectItem>
                      <SelectItem value="cash">Cash</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Notes (Optional)</Label>
                  <Textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  />
                </div>
                <Button type="submit" className="w-full bg-primary">Submit</Button>
              </form>
            </DialogContent>
          </Dialog>
          ) : (
            <Button onClick={() => navigate("/auth")} className="bg-gold hover:bg-gold/90">
              Login to Contribute
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="shadow-elegant border-gold/20">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium">Total Contributed</CardTitle>
              <DollarSign className="h-4 w-4 text-gold" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">KES {stats.total.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card className="shadow-elegant border-gold/20">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              <Calendar className="h-4 w-4 text-gold" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">KES {stats.thisMonth.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card className="shadow-elegant border-gold/20">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium">Total Count</CardTitle>
              <TrendingUp className="h-4 w-4 text-gold" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{stats.count}</div>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle className="font-serif text-primary">Your Contributions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {!user ? (
                <p className="text-muted-foreground text-center py-8">Please login to view your contributions</p>
              ) : contributions.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No contributions yet. Make your first contribution!</p>
              ) : (
                contributions.map((contribution) => (
                  <div key={contribution.id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:border-gold/50 transition-colors">
                    <div>
                      <p className="font-semibold text-primary">KES {Number(contribution.amount).toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground capitalize">{contribution.contribution_type} • {contribution.payment_method}</p>
                      {contribution.notes && <p className="text-xs text-muted-foreground mt-1">{contribution.notes}</p>}
                    </div>
                    <div className="text-right">
                      <span className={`text-xs px-2 py-1 rounded ${contribution.status === 'confirmed' ? 'bg-green-500/20 text-green-700' : 'bg-yellow-500/20 text-yellow-700'}`}>
                        {contribution.status}
                      </span>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(contribution.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Contributions;
