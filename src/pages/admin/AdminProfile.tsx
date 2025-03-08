
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, User, Mail, Phone, Briefcase, Save, X, Edit } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";

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
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<AdminData>>({});
  const navigate = useNavigate();
  const { toast } = useToast();

  const fetchAdminData = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/check-auth', {
        method: 'GET',
        credentials: 'include'
      });
      
      const data = await response.json();
      
      if (data.isAuthenticated) {
        setAdminData(data);
        setFormData({
          username: data.username,
          department: data.department || "",
          phone_number: data.phone_number || ""
        });
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

  useEffect(() => {
    fetchAdminData();
  }, [navigate, toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/update-profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "Profile Updated",
          description: "Your profile has been updated successfully.",
        });
        setIsEditing(false);
        fetchAdminData(); // Refresh data
      } else {
        toast({
          title: "Update Failed",
          description: data.message || "Failed to update profile.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "Failed to connect to server.",
        variant: "destructive",
      });
    }
  };

  const cancelEdit = () => {
    // Reset form data to original values
    if (adminData) {
      setFormData({
        username: adminData.username,
        department: adminData.department || "",
        phone_number: adminData.phone_number || ""
      });
    }
    setIsEditing(false);
  };

  if (isLoading) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  }

  if (!adminData) {
    return <div className="flex min-h-screen items-center justify-center">No admin data available.</div>;
  }

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate("/admin")}>
            <ArrowLeft className="h-5 w-5" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">Admin Profile</h1>
        </div>
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)} className="gap-2">
            <Edit className="h-4 w-4" />
            Edit Profile
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button onClick={cancelEdit} variant="outline" className="gap-2">
              <X className="h-4 w-4" />
              Cancel
            </Button>
            <Button onClick={handleSave} className="gap-2 bg-sage-600 hover:bg-sage-700">
              <Save className="h-4 w-4" />
              Save Changes
            </Button>
          </div>
        )}
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
          {isEditing ? (
            <>
              <div className="space-y-2 border-b pb-3">
                <label htmlFor="username" className="text-sm text-gray-500">Username</label>
                <Input
                  id="username"
                  name="username"
                  value={formData.username || ''}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="space-y-2 border-b pb-3">
                <label htmlFor="department" className="text-sm text-gray-500">Department</label>
                <Input
                  id="department"
                  name="department"
                  value={formData.department || ''}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="space-y-2 border-b pb-3">
                <label htmlFor="phone_number" className="text-sm text-gray-500">Phone Number</label>
                <Input
                  id="phone_number"
                  name="phone_number"
                  value={formData.phone_number || ''}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="flex items-center gap-3 border-b pb-3">
                <Mail className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p>{adminData.email}</p>
                  <p className="text-sm text-gray-500 mt-1">(Email cannot be changed)</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 border-b pb-3">
                <Briefcase className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Role</p>
                  <p>{adminData.role}</p>
                  <p className="text-sm text-gray-500 mt-1">(Role cannot be changed)</p>
                </div>
              </div>
            </>
          ) : (
            <>
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
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;
