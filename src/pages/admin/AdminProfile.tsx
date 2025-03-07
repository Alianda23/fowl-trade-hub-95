
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, User, Mail, Phone, Briefcase } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface AdminData {
  admin_id: string;
  username: string;
  email: string;
  role: string;
  department: string;
  phone_number: string;
}

const AdminProfile = () => {
  const [adminData, setAdminData] = useState<AdminData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/admin/check-auth', {
          method: 'GET',
          credentials: 'include'
        });
        
        const data = await response.json();
        
        if (data.isAuthenticated) {
          setAdminData(data);
        } else {
          toast({
            title: "Authentication Error",
            description: "You are not logged in as an admin.",
            variant: "destructive",
          });
          navigate('/admin/login');
        }
      } catch (error) {
        console.error("Error fetching admin data:", error);
        toast({
          title: "Error",
          description: "Failed to fetch admin profile data.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdminData();
  }, [navigate, toast]);

  if (isLoading) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  }

  if (!adminData) {
    return <div className="flex min-h-screen items-center justify-center">No admin data available.</div>;
  }

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate("/admin")}>
          <ArrowLeft className="h-5 w-5" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">Admin Profile</h1>
      </div>

      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-sage-100 text-sage-600">
            <User className="h-10 w-10" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">{adminData.username}</h2>
            <p className="text-gray-600">{adminData.role} Admin</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3 border-b pb-3">
            <Mail className="h-5 w-5 text-gray-500" />
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p>{adminData.email}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 border-b pb-3">
            <Briefcase className="h-5 w-5 text-gray-500" />
            <div>
              <p className="text-sm text-gray-500">Department</p>
              <p>{adminData.department || "Not specified"}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 border-b pb-3">
            <Phone className="h-5 w-5 text-gray-500" />
            <div>
              <p className="text-sm text-gray-500">Phone Number</p>
              <p>{adminData.phone_number || "Not specified"}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;
