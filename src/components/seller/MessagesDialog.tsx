
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface MessagesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const MessagesDialog = ({ open, onOpenChange }: MessagesDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Customer Messages</DialogTitle>
          <DialogDescription>
            View and respond to customer inquiries
          </DialogDescription>
        </DialogHeader>
        <div className="min-h-[200px] text-center text-gray-500">
          No messages yet
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MessagesDialog;
