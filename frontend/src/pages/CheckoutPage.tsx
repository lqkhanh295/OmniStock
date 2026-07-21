import { useCartStore } from '../store/useCartStore';
import { Link } from 'react-router-dom';
import { ShoppingBag, ArrowRight, Trash2 } from 'lucide-react';
import { useState } from 'react';
import api from '../api';

export default function CheckoutPage() {
  const { items, removeItem, totalAmount, clearCart } = useCartStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  const handleCheckout = async () => {
    setIsProcessing(true);
    try {
      await api.post('/orders', { 
        items: items.map(i => ({ productId: i.productId, quantity: i.quantity, price: i.price })) 
      });
      setOrderSuccess(true);
      clearCart();
    } catch (err: any) {
      console.error(err);
      if (err.response?.status === 401) {
        alert("You must be logged in as a Customer to place an order.");
      } else {
        alert("Checkout failed! " + (err.response?.data?.message || "Please check your connection or stock."));
      }
    } finally {
      setIsProcessing(false);
    }
  };

  if (orderSuccess) {
    return (
      <div className="text-center py-24 animate-in zoom-in duration-500">
        <div className="w-28 h-28 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
          <ShoppingBag className="w-14 h-14" />
        </div>
        <h2 className="text-4xl font-black text-gray-900 mb-4">Order Successful!</h2>
        <p className="text-gray-500 mb-10 text-lg">Thank you for your purchase. Your transaction has been securely processed.</p>
        <Link to="/" className="inline-flex items-center gap-3 bg-gray-900 text-white px-8 py-4 rounded-full font-bold hover:bg-black transition-transform hover:scale-105 shadow-xl">
          Continue Shopping <ArrowRight className="w-5 h-5" />
        </Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-24 text-gray-500">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-10 h-10 text-gray-400" />
        </div>
        <h2 className="text-3xl font-extrabold mb-4 text-gray-800">Your cart is empty.</h2>
        <Link to="/" className="text-primary hover:text-blue-700 font-bold text-lg underline underline-offset-4">Browse Catalog</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 flex items-center gap-3">
          <ShoppingBag className="w-8 h-8 text-primary" /> Secure Checkout
        </h1>
        <button 
          onClick={clearCart} 
          className="text-red-500 hover:text-red-700 font-bold px-4 py-2 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2"
        >
          <Trash2 className="w-5 h-5" /> Clear Cart
        </button>
      </div>
      
      <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-8">
          <ul className="divide-y divide-gray-100">
            {items.map(item => (
              <li key={item.productId} className="py-6 flex justify-between items-center group">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900">{item.name}</h3>
                  <p className="text-gray-500 font-medium mt-1">Quantity: {item.quantity}</p>
                </div>
                <div className="flex items-center gap-6">
                  <span className="text-2xl font-black text-gray-900">${(item.price * item.quantity).toFixed(2)}</span>
                  <button onClick={() => removeItem(item.productId)} className="text-red-400 hover:text-red-600 transition-colors p-3 rounded-2xl hover:bg-red-50" title="Remove item">
                    <Trash2 className="w-6 h-6" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-gray-50 p-8 flex flex-col sm:flex-row justify-between items-center gap-8 border-t border-gray-100">
          <div>
            <p className="text-sm text-gray-500 font-bold uppercase tracking-widest mb-2">Total Amount</p>
            <p className="text-5xl font-black text-gray-900">${totalAmount().toFixed(2)}</p>
          </div>
          <button 
            onClick={handleCheckout} 
            disabled={isProcessing}
            className="w-full sm:w-auto bg-primary hover:bg-blue-600 text-white px-12 py-5 rounded-full font-bold text-xl transition-all hover:scale-105 disabled:opacity-50 disabled:scale-100 shadow-xl shadow-blue-200 flex items-center gap-3 justify-center"
          >
            {isProcessing ? "Processing..." : "Place Order"} <ArrowRight className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
}
