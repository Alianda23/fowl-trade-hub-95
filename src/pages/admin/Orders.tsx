
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const mockOrders = [
  { id: "ORD001", customer: "John Doe", total: 2500, status: "Completed", date: "2024-02-20" },
  { id: "ORD002", customer: "Jane Smith", total: 1800, status: "Pending", date: "2024-02-19" },
  { id: "ORD003", customer: "Bob Wilson", total: 3200, status: "Processing", date: "2024-02-18" },
];

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "completed":
      return "bg-green-500";
    case "pending":
      return "bg-yellow-500";
    case "processing":
      return "bg-blue-500";
    default:
      return "bg-gray-500";
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
            <TableHead>Total (KES)</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {mockOrders.map((order) => (
            <TableRow key={order.id}>
              <TableCell>{order.id}</TableCell>
              <TableCell>{order.customer}</TableCell>
              <TableCell>{order.total}</TableCell>
              <TableCell>
                <Badge className={`${getStatusColor(order.status)} text-white`}>
                  {order.status}
                </Badge>
              </TableCell>
              <TableCell>{order.date}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
