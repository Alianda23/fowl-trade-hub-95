
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  senderName: string;
  senderEmail: string;
  message: string;
  productName: string;
  createdAt: string;
  isRead: boolean;
}

interface MessagesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const MessagesDialog = ({ open, onOpenChange }: MessagesDialogProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  // Fetch messages when dialog opens
  useEffect(() => {
    if (open) {
      fetchMessages();
    }
  }, [open]);
  
  const fetchMessages = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/seller/messages', {
        method: 'GET',
        credentials: 'include'
      });
      
      const data = await response.json();
      
      if (data.success) {
        setMessages(data.messages || []);
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to fetch messages",
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
  
  const markAsRead = async (messageId: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/seller/messages/${messageId}/read`, {
        method: 'PUT',
        credentials: 'include'
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Update messages locally
        setMessages(prevMessages => 
          prevMessages.map(msg => 
            msg.id === messageId ? { ...msg, isRead: true } : msg
          )
        );
      }
    } catch (error) {
      console.error("Error marking message as read:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Customer Messages</DialogTitle>
          <DialogDescription>
            View and respond to customer inquiries
          </DialogDescription>
        </DialogHeader>
        
        {isLoading ? (
          <div className="flex min-h-[200px] items-center justify-center">
            <p>Loading messages...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="min-h-[200px] flex items-center justify-center text-center text-gray-500">
            No messages yet
          </div>
        ) : (
          <div className="max-h-[400px] overflow-y-auto space-y-4">
            {messages.map(message => (
              <div 
                key={message.id} 
                className={`p-4 rounded-lg border ${message.isRead ? 'bg-gray-50' : 'bg-sage-50 border-sage-200'}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-semibold">{message.senderName}</h4>
                    <p className="text-sm text-gray-600">{message.senderEmail}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">
                      {new Date(message.createdAt).toLocaleString()}
                    </p>
                    {!message.isRead && (
                      <span className="inline-block px-2 py-1 text-xs bg-sage-600 text-white rounded-full">
                        New
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-sm mb-2">About: <span className="font-medium">{message.productName}</span></p>
                <p className="text-sm">{message.message}</p>
                <div className="mt-3 flex justify-end gap-2">
                  {!message.isRead && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => markAsRead(message.id)}
                    >
                      Mark as Read
                    </Button>
                  )}
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => window.location.href = `mailto:${message.senderEmail}?subject=Re: Inquiry about ${message.productName}`}
                  >
                    Reply via Email
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default MessagesDialog;
