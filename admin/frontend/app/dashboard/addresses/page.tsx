"use client"
// pages/admin/addresses.js
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<string[]>([]);
  const [newAddress, setNewAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [fetching , setIsFetching]= useState(false)
  const [IsMutating , setIsMutating]= useState(false)


  const BASE_URL = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001'}/api`;
  const getAuthConfig = () => ({
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
  },
});

  useEffect(() => {
    fetchAddresses();
  }, []);
  
const fetchAddresses = async () => {
  try {
    setIsFetching(true);
    const res = await axios.get(`${BASE_URL}/addresses`, getAuthConfig());
    setAddresses(res.data);
  } catch (err) {
    console.error(err);
    alert("Error fetching addresses");
  } finally {
    setIsFetching(false);
  }
};


const handleAddAddress = async (e : any) => {
  e.preventDefault();
  if (!newAddress.trim()) return;
  try {
    setIsMutating(true);
    const res = await axios.post(`${BASE_URL}/addresses`, { name: newAddress }, getAuthConfig());
    setAddresses([...addresses, res.data]);
    setNewAddress('');
    alert("Address added successfully");
  } catch (err : any) {
    alert(err.response?.data?.message || "Error adding address");
  } finally {
    setIsMutating(false);
  }
};

  const handleEditAddress = async (id : any) => {
    if (!editName.trim()) return;
    
    try {
      setIsLoading(true);
      const response = await axios.patch(`${BASE_URL}/addresses/${id}`, { name: editName }, getAuthConfig());

      setAddresses(addresses.map((addr : any) => addr.id === id ? response.data : addr));
      setEditingId(null);
      alert('Address updated successfully');
    } catch (error : any) {
      alert(error.response?.data?.message || 'Error updating address');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAddress = async (id : any) => {
    if (!confirm('Are you sure you want to delete this address?')) return;
    
    try {
      setIsLoading(true);
      await axios.delete(`${BASE_URL}/addresses/${id}`, getAuthConfig());

      setAddresses(addresses.filter((addr:any) => addr.id !== id));
      alert('Address deleted successfully');
    } catch (error : any) {
      alert(error.response?.data?.message || 'Error deleting address');
    } finally {
      setIsLoading(false);
    }
  };

  const startEditing = (address: any) => {
    setEditingId(address.id);
    setEditName(address.name);
  };

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-2xl md:text-3xl font-bold mb-6">Manage Addresses</h1>
      
      {/* Add new address form */}
      <div className="bg-white rounded-lg shadow p-4 mb-8">
        <h2 className="text-lg font-semibold mb-4">Add New Address</h2>
        <form onSubmit={handleAddAddress} className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            value={newAddress}
            onChange={(e) => setNewAddress(e.target.value)}
            placeholder="Enter address name"
            className="flex-1 p-2 border rounded"
            disabled={isLoading}
          />
          <button
            type="submit"
            className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
            disabled={isLoading || !newAddress.trim()}
          >
            {isLoading ? 'Adding...' : 'Add Address'}
          </button>
        </form>
      </div>
      
      {/* Address list */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <h2 className="text-lg font-semibold p-4 border-b">Address List</h2>
        
        {isLoading && addresses.length === 0 ? (
          <div className="p-4 text-center text-gray-500">Loading addresses...</div>
        ) : addresses.length === 0 ? (
          <div className="p-4 text-center text-gray-500">No addresses found. Add one above.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Name</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Status</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {addresses.map((address :any) => (
                  <tr key={address.id}>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {editingId === address.id ? (
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full p-1 border rounded"
                          autoFocus
                        />
                      ) : (
                        address.name
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        address.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {address.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                      {editingId === address.id ? (
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleEditAddress(address.id)}
                            className="text-blue-600 hover:text-blue-900"
                            disabled={isLoading}
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="text-gray-600 hover:text-gray-900"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex justify-end gap-4">
                          <button
                            onClick={() => startEditing(address)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteAddress(address.id)}
                            className="text-red-600 hover:text-red-900"
                            disabled={isLoading}
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}