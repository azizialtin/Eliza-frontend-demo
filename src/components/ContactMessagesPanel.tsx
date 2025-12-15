import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Mail, MailOpen, Loader2 } from "lucide-react";
import { apiClient, ContactMessage } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export const ContactMessagesPanel = () => {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const data = await apiClient.getContactMessages(0, 50, false);
        setMessages(data);
      } catch (error) {
        toast({
          title: "Failed to load contact messages",
          description: "Please try again later.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [toast]);

  if (loading) {
    return (
      <Card className="rounded-3xl border-4 border-eliza-purple/40">
        <CardContent className="p-12 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-eliza-purple" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-3xl border-4 border-eliza-purple/40 overflow-hidden">
      <CardHeader className="bg-eliza-purple/10 pb-4">
        <CardTitle className="font-brand text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Mail className="h-6 w-6 text-eliza-purple" />
          Contact Messages
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <MailOpen className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="font-brand text-gray-600">No contact messages yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-brand font-semibold">Name</TableHead>
                  <TableHead className="font-brand font-semibold">Email</TableHead>
                  <TableHead className="font-brand font-semibold">Message</TableHead>
                  <TableHead className="font-brand font-semibold">Date</TableHead>
                  <TableHead className="font-brand font-semibold">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {messages.map((message) => (
                  <TableRow key={message.id}>
                    <TableCell className="font-brand font-medium">{message.name}</TableCell>
                    <TableCell className="font-brand text-sm text-gray-600">{message.email}</TableCell>
                    <TableCell className="font-brand text-sm max-w-md truncate">
                      {message.message}
                    </TableCell>
                    <TableCell className="font-brand text-sm text-gray-500">
                      {message.submitted_at 
                        ? new Date(message.submitted_at).toLocaleDateString()
                        : '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {message.is_read ? (
                          <Badge variant="secondary" className="font-brand">
                            Read
                          </Badge>
                        ) : (
                          <Badge variant="default" className="font-brand bg-eliza-purple">
                            Unread
                          </Badge>
                        )}
                        {message.is_responded && (
                          <Badge variant="outline" className="font-brand">
                            Responded
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
