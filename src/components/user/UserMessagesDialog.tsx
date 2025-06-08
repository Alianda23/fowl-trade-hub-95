
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";

interface UserMessage {
  id: string;
  content: string;
  productName: string;
  sellerName: string;
  isFromSeller: boolean;
  isRead: boolean;
  createdAt: string;
  parentMessageId?: string;
}

interface UserMessagesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMessagesLoaded: (unreadCount: number) => void;
}

const UserMessagesDialog = ({ open, onOpenChange, onMessagesLoaded }: UserMessagesDialogProps) => {
  const [messages, setMessages] = useState<UserMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  const fetchMessages = async () => {
    try {
      const userEmail = localStorage.getItem('userEmail');
      if (!userEmail) {
        toast({
          title: "Error",
          description: "Please log in to view messages",
          variant: "destructive",
        });
        return;
      }

      const response = await fetch(`http://localhost:5000/api/user/messages?email=${encodeURIComponent(userEmail)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setMessages(data.messages || []);
        
        // Count unread messages from sellers
        const unreadCount = data.messages.filter((msg: UserMessage) => 
          msg.isFromSeller && !msg.isRead
        ).length;
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
      const userEmail = localStorage.getItem('userEmail');
      const response = await fetch(`http://localhost:5000/api/user/messages/mark-read/${messageId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userEmail })
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Update the message in the list
        setMessages(messages.map(msg => 
          msg.id === messageId ? { ...msg, isRead: true } : msg
        ));
        
        // Update the unread count
        const updatedUnreadCount = messages.filter(msg => 
          msg.id !== messageId && msg.isFromSeller && !msg.isRead
        ).length;
        
        onMessagesLoaded(updatedUnreadCount);
      }
    } catch (error) {
      console.error("Error marking message as read:", error);
    }
  };

  // Group messages by conversation
  const groupedMessages = messages.reduce((groups: { [key: string]: UserMessage[] }, message) => {
    const key = message.parentMessageId || message.id;
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(message);
    return groups;
  }, {});

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Your Messages</DialogTitle>
        </DialogHeader>
        
        {isLoading ? (
          <div className="flex justify-center py-8">Loading messages...</div>
        ) : Object.keys(groupedMessages).length === 0 ? (
          <div className="py-8 text-center text-gray-500">No messages yet.</div>
        ) : (
          <div className="max-h-[400px] overflow-y-auto space-y-4">
            {Object.entries(groupedMessages).map(([conversationId, conversationMessages]) => {
              // Sort messages in conversation by date
              const sortedMessages = conversationMessages.sort((a, b) => 
                new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
              );
              
              return (
                <div key={conversationId} className="rounded-lg border p-4 space-y-3">
                  {sortedMessages.map((message, index) => (
                    <div 
                      key={message.id}
                      className={`p-3 rounded-lg ${
                        message.isFromSeller 
                          ? `bg-blue-50 border-l-4 border-blue-400 ${!message.isRead ? 'ring-2 ring-blue-200' : ''}` 
                          : 'bg-gray-50 border-l-4 border-gray-400'
                      }`}
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <div>
                          <p className="font-semibold">
                            {message.isFromSeller ? message.sellerName : 'You'}
                          </p>
                          <p className="text-sm text-gray-500">
                            About: {message.productName}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">
                            {new Date(message.createdAt).toLocaleString()}
                          </p>
                          {message.isFromSeller && !message.isRead && (
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
                      <p className="text-sm">{message.content}</p>
                      {message.isFromSeller && (
                        <p className="text-xs text-blue-600 mt-1">Reply from seller</p>
                      )}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default UserMessagesDialog;
