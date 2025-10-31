import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface Banner {
  id: string;
  title: string;
  image_url: string;
  link_url: string | null;
  display_order: number;
  is_active: boolean;
}

export default function AdminBanners() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      const { data, error } = await supabase
        .from("banners")
        .select("*")
        .order("display_order", { ascending: true });

      if (error) throw error;
      setBanners(data || []);
    } catch (error: any) {
      toast.error("Failed to load banners: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this banner?")) return;

    try {
      const { error } = await supabase.from("banners").delete().eq("id", id);
      if (error) throw error;
      toast.success("Banner deleted successfully");
      fetchBanners();
    } catch (error: any) {
      toast.error("Failed to delete banner: " + error.message);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const bannerData = {
      title: formData.get("title") as string,
      image_url: formData.get("image_url") as string,
      link_url: formData.get("link_url") as string || null,
      display_order: parseInt(formData.get("display_order") as string),
      is_active: formData.get("is_active") === "on",
    };

    try {
      if (editingBanner) {
        const { error } = await supabase
          .from("banners")
          .update(bannerData)
          .eq("id", editingBanner.id);
        if (error) throw error;
        toast.success("Banner updated successfully");
      } else {
        const { error } = await supabase.from("banners").insert(bannerData);
        if (error) throw error;
        toast.success("Banner created successfully");
      }
      setDialogOpen(false);
      setEditingBanner(null);
      fetchBanners();
    } catch (error: any) {
      toast.error("Failed to save banner: " + error.message);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Banners</h1>
            <p className="text-muted-foreground">
              Manage homepage banners and sliders
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingBanner(null)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Banner
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingBanner ? "Edit Banner" : "Add New Banner"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    name="title"
                    defaultValue={editingBanner?.title}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="image_url">Image URL</Label>
                  <Input
                    id="image_url"
                    name="image_url"
                    defaultValue={editingBanner?.image_url}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="link_url">Link URL</Label>
                  <Input
                    id="link_url"
                    name="link_url"
                    defaultValue={editingBanner?.link_url || ""}
                  />
                </div>
                <div>
                  <Label htmlFor="display_order">Display Order</Label>
                  <Input
                    id="display_order"
                    name="display_order"
                    type="number"
                    defaultValue={editingBanner?.display_order || 0}
                    required
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_active"
                    name="is_active"
                    defaultChecked={editingBanner?.is_active ?? true}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="is_active">Active</Label>
                </div>
                <div className="flex gap-2">
                  <Button type="submit" className="flex-1">
                    {editingBanner ? "Update" : "Create"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setDialogOpen(false);
                      setEditingBanner(null);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Preview</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Order</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : banners.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    No banners found
                  </TableCell>
                </TableRow>
              ) : (
                banners.map((banner) => (
                  <TableRow key={banner.id}>
                    <TableCell>
                      <img
                        src={banner.image_url}
                        alt={banner.title}
                        className="h-16 w-24 rounded object-cover"
                      />
                    </TableCell>
                    <TableCell className="font-medium">{banner.title}</TableCell>
                    <TableCell>{banner.display_order}</TableCell>
                    <TableCell>
                      {banner.is_active ? "Active" : "Inactive"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setEditingBanner(banner);
                            setDialogOpen(true);
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(banner.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </AdminLayout>
  );
}
