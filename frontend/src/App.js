import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Filter } from 'lucide-react';

const ProductListing = () => {
  // State management for products and UI
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    minPopularity: '',
    maxPopularity: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  
  // Refs for carousel touch functionality
  const carouselRef = useRef(null);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  // Determine API URL based on environment
  const getApiUrl = () => {
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      
      // Local development
      if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return 'http://localhost:5000';
      }
      
      // Production URLs - update with your deployed backend
      if (hostname.includes('vercel.app')) {
        return 'https://renart-jewelry-api.herokuapp.com';
      }
      
      if (hostname.includes('netlify.app')) {
        return 'https://renart-jewelry-api.railway.app';
      }
    }
    
    return 'http://localhost:5000';
  };

  const API_URL = 'https://renart-jewelry-production.up.railway.app';

  // Fetch products on component mount
  useEffect(() => {
    fetchProducts();
  }, []);

  // Fetch products from API with current filters
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Build query parameters from filters
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });
      
      const response = await fetch(`${API_URL}/api/products?${queryParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setProducts(data.products);
      } else {
        setError(data.message || 'Failed to fetch products');
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError(`Error connecting to server: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle filter input changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Apply filters and reset carousel
  const applyFilters = () => {
    fetchProducts();
    setCurrentSlide(0);
  };

  // Clear all filters and refetch
  const clearFilters = () => {
    setFilters({
      minPrice: '',
      maxPrice: '',
      minPopularity: '',
      maxPopularity: ''
    });
    setTimeout(() => fetchProducts(), 100);
  };

  // Calculate visible products based on screen size
  const getVisibleProductCount = () => {
    if (typeof window !== 'undefined') {
      if (window.innerWidth < 640) return 1; // Mobile
      if (window.innerWidth < 1024) return 2; // Tablet
      return 4; // Desktop
    }
    return 4;
  };

  const [visibleCount, setVisibleCount] = useState(getVisibleProductCount());

  // Update visible count on window resize
  useEffect(() => {
    const handleResize = () => {
      setVisibleCount(getVisibleProductCount());
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  const maxSlide = Math.max(0, products.length - visibleCount);

  // Carousel navigation functions
  const nextSlide = () => {
    setCurrentSlide(prev => prev >= maxSlide ? 0 : prev + 1);
  };

  const prevSlide = () => {
    setCurrentSlide(prev => prev <= 0 ? maxSlide : prev - 1);
  };

  // Touch event handlers for mobile swipe
  const handleTouchStart = (e) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    
    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      nextSlide();
    } else if (isRightSwipe) {
      prevSlide();
    }
  };

  // Individual product card component
  const ProductCard = ({ product }) => {
    const [selectedColor, setSelectedColor] = useState('yellow');
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);
    
    // Color options matching PDF design specs
    const colorOptions = {
      yellow: { name: 'Yellow Gold', color: '#E6CA97' },
      white: { name: 'White Gold', color: '#D9D9D9' },
      rose: { name: 'Rose Gold', color: '#E1A4A9' }
    };

    // Render star rating based on numeric score
    const renderStars = (rating) => {
      const stars = [];
      const fullStars = Math.floor(rating);
      const hasHalfStar = rating % 1 !== 0;
      
      // Add full stars
      for (let i = 0; i < fullStars; i++) {
        stars.push(<span key={i} className="text-yellow-400">★</span>);
      }
      
      // Add half star if needed
      if (hasHalfStar) {
        stars.push(<span key="half" className="text-yellow-400">★</span>);
      }
      
      // Add empty stars
      const remainingStars = 5 - Math.ceil(rating);
      for (let i = 0; i < remainingStars; i++) {
        stars.push(<span key={`empty-${i}`} className="text-gray-300">★</span>);
      }
      
      return stars;
    };

    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden w-full max-w-sm mx-auto">
        {/* Product image section */}
        <div className="bg-gray-50 p-6 flex justify-center items-center h-64 relative">
          {!imageLoaded && !imageError && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400"></div>
            </div>
          )}
          
          {imageError ? (
            <div className="text-gray-400 text-center">
              <div className="text-4xl mb-2">💍</div>
              <div className="text-sm">Image unavailable</div>
            </div>
          ) : (
            <img
              src={product.images[selectedColor]}
              alt={product.name}
              className={`max-h-full max-w-full object-contain transition-opacity duration-300 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              loading="lazy"
              onLoad={() => setImageLoaded(true)}
              onError={() => {
                setImageError(true);
                setImageLoaded(true);
              }}
            />
          )}
        </div>
        
        {/* Product details section */}
        <div className="p-6">
          {/* Product name - Avenir Book 14px as per PDF specs */}
          <h3 className="text-gray-900 mb-2" style={{ 
            fontFamily: 'Avenir, system-ui, sans-serif', 
            fontWeight: 400, 
            fontSize: '14px',
            lineHeight: '1.4'
          }}>
            {product.name}
          </h3>
          
          {/* Product price - Avenir Book 14px as per PDF specs */}
          <p className="text-gray-900 font-medium mb-4" style={{ 
            fontFamily: 'Avenir, system-ui, sans-serif', 
            fontWeight: 400, 
            fontSize: '14px',
            lineHeight: '1.4'
          }}>
            ${product.price.toFixed(2)} USD
          </p>
          
          {/* Color picker buttons */}
          <div className="flex items-center gap-2 mb-4">
            {Object.entries(colorOptions).map(([key, option]) => (
              <button
                key={key}
                onClick={() => {
                  setSelectedColor(key);
                  setImageLoaded(false);
                  setImageError(false);
                }}
                className={`w-6 h-6 rounded-full border-2 transition-all duration-200 hover:scale-110 ${
                  selectedColor === key ? 'border-gray-600 shadow-md' : 'border-gray-300'
                }`}
                style={{ backgroundColor: option.color }}
                title={option.name}
                aria-label={`Select ${option.name}`}
              />
            ))}
          </div>
          
          {/* Selected color name - Avenir Book 12px as per PDF specs */}
          <p className="text-gray-600 mb-2" style={{ 
            fontFamily: 'Avenir, system-ui, sans-serif', 
            fontWeight: 400, 
            fontSize: '12px',
            lineHeight: '1.4'
          }}>
            {colorOptions[selectedColor].name}
          </p>
          
          {/* Star rating display */}
          <div className="flex items-center gap-2">
            <div className="flex" aria-label={`Rating: ${product.starRating} out of 5 stars`}>
              {renderStars(product.starRating)}
            </div>
            <span className="text-gray-600" style={{ 
              fontFamily: 'Avenir, system-ui, sans-serif', 
              fontWeight: 400, 
              fontSize: '12px',
              lineHeight: '1.4'
            }}>
              {product.starRating}/5
            </span>
          </div>
        </div>
      </div>
    );
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading jewelry collection...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Connection Error</h2>
          <p className="text-red-600 mb-4 text-sm">{error}</p>
          <button 
            onClick={fetchProducts}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Main application render
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header section */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            {/* Main title - Avenir Book 45px as per PDF specs */}
            <h1 className="text-gray-900" style={{ 
              fontFamily: 'Avenir, system-ui, sans-serif', 
              fontWeight: 400, 
              fontSize: 'clamp(24px, 4vw, 45px)',
              lineHeight: '1.2'
            }}>
              Product List
            </h1>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              aria-label="Toggle filters"
            >
              <Filter className="w-4 h-4" />
              <span className="hidden sm:inline">Filters</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filters panel - bonus feature */}
      {showFilters && (
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-sm text-gray-700 mb-1">Min Price ($)</label>
                <input
                  type="number"
                  name="minPrice"
                  value={filters.minPrice}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Max Price ($)</label>
                <input
                  type="number"
                  name="maxPrice"
                  value={filters.maxPrice}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="1000"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Min Rating</label>
                <input
                  type="number"
                  name="minPopularity"
                  value={filters.minPopularity}
                  onChange={handleFilterChange}
                  min="0"
                  max="5"
                  step="0.1"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Max Rating</label>
                <input
                  type="number"
                  name="maxPopularity"
                  value={filters.maxPopularity}
                  onChange={handleFilterChange}
                  min="0"
                  max="5"
                  step="0.1"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="5"
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={applyFilters}
                className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors"
              >
                Apply Filters
              </button>
              <button
                onClick={clearFilters}
                className="bg-gray-600 text-white px-6 py-2 rounded hover:bg-gray-700 transition-colors"
              >
                Clear Filters
              </button>
              <span className="text-sm text-gray-500 self-center">
                {products.length} products found
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Main product carousel section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {products.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">💎</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No Products Found</h2>
            <p className="text-gray-600">Try adjusting your filters to see more products.</p>
          </div>
        ) : (
          <div className="relative">
            {/* Carousel navigation arrows */}
            {products.length > visibleCount && (
              <>
                <button
                  onClick={prevSlide}
                  className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={currentSlide === 0}
                  aria-label="Previous products"
                >
                  <ChevronLeft className="w-6 h-6 text-gray-600" />
                </button>
                
                <button
                  onClick={nextSlide}
                  className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={currentSlide >= maxSlide}
                  aria-label="Next products"
                >
                  <ChevronRight className="w-6 h-6 text-gray-600" />
                </button>
              </>
            )}

            {/* Carousel container with touch support */}
            <div
              ref={carouselRef}
              className={`overflow-hidden ${products.length > visibleCount ? 'mx-12' : ''}`}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <div
                className="flex gap-4 md:gap-6 transition-transform duration-300 ease-in-out"
                style={{
                  transform: `translateX(-${currentSlide * (100 / visibleCount)}%)`
                }}
              >
                {products.map((product) => (
                  <div 
                    key={product.id} 
                    className="flex-shrink-0"
                    style={{ width: `${100 / visibleCount}%` }}
                  >
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            </div>

            {/* Carousel indicator dots */}
            {products.length > visibleCount && (
              <div className="flex justify-center mt-6 gap-2">
                {Array.from({ length: maxSlide + 1 }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentSlide(i)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      currentSlide === i ? 'bg-gray-800' : 'bg-gray-300'
                    }`}
                    aria-label={`Go to slide ${i + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Color legend - matching PDF design exactly */}
        <div className="mt-8 bg-white rounded-lg p-4 md:p-6 shadow-sm">
          <div className="flex flex-wrap items-center gap-4 md:gap-6">
            <span className="text-gray-700 font-medium text-sm">Click</span>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#E6CA97' }}></div>
              <span className="text-sm text-gray-600">Yellow Gold (#E6CA97)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#D9D9D9' }}></div>
              <span className="text-sm text-gray-600">White Gold (#D9D9D9)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#E1A4A9' }}></div>
              <span className="text-sm text-gray-600">Rose Gold (#E1A4A9)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductListing;
