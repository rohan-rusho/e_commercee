import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, Star } from "lucide-react";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Review {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  comment: string | null;
  is_approved: boolean;
  created_at: string;
  products: {
    name: string;
  };
}

export default function AdminReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const { data, error } = await supabase
        .from("reviews")
        .select("*, products(name)")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setReviews(data || []);
    } catch (error: any) {
      toast.error("Failed to load reviews: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string, approve: boolean) => {
    try {
      const { error } = await supabase
        .from("reviews")
        .update({ is_approved: approve })
        .eq("id", id);

      if (error) throw error;
      toast.success(`Review ${approve ? "approved" : "rejected"}`);
      fetchReviews();
    } catch (error: any) {
      toast.error("Failed to update review: " + error.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this review?")) return;

    try {
      const { error } = await supabase.from("reviews").delete().eq("id", id);
      if (error) throw error;
      toast.success("Review deleted successfully");
      fetchReviews();
    } catch (error: any) {
      toast.error("Failed to delete review: " + error.message);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Reviews</h1>
          <p className="text-muted-foreground">Manage product reviews</p>
        </div>

        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Comment</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
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
              ) : reviews.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    No reviews found
                  </TableCell>
                </TableRow>
              ) : (
                reviews.map((review) => (
                  <TableRow key={review.id}>
                    <TableCell className="font-medium">
                      {review.products.name}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < review.rating
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-md truncate">
                      {review.comment || "-"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={review.is_approved ? "default" : "secondary"}
                      >
                        {review.is_approved ? "Approved" : "Pending"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(review.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {!review.is_approved && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleApprove(review.id, true)}
                          >
                            <Check className="h-4 w-4 text-green-600" />
                          </Button>
                        )}
                        {review.is_approved && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleApprove(review.id, false)}
                          >
                            <X className="h-4 w-4 text-red-600" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(review.id)}
                        >
                          <X className="h-4 w-4" />
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
