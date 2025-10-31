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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Coupon {
  id: string;
  code: string;
  discount_type: string;
  discount_value: number;
  min_order_amount: number;
  max_uses: number | null;
  used_count: number;
  is_active: boolean;
  expire_at: string | null;
}

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const { data, error } = await supabase
        .from("coupons")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCoupons(data || []);
    } catch (error: any) {
      toast.error("Failed to load coupons: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this coupon?")) return;

    try {
      const { error } = await supabase.from("coupons").delete().eq("id", id);
      if (error) throw error;
      toast.success("Coupon deleted successfully");
      fetchCoupons();
    } catch (error: any) {
      toast.error("Failed to delete coupon: " + error.message);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const expireAt = formData.get("expire_at");
    const couponData = {
      code: formData.get("code") as string,
      discount_type: formData.get("discount_type") as string,
      discount_value: parseFloat(formData.get("discount_value") as string),
      min_order_amount: parseFloat(formData.get("min_order_amount") as string),
      max_uses: formData.get("max_uses")
        ? parseInt(formData.get("max_uses") as string)
        : null,
      expire_at: expireAt ? (expireAt as string) : null,
      is_active: formData.get("is_active") === "on",
    };

    try {
      if (editingCoupon) {
        const { error } = await supabase
          .from("coupons")
          .update(couponData)
          .eq("id", editingCoupon.id);
        if (error) throw error;
        toast.success("Coupon updated successfully");
      } else {
        const { error } = await supabase.from("coupons").insert(couponData);
        if (error) throw error;
        toast.success("Coupon created successfully");
      }
      setDialogOpen(false);
      setEditingCoupon(null);
      fetchCoupons();
    } catch (error: any) {
      toast.error("Failed to save coupon: " + error.message);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Coupons</h1>
            <p className="text-muted-foreground">Manage discount codes</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingCoupon(null)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Coupon
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingCoupon ? "Edit Coupon" : "Add New Coupon"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="code">Coupon Code</Label>
                  <Input
                    id="code"
                    name="code"
                    defaultValue={editingCoupon?.code}
                    required
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="discount_type">Discount Type</Label>
                    <Select
                      name="discount_type"
                      defaultValue={editingCoupon?.discount_type || "percentage"}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">Percentage</SelectItem>
                        <SelectItem value="flat">Flat Amount</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="discount_value">Discount Value</Label>
                    <Input
                      id="discount_value"
                      name="discount_value"
                      type="number"
                      step="0.01"
                      defaultValue={editingCoupon?.discount_value}
                      required
                    />
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="min_order_amount">Min Order Amount</Label>
                    <Input
                      id="min_order_amount"
                      name="min_order_amount"
                      type="number"
                      step="0.01"
                      defaultValue={editingCoupon?.min_order_amount || 0}
                    />
                  </div>
                  <div>
                    <Label htmlFor="max_uses">Max Uses</Label>
                    <Input
                      id="max_uses"
                      name="max_uses"
                      type="number"
                      defaultValue={editingCoupon?.max_uses || ""}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="expire_at">Expiry Date</Label>
                  <Input
                    id="expire_at"
                    name="expire_at"
                    type="datetime-local"
                    defaultValue={
                      editingCoupon?.expire_at
                        ? new Date(editingCoupon.expire_at)
                            .toISOString()
                            .slice(0, 16)
                        : ""
                    }
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_active"
                    name="is_active"
                    defaultChecked={editingCoupon?.is_active ?? true}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="is_active">Active</Label>
                </div>
                <div className="flex gap-2">
                  <Button type="submit" className="flex-1">
                    {editingCoupon ? "Update" : "Create"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setDialogOpen(false);
                      setEditingCoupon(null);
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
                <TableHead>Code</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Used</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : coupons.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    No coupons found
                  </TableCell>
                </TableRow>
              ) : (
                coupons.map((coupon) => (
                  <TableRow key={coupon.id}>
                    <TableCell className="font-mono font-medium">
                      {coupon.code}
                    </TableCell>
                    <TableCell className="capitalize">
                      {coupon.discount_type}
                    </TableCell>
                    <TableCell>
                      {coupon.discount_type === "percentage"
                        ? `${coupon.discount_value}%`
                        : `$${coupon.discount_value}`}
                    </TableCell>
                    <TableCell>
                      {coupon.used_count}
                      {coupon.max_uses ? `/${coupon.max_uses}` : ""}
                    </TableCell>
                    <TableCell>
                      {coupon.is_active ? "Active" : "Inactive"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setEditingCoupon(coupon);
                            setDialogOpen(true);
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(coupon.id)}
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
