
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { MessageSquare, X } from "lucide-react";

interface Message {
  id: string;
  productName: string;
  sellerName: string;
  content: string;
  reply?: string;
  createdAt: string;
  repliedAt?: string;
}

interface BuyerMessagesPanelProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;
}

const BuyerMessagesPanel = ({ isOpen, onClose, userEmail }: BuyerMessagesPanelProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchMessages = async () => {
    if (!userEmail) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/user/messages?email=${userEmail}`, {
        method: 'GET',
        credentials: 'include'
      });
      
      const data = await response.json();
      
      if (data.success) {
        setMessages(data.messages || []);
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
    if (isOpen && userEmail) {
      fetchMessages();
    }
  }, [isOpen, userEmail]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-2xl max-h-[80vh] bg-white rounded-lg shadow-lg flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Your Messages
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex-1 overflow-auto p-4 space-y-4">
          {isLoading ? (
            <div className="text-center py-8">Loading messages...</div>
          ) : messages.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No messages yet. Send a message to sellers about their products!
            </div>
          ) : (
            messages.map((message) => (
              <div key={message.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-sm text-gray-600">
                      Re: {message.productName}
                    </h3>
                    <p className="text-xs text-gray-500">
                      To: {message.sellerName} • {new Date(message.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-sm font-medium mb-1">Your message:</p>
                  <p className="text-sm text-gray-700">{message.content}</p>
                </div>
                
                {message.reply ? (
                  <div className="bg-sage-50 p-3 rounded border-l-4 border-sage-600">
                    <p className="text-sm font-medium mb-1 text-sage-800">Seller's reply:</p>
                    <p className="text-sm text-sage-700">{message.reply}</p>
                    <p className="text-xs text-sage-600 mt-2">
                      Replied on {new Date(message.repliedAt!).toLocaleDateString()}
                    </p>
                  </div>
                ) : (
                  <div className="bg-yellow-50 p-3 rounded">
                    <p className="text-sm text-yellow-700">Waiting for seller's reply...</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default BuyerMessagesPanel;
