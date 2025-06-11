
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";

interface Message {
  id: string;
  senderName: string;
  senderEmail: string;
  message: string;
  productName: string;
  isRead: boolean;
  createdAt: string;
}

interface MessagesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMessagesLoaded: (unreadCount: number) => void;
}

const MessagesDialog = ({ open, onOpenChange, onMessagesLoaded }: MessagesDialogProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [isSendingReply, setIsSendingReply] = useState(false);
  
  const fetchMessages = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/seller/messages', {
        method: 'GET',
        credentials: 'include'
      });
      
      const data = await response.json();
      
      if (data.success) {
        setMessages(data.messages || []);
        
        // Count unread messages
        const unreadCount = data.messages.filter((msg: Message) => !msg.isRead).length;
        onMessagesLoaded(unreadCount);
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch messages",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast({
        title: "Error",
        description: "Failed to connect to server",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    if (open) {
      fetchMessages();
    }
  }, [open]);
  
  const handleMarkAsRead = async (messageId: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/seller/messages/mark-read/${messageId}`, {
        method: 'PUT',
        credentials: 'include'
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Update the message in the list
        setMessages(messages.map(msg => 
          msg.id === messageId ? { ...msg, isRead: true } : msg
        ));
        
        // Update the unread count
        const updatedUnreadCount = messages.filter(msg => 
          msg.id !== messageId && !msg.isRead
        ).length;
        
        onMessagesLoaded(updatedUnreadCount);
      } else {
        toast({
          title: "Error",
          description: "Failed to mark message as read",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error marking message as read:", error);
      toast({
        title: "Error",
        description: "Failed to connect to server",
        variant: "destructive",
      });
    }
  };

  const handleStartReply = (messageId: string) => {
    setReplyingTo(messageId);
    setReplyContent("");
  };

  const handleCancelReply = () => {
    setReplyingTo(null);
    setReplyContent("");
  };

  const handleSendReply = async (originalMessageId: string, senderEmail: string, productName: string) => {
    if (!replyContent.trim()) {
      toast({
        title: "Error",
        description: "Reply message cannot be empty",
        variant: "destructive",
      });
      return;
    }

    setIsSendingReply(true);
    
    try {
      const response = await fetch('http://localhost:5000/api/seller/messages/reply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          originalMessageId,
          replyContent: replyContent.trim(),
          recipientEmail: senderEmail,
          productName
        }),
        credentials: 'include'
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "Reply Sent",
          description: "Your reply has been sent successfully",
        });
        
        // Mark original message as read
        handleMarkAsRead(originalMessageId);
        
        // Reset reply state
        setReplyingTo(null);
        setReplyContent("");
        
        // Refresh messages
        fetchMessages();
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
      setIsSendingReply(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Customer Messages</DialogTitle>
        </DialogHeader>
        
        {isLoading ? (
          <div className="flex justify-center py-8">Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className="py-8 text-center text-gray-500">No messages yet.</div>
        ) : (
          <div className="max-h-[400px] overflow-y-auto space-y-4">
            {messages.map((message) => (
              <div 
                key={message.id}
                className={`rounded-lg border p-4 ${!message.isRead ? 'bg-sage-50 border-sage-200' : ''}`}
              >
                <div className="mb-2 flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{message.senderName}</p>
                    <p className="text-sm text-gray-500">{message.senderEmail}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">
                      {new Date(message.createdAt).toLocaleString()}
                    </p>
                    {!message.isRead && (
                      <Button 
                        variant="outline"
                        size="sm"
                        className="mt-1 h-6 text-xs"
                        onClick={() => handleMarkAsRead(message.id)}
                      >
                        Mark as Read
                      </Button>
                    )}
                  </div>
                </div>
                <p className="mb-2 text-sm text-gray-600">
                  <span className="font-medium">About:</span> {message.productName}
                </p>
                <p>{message.message}</p>
                
                {replyingTo === message.id ? (
                  <div className="mt-4 space-y-2 border-t pt-3">
                    <p className="text-sm font-medium">Your Reply:</p>
                    <textarea
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      placeholder="Type your reply here..."
                      rows={3}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    />
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={handleCancelReply}
                        disabled={isSendingReply}
                      >
                        Cancel
                      </Button>
                      <Button 
                        size="sm"
                        className="bg-sage-600 hover:bg-sage-700"
                        onClick={() => handleSendReply(message.id, message.senderEmail, message.productName)}
                        disabled={isSendingReply}
                      >
                        {isSendingReply ? "Sending..." : "Send Reply"}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-2 flex justify-end">
                    <Button 
                      variant="ghost"
                      size="sm"
                      className="text-sage-600 hover:bg-sage-50 hover:text-sage-700"
                      onClick={() => handleStartReply(message.id)}
                    >
                      Reply
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default MessagesDialog;
