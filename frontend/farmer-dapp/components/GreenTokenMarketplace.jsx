import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingBagIcon,
  SparklesIcon,
  GiftIcon,
  CurrencyDollarIcon,
  TruckIcon,
  AcademicCapIcon,
  WrenchScrewdriverIcon,
  HeartIcon,
  CheckCircleIcon,
  XMarkIcon,
  ArrowRightIcon,
  TagIcon
} from '@heroicons/react/24/outline';

const GreenTokenMarketplace = ({ farmerId = 'FARM-001' }) => {
  const [tokenBalance, setTokenBalance] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [purchaseHistory, setPurchaseHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mock marketplace items
  const marketplaceItems = [
    {
      id: 'ITEM-001',
      name: 'Organic Seeds Package',
      description: 'Premium organic seeds for sustainable farming',
      category: 'farming',
      price: 150,
      originalPrice: 200,
      discount: 25,
      image: '🌱',
      inStock: true,
      rating: 4.8,
      reviews: 124,
      benefits: ['Certified organic', 'High germination rate', 'Disease resistant']
    },
    {
      id: 'ITEM-002',
      name: 'Drip Irrigation Kit',
      description: 'Water-efficient irrigation system',
      category: 'equipment',
      price: 500,
      originalPrice: 650,
      discount: 23,
      image: '💧',
      inStock: true,
      rating: 4.9,
      reviews: 89,
      benefits: ['Save 40% water', 'Easy installation', '2-year warranty']
    },
    {
      id: 'ITEM-003',
      name: 'Soil Testing Kit',
      description: 'Professional soil analysis tools',
      category: 'equipment',
      price: 75,
      originalPrice: 100,
      discount: 25,
      image: '🧪',
      inStock: true,
      rating: 4.6,
      reviews: 156,
      benefits: ['pH testing', 'Nutrient analysis', 'Quick results']
    },
    {
      id: 'ITEM-004',
      name: 'Sustainable Farming Course',
      description: 'Online certification in sustainable practices',
      category: 'education',
      price: 200,
      originalPrice: 300,
      discount: 33,
      image: '📚',
      inStock: true,
      rating: 4.9,
      reviews: 234,
      benefits: ['Expert instructors', 'Certificate included', 'Lifetime access']
    },
    {
      id: 'ITEM-005',
      name: 'Compost Maker',
      description: 'Efficient organic waste composting system',
      category: 'equipment',
      price: 300,
      originalPrice: 400,
      discount: 25,
      image: '♻️',
      inStock: true,
      rating: 4.7,
      reviews: 78,
      benefits: ['Reduces waste', 'Rich compost', 'Eco-friendly']
    },
    {
      id: 'ITEM-006',
      name: 'Premium Fertilizer',
      description: 'Organic fertilizer for better yield',
      category: 'farming',
      price: 120,
      originalPrice: 150,
      discount: 20,
      image: '🌿',
      inStock: true,
      rating: 4.5,
      reviews: 167,
      benefits: ['100% organic', 'Slow release', 'Improves soil health']
    },
    {
      id: 'ITEM-007',
      name: 'Weather Station',
      description: 'Smart weather monitoring device',
      category: 'technology',
      price: 800,
      originalPrice: 1000,
      discount: 20,
      image: '🌤️',
      inStock: false,
      rating: 4.8,
      reviews: 45,
      benefits: ['Real-time data', 'Mobile app', 'Solar powered']
    },
    {
      id: 'ITEM-008',
      name: 'Pest Control Kit',
      description: 'Natural pest management solutions',
      category: 'farming',
      price: 90,
      originalPrice: 120,
      discount: 25,
      image: '🐛',
      inStock: true,
      rating: 4.4,
      reviews: 92,
      benefits: ['Chemical-free', 'Safe for crops', 'Long-lasting']
    }
  ];

  const categories = [
    { id: 'all', name: 'All Items', icon: ShoppingBagIcon },
    { id: 'farming', name: 'Farming Supplies', icon: SparklesIcon },
    { id: 'equipment', name: 'Equipment', icon: WrenchScrewdriverIcon },
    { id: 'education', name: 'Education', icon: AcademicCapIcon },
    { id: 'technology', name: 'Technology', icon: TruckIcon }
  ];

  useEffect(() => {
    fetchTokenBalance();
    loadPurchaseHistory();
  }, [farmerId]);

  const fetchTokenBalance = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/sustainability/tokens/${farmerId}`);
      const result = await response.json();
      
      if (result.success) {
        setTokenBalance(result.data.balance);
      }
    } catch (error) {
      console.error('Error fetching token balance:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPurchaseHistory = () => {
    // Mock purchase history
    setPurchaseHistory([
      {
        id: 'PUR-001',
        itemName: 'Organic Seeds Package',
        price: 150,
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'delivered'
      },
      {
        id: 'PUR-002',
        itemName: 'Soil Testing Kit',
        price: 75,
        date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'delivered'
      }
    ]);
  };

  const filteredItems = selectedCategory === 'all' 
    ? marketplaceItems 
    : marketplaceItems.filter(item => item.category === selectedCategory);

  const addToCart = (item) => {
    const existingItem = cart.find(cartItem => cartItem.id === item.id);
    
    if (existingItem) {
      setCart(cart.map(cartItem => 
        cartItem.id === item.id 
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      ));
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
  };

  const removeFromCart = (itemId) => {
    setCart(cart.filter(item => item.id !== itemId));
  };

  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity === 0) {
      removeFromCart(itemId);
    } else {
      setCart(cart.map(item => 
        item.id === itemId 
          ? { ...item, quantity: newQuantity }
          : item
      ));
    }
  };

  const getTotalCost = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const canAfford = () => {
    return tokenBalance >= getTotalCost();
  };

  const checkout = async () => {
    if (!canAfford()) {
      alert('Insufficient Green Tokens!');
      return;
    }

    try {
      // Simulate purchase
      const totalCost = getTotalCost();
      setTokenBalance(prev => prev - totalCost);
      
      // Add to purchase history
      const newPurchases = cart.map(item => ({
        id: `PUR-${Date.now()}-${item.id}`,
        itemName: item.name,
        price: item.price * item.quantity,
        quantity: item.quantity,
        date: new Date().toISOString(),
        status: 'processing'
      }));
      
      setPurchaseHistory(prev => [...newPurchases, ...prev]);
      setCart([]);
      setShowCart(false);
      
      alert(`🎉 Purchase successful! Spent ${totalCost} Green Tokens.`);
    } catch (error) {
      console.error('Purchase error:', error);
      alert('Purchase failed. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-40 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl shadow-lg text-white p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white bg-opacity-20 rounded-xl">
              <ShoppingBagIcon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold">🛒 Green Token Marketplace</h3>
              <p className="text-purple-100">Spend your tokens on sustainable farming resources</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-2xl font-bold">{tokenBalance}</div>
              <div className="text-sm text-purple-100">Green Tokens</div>
            </div>
            
            <button
              onClick={() => setShowCart(true)}
              className="relative bg-white bg-opacity-20 hover:bg-opacity-30 rounded-xl p-3 transition-colors"
            >
              <ShoppingBagIcon className="w-6 h-6" />
              {cart.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cart.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
        <div className="flex flex-wrap gap-3">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
                selectedCategory === category.id
                  ? 'bg-purple-100 border-purple-300 text-purple-700'
                  : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
              }`}
            >
              <category.icon className="w-4 h-4" />
              <span className="text-sm font-medium">{category.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Marketplace Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow"
          >
            {/* Item Image */}
            <div className="bg-gradient-to-br from-gray-100 to-gray-200 h-32 flex items-center justify-center">
              <span className="text-4xl">{item.image}</span>
            </div>

            {/* Item Details */}
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <h5 className="font-semibold text-gray-900 text-sm">{item.name}</h5>
                {item.discount > 0 && (
                  <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full">
                    -{item.discount}%
                  </span>
                )}
              </div>
              
              <p className="text-xs text-gray-600 mb-3 line-clamp-2">{item.description}</p>

              {/* Benefits */}
              <div className="mb-3">
                {item.benefits.slice(0, 2).map((benefit, idx) => (
                  <div key={idx} className="flex items-center space-x-1 text-xs text-green-600 mb-1">
                    <CheckCircleIcon className="w-3 h-3" />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>

              {/* Rating */}
              <div className="flex items-center space-x-2 mb-3">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={`text-xs ${i < Math.floor(item.rating) ? 'text-yellow-400' : 'text-gray-300'}`}>
                      ⭐
                    </span>
                  ))}
                </div>
                <span className="text-xs text-gray-500">({item.reviews})</span>
              </div>

              {/* Price */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <span className="text-lg font-bold text-purple-600">{item.price}</span>
                  <span className="text-xs text-purple-600">tokens</span>
                  {item.originalPrice > item.price && (
                    <span className="text-xs text-gray-400 line-through">{item.originalPrice}</span>
                  )}
                </div>
                
                <div className="flex items-center space-x-1 text-xs text-gray-500">
                  <SparklesIcon className="w-3 h-3" />
                  <span>{item.category}</span>
                </div>
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={() => addToCart(item)}
                disabled={!item.inStock || tokenBalance < item.price}
                className={`w-full py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                  item.inStock && tokenBalance >= item.price
                    ? 'bg-purple-600 text-white hover:bg-purple-700'
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                }`}
              >
                {!item.inStock ? 'Out of Stock' : 
                 tokenBalance < item.price ? 'Insufficient Tokens' : 
                 'Add to Cart'}
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Shopping Cart Modal */}
      <AnimatePresence>
        {showCart && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl max-w-md w-full max-h-[80vh] overflow-hidden"
            >
              {/* Cart Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h4 className="text-lg font-bold text-gray-900">Shopping Cart</h4>
                <button
                  onClick={() => setShowCart(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <XMarkIcon className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Cart Items */}
              <div className="p-4 max-h-60 overflow-y-auto">
                {cart.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <ShoppingBagIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>Your cart is empty</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {cart.map(item => (
                      <div key={item.id} className="flex items-center space-x-3 bg-gray-50 rounded-lg p-3">
                        <span className="text-2xl">{item.image}</span>
                        <div className="flex-1">
                          <h6 className="font-medium text-gray-900 text-sm">{item.name}</h6>
                          <p className="text-xs text-gray-600">{item.price} tokens each</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-300"
                          >
                            -
                          </button>
                          <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-300"
                          >
                            +
                          </button>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <XMarkIcon className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Cart Footer */}
              {cart.length > 0 && (
                <div className="border-t border-gray-200 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-semibold text-gray-900">Total:</span>
                    <span className="text-lg font-bold text-purple-600">{getTotalCost()} tokens</span>
                  </div>
                  
                  <div className="flex items-center justify-between mb-3 text-sm">
                    <span className="text-gray-600">Your Balance:</span>
                    <span className={`font-medium ${canAfford() ? 'text-green-600' : 'text-red-600'}`}>
                      {tokenBalance} tokens
                    </span>
                  </div>

                  <button
                    onClick={checkout}
                    disabled={!canAfford()}
                    className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                      canAfford()
                        ? 'bg-purple-600 text-white hover:bg-purple-700'
                        : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {canAfford() ? 'Complete Purchase' : 'Insufficient Tokens'}
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Purchase History */}
      {purchaseHistory.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          <h4 className="text-lg font-bold text-gray-900 mb-4">📦 Recent Purchases</h4>
          
          <div className="space-y-3">
            {purchaseHistory.slice(0, 5).map((purchase, index) => (
              <div key={purchase.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                <div>
                  <div className="font-medium text-gray-900 text-sm">{purchase.itemName}</div>
                  <div className="text-xs text-gray-500">
                    {new Date(purchase.date).toLocaleDateString()}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-purple-600">
                    {purchase.price} tokens
                  </div>
                  <div className={`text-xs px-2 py-1 rounded-full ${
                    purchase.status === 'delivered' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'
                  }`}>
                    {purchase.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default GreenTokenMarketplace;
