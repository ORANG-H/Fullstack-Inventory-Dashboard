import { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

interface AdminItem {
  id: number;
  name: string;
  type: string;
  price: number;
}

export default function App() {
  const [inventory, setInventory] = useState<AdminItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  
  // State for our "Add New Item" form
  const [newItem, setNewItem] = useState({ name: "", type: "cpu", price: 0 });

  // 1. READ: Fetch data from Node.js on load
  useEffect(() => {
    fetch("/api/items")
      .then(res => res.json())
      .then(data => setInventory(data))
      .catch(err => console.error("Error fetching:", err));
  }, []);

  // 2. CREATE: Logic for submitting the form to Node.js

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");
    
    // 1. Send the POST request to the Node server
    fetch("/api/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newItem)
    })
      .then(async (res) => {
        if (!res.ok) {
          // attempt to read text for debugging (may be HTML)
          const text = await res.text();
          console.error("POST /api/items returned non-OK status:", res.status, res.statusText, text);
          throw new Error(`Server returned ${res.status}`);
        }
        // try parsing JSON but guard against non-JSON responses
        const txt = await res.text();
        try {
          return JSON.parse(txt);
        } catch (e) {
          console.error("Expected JSON but got:", txt);
          throw e;
        }
      })
      .then(addedItem => {
        setInventory(prev => [...prev, addedItem]);
        setNewItem({ name: "", type: "cpu", price: 0 });
      })
      .catch(err => {
        console.error("Error sending data:", err);
        setErrorMessage("Publish failed. Make sure backend server is running on port 3000.");
      })
      .finally(() => setIsSubmitting(false));
  };
  

  return (
    <div className="container mt-5">
      <h2 className="mb-4 text-primary">Admin Control Panel</h2>
      
      <div className="row">
        {/* --- FORM SECTION --- */}
        <div className="col-md-4">
          <div className="card p-3 shadow-sm">
            <h4>Add New Item</h4>
            <form onSubmit={handleAddItem}>
              <div className="mb-3">
                <label className="form-label">Item Name</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={newItem.name}
                  onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                  required 
                />
              </div>
              
              <div className="mb-3">
                <label className="form-label">Category</label>
                <select 
                  className="form-select"
                  value={newItem.type}
                  onChange={(e) => setNewItem({...newItem, type: e.target.value})}
                >
                  <option value="cpu">CPU</option>
                  <option value="gpu">GPU</option>
                  <option value="weapon">Weapon</option>
                  <option value="utility">Utility</option>
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label">Price ($)</label>
                <input 
                  type="number" 
                  className="form-control" 
                  value={newItem.price}
                  onChange={(e) => setNewItem({...newItem, price: Number(e.target.value)})}
                  required 
                />
              </div>

              <button type="submit" className="btn btn-primary w-100" disabled={isSubmitting}>
                {isSubmitting ? "Publishing..." : "Publish to Database"}
              </button>
              {errorMessage && (
                <div className="alert alert-danger mt-3 mb-0" role="alert">
                  {errorMessage}
                </div>
              )}
            </form>
          </div>
        </div>

        {/* --- INVENTORY LIST SECTION --- */}
        <div className="col-md-8">
          <div className="card p-3 shadow-sm">
            <h4>Live Database Records</h4>
            <table className="table table-hover mt-3">
              <thead className="table-dark">
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Price</th>
                </tr>
              </thead>
              <tbody>
                {inventory.map((item) => (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    <td>{item.name}</td>
                    <td><span className="badge bg-secondary">{item.type}</span></td>
                    <td className="text-success fw-bold">${item.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}