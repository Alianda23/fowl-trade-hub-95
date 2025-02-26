
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface Order {
  id: string;
  customerName: string;
  productName: string;
  date: string;
  status: "pending" | "dispatched" | "cancelled" | "collected";
  total: number;
}

// Temporary mock data - replace with actual data later
const mockOrders: Order[] = [
  {
    id: "1",
    customerName: "John Doe",
    productName: "Day-old Chicks",
    date: "2024-02-26",
    status: "pending",
    total: 1000
  },
  {
    id: "2",
    customerName: "Jane Smith",
    productName: "Broilers",
    date: "2024-02-25",
    status: "dispatched",
    total: 2250
  }
];

const getStatusColor = (status: Order["status"]) => {
  switch (status) {
    case "pending":
      return "secondary";
    case "dispatched":
      return "default";
    case "cancelled":
      return "destructive";
    case "collected":
      return "outline";
    default:
      return "default";
  }
};

export default function Orders() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Orders Management</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order ID</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Product</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Total (KES)</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {mockOrders.map((order) => (
            <TableRow key={order.id}>
              <TableCell>{order.id}</TableCell>
              <TableCell>{order.customerName}</TableCell>
              <TableCell>{order.productName}</TableCell>
              <TableCell>{order.date}</TableCell>
              <TableCell>{order.total}</TableCell>
              <TableCell>
                <Badge variant={getStatusColor(order.status)}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
