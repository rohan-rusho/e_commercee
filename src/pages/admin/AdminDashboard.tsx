import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Package, ShoppingCart, Users } from "lucide-react";
import { toast } from "sonner";

interface Stats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalUsers: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalUsers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [ordersRes, productsRes, usersRes] = await Promise.all([
        supabase.from("orders").select("total_amount"),
        supabase.from("products").select("id", { count: "exact", head: true }),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
      ]);

      if (ordersRes.error) throw ordersRes.error;
      if (productsRes.error) throw productsRes.error;
      if (usersRes.error) throw usersRes.error;

      const totalRevenue = ordersRes.data?.reduce(
        (sum, order) => sum + Number(order.total_amount),
        0
      ) || 0;

      setStats({
        totalRevenue,
        totalOrders: ordersRes.data?.length || 0,
        totalProducts: productsRes.count || 0,
        totalUsers: usersRes.count || 0,
      });
    } catch (error: any) {
      toast.error("Failed to load stats: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: "Total Revenue",
      value: `$${stats.totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: "text-green-600",
    },
    {
      title: "Total Orders",
      value: stats.totalOrders.toString(),
      icon: ShoppingCart,
      color: "text-blue-600",
    },
    {
      title: "Total Products",
      value: stats.totalProducts.toString(),
      icon: Package,
      color: "text-purple-600",
    },
    {
      title: "Total Users",
      value: stats.totalUsers.toString(),
      icon: Users,
      color: "text-orange-600",
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome to your admin dashboard
          </p>
        </div>

        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="h-4 w-20 bg-muted animate-pulse rounded" />
                </CardHeader>
                <CardContent>
                  <div className="h-8 w-24 bg-muted animate-pulse rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {statCards.map((stat) => {
              const Icon = stat.icon;
              return (
                <Card key={stat.title}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {stat.title}
                    </CardTitle>
                    <Icon className={`h-4 w-4 ${stat.color}`} />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
