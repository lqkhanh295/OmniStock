import { useEffect, useState } from 'react';
import api from '../api';
import { useCartStore } from '../store/useCartStore';
import { Package, Plus } from 'lucide-react';

interface Product {
  id: number;
  name: string;
  sku: string;
  description: string;
  unitPrice: number;
  stockQuantity: number;
}

export default function CatalogPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const { items: cartItems, addItem } = useCartStore();

  useEffect(() => {
    // Fetch from real backend
    api.get(`/products?search=${searchTerm}`)
      .then(res => {
        let fetchedProducts = res.data.items;
        if (sortBy === 'price-asc') {
          fetchedProducts.sort((a: Product, b: Product) => a.unitPrice - b.unitPrice);
        } else if (sortBy === 'price-desc') {
          fetchedProducts.sort((a: Product, b: Product) => b.unitPrice - a.unitPrice);
        }
        setProducts(fetchedProducts);
      })
      .catch(err => {
        console.error("Failed to fetch products.", err);
      })
      .finally(() => setLoading(false));
  }, [searchTerm, sortBy]);

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 flex items-center gap-3">
          <Package className="w-8 h-8 text-primary" /> Product Catalog
        </h1>
        <div className="flex gap-4 w-full md:w-auto">
          <input 
            type="text" 
            placeholder="Search products..." 
            className="px-4 py-2 border rounded-lg w-full md:w-64 focus:ring-2 focus:ring-blue-500 outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select 
            className="px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="name">Sort by Name</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
        </div>
      </div>
      
      {loading ? (
        <div className="text-center py-20 animate-pulse text-gray-500 font-bold text-xl">Loading catalog...</div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 text-gray-500 bg-white rounded-xl shadow-sm border border-gray-100">
          No products found matching "{searchTerm}"
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map(product => {
            const cartItem = cartItems.find(i => i.productId === product.id);
            const inCartQuantity = cartItem ? cartItem.quantity : 0;
            const availableStock = product.stockQuantity - inCartQuantity;

            return (
              <div key={product.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 p-6 flex flex-col group relative overflow-hidden">
                <div className="absolute -top-4 -right-4 p-4 opacity-5">
                    <Package className="w-32 h-32 transform group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-1 relative z-10">{product.name}</h2>
                <p className="text-sm text-gray-400 mb-3 relative z-10">SKU: {product.sku}</p>
                <p className="text-gray-600 mb-6 flex-grow relative z-10 leading-relaxed">{product.description}</p>
                
                <div className="flex justify-between items-end mt-auto relative z-10">
                  <div>
                    <span className="text-3xl font-black text-gray-900">${product.unitPrice.toFixed(2)}</span>
                    <p className={`text-sm mt-1 ${availableStock > 5 ? 'text-emerald-500' : 'text-red-500'} font-bold`}>
                      {availableStock} in stock
                    </p>
                    {inCartQuantity > 0 && (
                      <p className="text-xs text-blue-600 font-bold mt-1">({inCartQuantity} in cart)</p>
                    )}
                  </div>
                  <button 
                    onClick={() => addItem({ productId: product.id, name: product.name, price: product.unitPrice, quantity: 1 })}
                    disabled={availableStock <= 0}
                    className="bg-primary hover:bg-blue-600 text-white p-3 rounded-2xl transition-all disabled:bg-gray-200 disabled:text-gray-400 shadow-md hover:shadow-lg flex items-center justify-center font-bold h-12 w-12"
                    title="Add to Cart"
                  >
                    <Plus className="w-6 h-6" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
