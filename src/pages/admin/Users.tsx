
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const mockUsers = [
  { id: 1, name: "John Doe", email: "john@example.com", role: "Buyer", lastLogin: "2024-02-20" },
  { id: 2, name: "Jane Smith", email: "jane@example.com", role: "Seller", lastLogin: "2024-02-19" },
  { id: 3, name: "Bob Wilson", email: "bob@example.com", role: "Buyer", lastLogin: "2024-02-18" },
];

export default function Users() {
  const navigate = useNavigate();

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate("/admin")}>
          <ArrowLeft className="h-5 w-5" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">User Management</h1>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Last Login</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {mockUsers.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.role}</TableCell>
              <TableCell>{user.lastLogin}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
