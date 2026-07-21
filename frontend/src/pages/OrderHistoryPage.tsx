import { useEffect, useState } from 'react';
import api from '../api';
import { Package, Clock, CheckCircle } from 'lucide-react';

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = () => {
    api.get('/orders/my-orders').then(res => {
      setOrders(res.data);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleCancelOrder = async (orderId: number) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;
    try {
      await api.put(`/orders/${orderId}/cancel`);
      alert("Order cancelled successfully");
      fetchOrders();
    } catch (err: any) {
      alert("Failed to cancel order: " + (err.response?.data?.message || err.message));
    }
  };

  if (loading) return <div className="text-center mt-12">Loading orders...</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">My Orders</h1>
      {orders.length === 0 ? (
        <div className="text-center text-gray-500 py-12 bg-white rounded-lg shadow-sm">
          You haven't placed any orders yet.
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map(order => (
            <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b flex justify-between items-center">
                <div>
                  <div className="text-sm text-gray-500">Order #{order.id}</div>
                  <div className="font-medium">{new Date(order.orderDate).toLocaleDateString()}</div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    {order.status === 'Pending' ? <Clock className="w-5 h-5 text-yellow-500" /> : <CheckCircle className="w-5 h-5 text-green-500" />}
                    <span className={`font-medium ${order.status === 'Pending' ? 'text-yellow-600' : order.status === 'Cancelled' ? 'text-red-600' : 'text-green-600'}`}>
                      {order.status}
                    </span>
                  </div>
                  {order.status === 'Pending' && (
                    <button
                      onClick={() => handleCancelOrder(order.id)}
                      className="text-sm text-red-600 hover:text-red-800 font-semibold px-3 py-1 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                    >
                      Cancel Order
                    </button>
                  )}
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {order.orderItems.map((item: any) => (
                    <div key={item.id} className="flex justify-between items-center">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Package className="w-6 h-6 text-gray-400" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-800">{item.product?.name || 'Unknown Product'}</div>
                          <div className="text-sm text-gray-500">Qty: {item.quantity} × ${item.unitPrice.toFixed(2)}</div>
                        </div>
                      </div>
                      <div className="font-bold text-gray-700">
                        ${(item.quantity * item.unitPrice).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 pt-4 border-t flex justify-between items-center">
                  <div className="text-gray-600">Total Amount</div>
                  <div className="text-2xl font-bold text-primary">${order.totalAmount.toFixed(2)}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
