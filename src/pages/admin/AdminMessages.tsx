import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Message {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  is_resolved: boolean;
  created_at: string;
}

export default function AdminMessages() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from("contact_messages")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setMessages(data || []);
    } catch (error: any) {
      toast.error("Failed to load messages: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (id: string) => {
    try {
      const { error } = await supabase
        .from("contact_messages")
        .update({ is_resolved: true })
        .eq("id", id);

      if (error) throw error;
      toast.success("Message marked as resolved");
      fetchMessages();
    } catch (error: any) {
      toast.error("Failed to update message: " + error.message);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Messages</h1>
          <p className="text-muted-foreground">View customer inquiries</p>
        </div>

        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Message</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : messages.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">
                    No messages found
                  </TableCell>
                </TableRow>
              ) : (
                messages.map((message) => (
                  <TableRow key={message.id}>
                    <TableCell className="font-medium">{message.name}</TableCell>
                    <TableCell>{message.email}</TableCell>
                    <TableCell>{message.subject}</TableCell>
                    <TableCell className="max-w-md truncate">
                      {message.message}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={message.is_resolved ? "default" : "secondary"}
                      >
                        {message.is_resolved ? "Resolved" : "Pending"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(message.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      {!message.is_resolved && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleResolve(message.id)}
                        >
                          <Check className="h-4 w-4 text-green-600" />
                        </Button>
                      )}
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
