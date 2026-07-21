import React, { useEffect, useState } from 'react';
import api from '../api';
import { Package, ShoppingCart, BarChart3, AlertTriangle, Trash2, Edit2, Plus } from 'lucide-react';

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState('inventory');
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  
  // Product Form State
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [productForm, setProductForm] = useState({ name: '', sku: '', description: '', unitPrice: 0, stockQuantity: 0, categoryId: 1 });

  const loadProducts = () => api.get('/products').then(res => setProducts(res.data.items));

  useEffect(() => {
    if (activeTab === 'inventory') {
      loadProducts();
    } else if (activeTab === 'orders') {
      api.get('/orders').then(res => setOrders(res.data));
    } else if (activeTab === 'logs') {
      api.get('/inventory/audit-logs').then(res => setAuditLogs(res.data));
    }
  }, [activeTab]);

  const updateStock = async (id: number, currentQty: number, delta: number) => {
    try {
      await api.put(`/products/${id}/stock`, { quantity: currentQty + delta });
      loadProducts();
    } catch (e) {
      console.error(e);
    }
  };

  const updateOrderStatus = async (id: number, status: string) => {
    try {
      await api.put(`/orders/${id}/status`, { status });
      api.get('/orders').then(res => setOrders(res.data));
    } catch (e) {
      console.error(e);
    }
  };

  const handleExport = async () => {
    try {
      const response = await api.get('/reports/inventory/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'InventoryReport.xlsx');
      document.body.appendChild(link);
      link.click();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      loadProducts();
    } catch (e) {
      console.error(e);
      alert('Cannot delete product if it has existing orders.');
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProductId) {
        await api.put(`/products/${editingProductId}`, { id: editingProductId, ...productForm });
      } else {
        await api.post('/products', productForm);
      }
      setShowProductForm(false);
      setEditingProductId(null);
      loadProducts();
    } catch (err: any) {
      console.error(err);
      alert('Error saving product: ' + JSON.stringify(err.response?.data || err.message));
    }
  };

  const openEditForm = (product: any) => {
    setEditingProductId(product.id);
    setProductForm({
      name: product.name,
      sku: product.sku,
      description: product.description,
      unitPrice: product.unitPrice,
      stockQuantity: product.stockQuantity,
      categoryId: product.categoryId || 1
    });
    setShowProductForm(true);
  };

  const openNewForm = () => {
    setEditingProductId(null);
    setProductForm({ name: '', sku: '', description: '', unitPrice: 0, stockQuantity: 0, categoryId: 1 });
    setShowProductForm(true);
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 min-h-[70vh]">
      <div className="w-full md:w-64 bg-white rounded-xl shadow-sm border border-gray-100 p-4 h-fit">
        <h2 className="font-bold text-gray-800 mb-4 px-2 uppercase text-xs tracking-wider">Admin Menu</h2>
        <nav className="space-y-1">
          <button onClick={() => setActiveTab('inventory')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left ${activeTab === 'inventory' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}>
            <Package className="w-5 h-5" /> Inventory
          </button>
          <button onClick={() => setActiveTab('orders')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left ${activeTab === 'orders' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}>
            <ShoppingCart className="w-5 h-5" /> All Orders
          </button>
          <button onClick={() => setActiveTab('logs')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left ${activeTab === 'logs' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}>
            <BarChart3 className="w-5 h-5" /> Audit Logs
          </button>
        </nav>
      </div>

      <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 p-6 overflow-hidden">
        {activeTab === 'inventory' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">Inventory Management</h2>
              <div className="flex gap-2">
                <button onClick={openNewForm} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-2">
                  <Plus className="w-4 h-4" /> New Product
                </button>
                <button onClick={handleExport} className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700">
                  Export
                </button>
              </div>
            </div>

            {showProductForm && (
              <form onSubmit={handleSaveProduct} className="bg-gray-50 p-4 rounded-lg mb-6 border border-gray-200">
                <h3 className="font-bold text-gray-800 mb-4">{editingProductId ? 'Edit Product' : 'Add New Product'}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Name</label>
                    <input required type="text" className="w-full px-3 py-2 border rounded" value={productForm.name} onChange={e => setProductForm({...productForm, name: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">SKU</label>
                    <input required type="text" className="w-full px-3 py-2 border rounded" value={productForm.sku} onChange={e => setProductForm({...productForm, sku: e.target.value})} />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                    <textarea className="w-full px-3 py-2 border rounded" value={productForm.description} onChange={e => setProductForm({...productForm, description: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Unit Price ($)</label>
                    <input required type="number" step="0.01" className="w-full px-3 py-2 border rounded" value={productForm.unitPrice} onChange={e => setProductForm({...productForm, unitPrice: parseFloat(e.target.value)})} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Initial Stock</label>
                    <input required type="number" className="w-full px-3 py-2 border rounded" value={productForm.stockQuantity} onChange={e => setProductForm({...productForm, stockQuantity: parseInt(e.target.value)})} />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <button type="button" onClick={() => setShowProductForm(false)} className="px-4 py-2 bg-gray-200 rounded text-sm hover:bg-gray-300">Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">Save Product</button>
                </div>
              </form>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-gray-600 text-sm border-b">
                    <th className="p-3 font-medium">SKU</th>
                    <th className="p-3 font-medium">Product Name</th>
                    <th className="p-3 font-medium">Price</th>
                    <th className="p-3 font-medium">Stock</th>
                    <th className="p-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-sm">
                  {products.map(p => (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="p-3 text-gray-500">{p.sku}</td>
                      <td className="p-3 font-medium text-gray-800">{p.name}</td>
                      <td className="p-3">${p.unitPrice.toFixed(2)}</td>
                      <td className="p-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${p.stockQuantity < 10 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                          {p.stockQuantity < 10 && <AlertTriangle className="w-3 h-3" />}
                          {p.stockQuantity}
                        </span>
                        <div className="inline-flex ml-2 gap-1">
                          <button onClick={() => updateStock(p.id, p.stockQuantity, 1)} className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded hover:bg-blue-200">+</button>
                          <button onClick={() => updateStock(p.id, p.stockQuantity, -1)} className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded hover:bg-gray-200">-</button>
                        </div>
                      </td>
                      <td className="p-3 flex gap-3">
                        <button onClick={() => openEditForm(p)} className="text-gray-400 hover:text-blue-600"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => handleDeleteProduct(p.id)} className="text-gray-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-6">Order Fulfillment</h2>
            <div className="space-y-4">
              {orders.map(order => (
                <div key={order.id} className="border rounded-lg p-4 flex justify-between items-center bg-gray-50">
                  <div>
                    <div className="font-medium">Order #{order.id} - ${order.totalAmount.toFixed(2)}</div>
                    <div className="text-sm text-gray-500">User: {order.userId} | {new Date(order.orderDate).toLocaleString()}</div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${order.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                      {order.status}
                    </span>
                    {order.status === 'Pending' && (
                      <button onClick={() => updateOrderStatus(order.id, 'Shipped')} className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700">
                        Mark Shipped
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'logs' && (
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-6">Inventory Audit Logs</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-gray-600 text-sm border-b">
                    <th className="p-3 font-medium">Time</th>
                    <th className="p-3 font-medium">Product</th>
                    <th className="p-3 font-medium">Type</th>
                    <th className="p-3 font-medium">Change</th>
                    <th className="p-3 font-medium">User</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-sm">
                  {auditLogs.map(log => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="p-3 text-gray-500">{new Date(log.timestamp).toLocaleString()}</td>
                      <td className="p-3 font-medium text-gray-800">{log.product?.name}</td>
                      <td className="p-3">{log.type}</td>
                      <td className="p-3">
                        <span className={`font-bold ${log.changeAmount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {log.changeAmount > 0 ? '+' : ''}{log.changeAmount}
                        </span>
                      </td>
                      <td className="p-3 text-gray-500">{log.modifiedBy}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
