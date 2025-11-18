import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { Image, Plus, FolderOpen, Upload, Trash2 } from "lucide-react";

const Gallery = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [albums, setAlbums] = useState<any[]>([]);
  const [selectedAlbum, setSelectedAlbum] = useState<any>(null);
  const [photos, setPhotos] = useState<any[]>([]);
  const [userRole, setUserRole] = useState<string>("");
  const [openAlbum, setOpenAlbum] = useState(false);
  const [albumData, setAlbumData] = useState({ title: "", description: "" });
  const [openPhotoUpload, setOpenPhotoUpload] = useState(false);
  const [photoCaption, setPhotoCaption] = useState("");
  const [uploading, setUploading] = useState(false);

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
      
      await loadAlbums();
      setLoading(false);
    };

    checkUser();
  }, [navigate]);

  const loadAlbums = async () => {
    const { data, error } = await supabase
      .from("gallery_albums")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) {
      setAlbums(data || []);
    }
  };

  const loadPhotos = async (albumId: string) => {
    const { data, error } = await supabase
      .from("gallery_photos")
      .select("*")
      .eq("album_id", albumId)
      .order("created_at", { ascending: false });

    if (!error) {
      setPhotos(data || []);
    }
  };

  const handleCreateAlbum = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { error } = await supabase.from("gallery_albums").insert({
      ...albumData,
      created_by: user.id,
    });

    if (error) {
      toast({ title: "Error creating album", variant: "destructive" });
      return;
    }

    toast({ title: "Album created successfully!" });
    setOpenAlbum(false);
    setAlbumData({ title: "", description: "" });
    loadAlbums();
  };

  const viewAlbum = (album: any) => {
    setSelectedAlbum(album);
    loadPhotos(album.id);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !selectedAlbum) return;
    
    setUploading(true);
    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${Math.random()}.${fileExt}`;

    try {
      const { error: uploadError, data } = await supabase.storage
        .from('gallery-photos')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('gallery-photos')
        .getPublicUrl(fileName);

      const { error: dbError } = await supabase
        .from('gallery_photos')
        .insert({
          album_id: selectedAlbum.id,
          image_url: publicUrl,
          caption: photoCaption,
          uploaded_by: user.id,
        });

      if (dbError) throw dbError;

      toast({ title: "Photo uploaded successfully!" });
      setOpenPhotoUpload(false);
      setPhotoCaption("");
      loadPhotos(selectedAlbum.id);
    } catch (error: any) {
      toast({ title: "Error uploading photo", description: error.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleDeletePhoto = async (photo: any) => {
    if (photo.uploaded_by !== user.id && userRole !== "admin") {
      toast({ title: "You can only delete your own photos", variant: "destructive" });
      return;
    }

    try {
      const fileName = photo.image_url.split('/').slice(-2).join('/');
      
      await supabase.storage.from('gallery-photos').remove([fileName]);
      
      const { error } = await supabase
        .from('gallery_photos')
        .delete()
        .eq('id', photo.id);

      if (error) throw error;

      toast({ title: "Photo deleted successfully!" });
      loadPhotos(selectedAlbum.id);
    } catch (error: any) {
      toast({ title: "Error deleting photo", description: error.message, variant: "destructive" });
    }
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
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-serif font-bold text-primary">Family Gallery</h1>
            {selectedAlbum && (
              <Button variant="link" onClick={() => setSelectedAlbum(null)} className="text-gold p-0">
                ← Back to Albums
              </Button>
            )}
          </div>
          {userRole === "admin" && !selectedAlbum && (
            <Dialog open={openAlbum} onOpenChange={setOpenAlbum}>
              <DialogTrigger asChild>
                <Button className="bg-gold hover:bg-gold/90">
                  <Plus className="mr-2 h-4 w-4" /> Create Album
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="font-serif text-primary">New Album</DialogTitle>
                  <DialogDescription>Create a new photo album</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateAlbum} className="space-y-4">
                  <div>
                    <Label>Album Title</Label>
                    <Input
                      value={albumData.title}
                      onChange={(e) => setAlbumData({ ...albumData, title: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Input
                      value={albumData.description}
                      onChange={(e) => setAlbumData({ ...albumData, description: e.target.value })}
                    />
                  </div>
                  <Button type="submit" className="w-full bg-primary">Create Album</Button>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {!selectedAlbum ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {albums.length === 0 ? (
              <Card className="col-span-3 shadow-elegant">
                <CardContent className="py-12 text-center">
                  <FolderOpen className="mx-auto h-12 w-12 text-gold mb-4" />
                  <p className="text-muted-foreground">No albums yet. Create your first album!</p>
                </CardContent>
              </Card>
            ) : (
              albums.map((album) => (
                <Card 
                  key={album.id} 
                  className="shadow-elegant border-gold/20 hover:border-gold/50 transition-all cursor-pointer"
                  onClick={() => viewAlbum(album)}
                >
                  <CardHeader>
                    <div className="h-40 bg-gradient-warm rounded-md flex items-center justify-center mb-4">
                      <Image className="h-16 w-16 text-white/50" />
                    </div>
                    <CardTitle className="font-serif text-primary">{album.title}</CardTitle>
                    {album.description && (
                      <CardDescription>{album.description}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground">
                      Created {new Date(album.created_at).toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        ) : (
          <div>
            <Card className="shadow-elegant mb-6">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="font-serif text-primary">{selectedAlbum.title}</CardTitle>
                    {selectedAlbum.description && (
                      <CardDescription>{selectedAlbum.description}</CardDescription>
                    )}
                  </div>
                  <Dialog open={openPhotoUpload} onOpenChange={setOpenPhotoUpload}>
                    <DialogTrigger asChild>
                      <Button className="bg-secondary hover:bg-secondary/90 text-surface">
                        <Upload className="mr-2 h-4 w-4" /> Upload Photo
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle className="font-serif text-primary">Upload Photo</DialogTitle>
                        <DialogDescription>Add a new photo to {selectedAlbum.title}</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label>Photo</Label>
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={handlePhotoUpload}
                            disabled={uploading}
                          />
                        </div>
                        <div>
                          <Label>Caption (optional)</Label>
                          <Textarea
                            value={photoCaption}
                            onChange={(e) => setPhotoCaption(e.target.value)}
                            placeholder="Add a caption for your photo..."
                            disabled={uploading}
                          />
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
            </Card>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {photos.length === 0 ? (
                <Card className="col-span-4 shadow-elegant">
                  <CardContent className="py-12 text-center">
                    <Image className="mx-auto h-12 w-12 text-gold mb-4" />
                    <p className="text-muted-foreground">No photos in this album yet.</p>
                  </CardContent>
                </Card>
              ) : (
                photos.map((photo) => (
                  <Card key={photo.id} className="shadow-elegant border-primary/20 hover:border-secondary/50 transition-all overflow-hidden group relative">
                    <div className="aspect-square bg-gradient-subtle flex items-center justify-center overflow-hidden">
                      {photo.image_url ? (
                        <img src={photo.image_url} alt={photo.caption || "Gallery photo"} className="w-full h-full object-cover" />
                      ) : (
                        <Image className="h-12 w-12 text-muted-foreground" />
                      )}
                    </div>
                    {(photo.uploaded_by === user?.id || userRole === "admin") && (
                      <button
                        onClick={() => handleDeletePhoto(photo)}
                        className="absolute top-2 right-2 bg-error/90 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                    {photo.caption && (
                      <CardContent className="p-2">
                        <p className="text-xs">{photo.caption}</p>
                      </CardContent>
                    )}
                  </Card>
                ))
              )}
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
};

export default Gallery;
