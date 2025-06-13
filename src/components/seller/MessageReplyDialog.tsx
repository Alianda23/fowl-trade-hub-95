
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  senderName: string;
  senderEmail: string;
  content: string;
  productName: string;
  createdAt: string;
  reply?: string;
}

interface MessageReplyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  message: Message | null;
  onReplySubmitted: () => void;
}

const MessageReplyDialog = ({ open, onOpenChange, message, onReplySubmitted }: MessageReplyDialogProps) => {
  const [reply, setReply] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message || !reply.trim()) return;
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch(`http://localhost:5000/api/messages/${message.id}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          reply: reply.trim()
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "Reply Sent",
          description: "Your reply has been sent to the buyer.",
        });
        
        setReply("");
        onOpenChange(false);
        onReplySubmitted();
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to send reply",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error sending reply:", error);
      toast({
        title: "Error",
        description: "Failed to connect to server",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!message) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Reply to Message about "{message.productName}"</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm font-medium mb-2">From: {message.senderName} ({message.senderEmail})</p>
            <p className="text-sm text-gray-600 mb-2">
              Sent: {new Date(message.createdAt).toLocaleDateString()}
            </p>
            <div className="border-l-4 border-gray-300 pl-4">
              <p className="text-sm">{message.content}</p>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="reply" className="text-sm font-medium">
                Your Reply
              </label>
              <textarea
                id="reply"
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                placeholder="Type your reply here..."
                required
                disabled={isSubmitting}
                className="h-32 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" className="bg-sage-600 hover:bg-sage-700" disabled={isSubmitting}>
                {isSubmitting ? "Sending..." : "Send Reply"}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MessageReplyDialog;
