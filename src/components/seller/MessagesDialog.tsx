
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Reply } from "lucide-react";
import MessageReplyDialog from "./MessageReplyDialog";

interface Message {
  id: string;
  senderName: string;
  senderEmail: string;
  content: string;
  productName: string;
  createdAt: string;
  reply?: string;
  repliedAt?: string;
}

interface MessagesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMessagesLoaded?: (count: number) => void;
}

const MessagesDialog = ({ open, onOpenChange, onMessagesLoaded }: MessagesDialogProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [showReplyDialog, setShowReplyDialog] = useState(false);
  const { toast } = useToast();

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
        const unreadCount = data.messages?.filter((msg: Message) => !msg.reply).length || 0;
        onMessagesLoaded?.(unreadCount);
      } else {
        toast({
          title: "Error",
          description: "Failed to load messages",
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

  const handleReply = (message: Message) => {
    setSelectedMessage(message);
    setShowReplyDialog(true);
  };

  const handleReplySubmitted = () => {
    fetchMessages(); // Refresh messages after reply
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Customer Messages</DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 overflow-auto space-y-4">
            {isLoading ? (
              <div className="text-center py-8">Loading messages...</div>
            ) : messages.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No messages from customers yet.
              </div>
            ) : (
              messages.map((message) => (
                <div key={message.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">From: {message.senderName}</h3>
                      <p className="text-sm text-gray-600">{message.senderEmail}</p>
                      <p className="text-sm text-gray-500">
                        Re: {message.productName} • {new Date(message.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    {!message.reply && (
                      <Button
                        size="sm"
                        onClick={() => handleReply(message)}
                        className="bg-sage-600 hover:bg-sage-700"
                      >
                        <Reply className="h-4 w-4 mr-1" />
                        Reply
                      </Button>
                    )}
                  </div>
                  
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-sm">{message.content}</p>
                  </div>
                  
                  {message.reply && (
                    <div className="bg-sage-50 p-3 rounded border-l-4 border-sage-600">
                      <p className="text-sm font-medium mb-1 text-sage-800">Your reply:</p>
                      <p className="text-sm text-sage-700">{message.reply}</p>
                      <p className="text-xs text-sage-600 mt-2">
                        Sent on {new Date(message.repliedAt!).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      <MessageReplyDialog
        open={showReplyDialog}
        onOpenChange={setShowReplyDialog}
        message={selectedMessage}
        onReplySubmitted={handleReplySubmitted}
      />
    </>
  );
};

export default MessagesDialog;
