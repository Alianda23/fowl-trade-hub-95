
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, User, Mail, Phone, Store, FileText, Save, X, Edit } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";

interface SellerData {
  seller_id: string;
  username: string;
  email: string;
  business_name: string;
  business_description: string;
  approval_status: string;
  phone_number: string;
}

const SellerProfile = () => {
  const [sellerData, setSellerData] = useState<SellerData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<SellerData>>({});
  const navigate = useNavigate();
  const { toast } = useToast();

  const fetchSellerData = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/seller/check-auth', {
        method: 'GET',
        credentials: 'include'
      });
      
      const data = await response.json();
      
      if (data.isAuthenticated) {
        setSellerData(data);
        setFormData({
          username: data.username,
          business_name: data.business_name,
          business_description: data.business_description || "",
          phone_number: data.phone_number || ""
        });
      } else {
        toast({
          title: "Authentication Error",
          description: "You are not logged in as a seller.",
          variant: "destructive",
        });
        navigate('/seller/login');
      }
    } catch (error) {
      console.error("Error fetching seller data:", error);
      toast({
        title: "Error",
        description: "Failed to fetch seller profile data.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSellerData();
  }, [navigate, toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/seller/update-profile', {
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
        fetchSellerData(); // Refresh data
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
    if (sellerData) {
      setFormData({
        username: sellerData.username,
        business_name: sellerData.business_name,
        business_description: sellerData.business_description || "",
        phone_number: sellerData.phone_number || ""
      });
    }
    setIsEditing(false);
  };

  if (isLoading) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  }

  if (!sellerData) {
    return <div className="flex min-h-screen items-center justify-center">No seller data available.</div>;
  }

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate("/seller/dashboard")}>
            <ArrowLeft className="h-5 w-5" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">Seller Profile</h1>
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
            <h2 className="text-xl font-semibold">{sellerData.username}</h2>
            <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
              sellerData.approval_status === 'approved' 
                ? 'bg-green-100 text-green-800' 
                : sellerData.approval_status === 'rejected'
                ? 'bg-red-100 text-red-800'
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {sellerData.approval_status.charAt(0).toUpperCase() + sellerData.approval_status.slice(1)}
            </div>
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
                <label htmlFor="business_name" className="text-sm text-gray-500">Business Name</label>
                <Input
                  id="business_name"
                  name="business_name"
                  value={formData.business_name || ''}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="space-y-2 border-b pb-3">
                <label htmlFor="business_description" className="text-sm text-gray-500">Business Description</label>
                <textarea
                  id="business_description"
                  name="business_description"
                  value={formData.business_description || ''}
                  onChange={handleInputChange}
                  className="w-full rounded-md border border-gray-300 p-2"
                  rows={3}
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
                  <p>{sellerData.email}</p>
                  <p className="text-sm text-gray-500 mt-1">(Email cannot be changed)</p>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-3 border-b pb-3">
                <Store className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Business Name</p>
                  <p>{sellerData.business_name}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 border-b pb-3">
                <FileText className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Business Description</p>
                  <p>{sellerData.business_description || "No description provided"}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 border-b pb-3">
                <Mail className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p>{sellerData.email}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 border-b pb-3">
                <Phone className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Phone Number</p>
                  <p>{sellerData.phone_number || "Not specified"}</p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SellerProfile;
