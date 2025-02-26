
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface User {
  id: string;
  name: string;
  email: string;
  lastLogin: string;
  role: "buyer" | "seller";
}

// Temporary mock data - replace with actual data later
const mockUsers: User[] = [
  {
    id: "1",
    name: "John Doe",
    email: "john@example.com",
    lastLogin: "2024-02-26 10:30 AM",
    role: "buyer"
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane@example.com",
    lastLogin: "2024-02-26 09:15 AM",
    role: "seller"
  }
];

export default function Users() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">System Users</h1>
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
