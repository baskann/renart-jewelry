const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());

// Product data from JSON file
const products = [
  {
    "id": 1,
    "name": "Engagement Ring 1",
    "popularityScore": 0.85,
    "weight": 2.1,
    "images": {
      "yellow": "https://cdn.shopify.com/s/files/1/0484/1429/4167/files/EG085-100P-Y.jpg?v=1696588368",
      "rose": "https://cdn.shopify.com/s/files/1/0484/1429/4167/files/EG085-100P-R.jpg?v=1696588406",
      "white": "https://cdn.shopify.com/s/files/1/0484/1429/4167/files/EG085-100P-W.jpg?v=1696588402"
    }
  },
  {
    "id": 2,
    "name": "Engagement Ring 2",
    "popularityScore": 0.51,
    "weight": 3.4,
    "images": {
      "yellow": "https://cdn.shopify.com/s/files/1/0484/1429/4167/files/EG012-Y.jpg?v=1707727068",
      "rose": "https://cdn.shopify.com/s/files/1/0484/1429/4167/files/EG012-R.jpg?v=1707727068",
      "white": "https://cdn.shopify.com/s/files/1/0484/1429/4167/files/EG012-W.jpg?v=1707727068"
    }
  },
  {
    "id": 3,
    "name": "Engagement Ring 3",
    "popularityScore": 0.92,
    "weight": 3.8,
    "images": {
      "yellow": "https://cdn.shopify.com/s/files/1/0484/1429/4167/files/EG020-100P-Y.jpg?v=1683534032",
      "rose": "https://cdn.shopify.com/s/files/1/0484/1429/4167/files/EG020-100P-R.jpg?v=1683534032",
      "white": "https://cdn.shopify.com/s/files/1/0484/1429/4167/files/EG020-100P-W.jpg?v=1683534032"
    }
  },
  {
    "id": 4,
    "name": "Engagement Ring 4",
    "popularityScore": 0.88,
    "weight": 4.5,
    "images": {
      "yellow": "https://cdn.shopify.com/s/files/1/0484/1429/4167/files/EG022-100P-Y.jpg?v=1683532153",
      "rose": "https://cdn.shopify.com/s/files/1/0484/1429/4167/files/EG022-100P-R.jpg?v=1683532153",
      "white": "https://cdn.shopify.com/s/files/1/0484/1429/4167/files/EG022-100P-W.jpg?v=1683532153"
    }
  },
  {
    "id": 5,
    "name": "Engagement Ring 5",
    "popularityScore": 0.80,
    "weight": 2.5,
    "images": {
      "yellow": "https://cdn.shopify.com/s/files/1/0484/1429/4167/files/EG074-100P-Y.jpg?v=1696232035",
      "rose": "https://cdn.shopify.com/s/files/1/0484/1429/4167/files/EG074-100P-R.jpg?v=1696927124",
      "white": "https://cdn.shopify.com/s/files/1/0484/1429/4167/files/EG074-100P-W.jpg?v=1696927124"
    }
  },
  {
    "id": 6,
    "name": "Engagement Ring 6",
    "popularityScore": 0.82,
    "weight": 1.8,
    "images": {
      "yellow": "https://cdn.shopify.com/s/files/1/0484/1429/4167/files/EG075-100P-Y.jpg?v=1696591786",
      "rose": "https://cdn.shopify.com/s/files/1/0484/1429/4167/files/EG075-100P-R.jpg?v=1696591802",
      "white": "https://cdn.shopify.com/s/files/1/0484/1429/4167/files/EG075-100P-W.jpg?v=1696591798"
    }
  },
  {
    "id": 7,
    "name": "Engagement Ring 7",
    "popularityScore": 0.70,
    "weight": 5.2,
    "images": {
      "yellow": "https://cdn.shopify.com/s/files/1/0484/1429/4167/files/EG094-100P-Y.jpg?v=1696589183",
      "rose": "https://cdn.shopify.com/s/files/1/0484/1429/4167/files/EG094-100P-R.jpg?v=1696589214",
      "white": "https://cdn.shopify.com/s/files/1/0484/1429/4167/files/EG094-100P-W.jpg?v=1696589210"
    }
  },
  {
    "id": 8,
    "name": "Engagement Ring 8",
    "popularityScore": 0.90,
    "weight": 3.7,
    "images": {
      "yellow": "https://cdn.shopify.com/s/files/1/0484/1429/4167/files/EG115-100P-Y.jpg?v=1696596076",
      "rose": "https://cdn.shopify.com/s/files/1/0484/1429/4167/files/EG115-100P-R.jpg?v=1696596151",
      "white": "https://cdn.shopify.com/s/files/1/0484/1429/4167/files/EG115-100P-W.jpg?v=1696596147"
    }
  }
];

// Cache gold price for 10 minutes to improve performance
let goldPriceCache = {
  price: null,
  lastUpdated: null
};

// Fetch current gold price from external API
async function getGoldPrice() {
  try {
    const now = Date.now();
    
    // Return cached price if still valid
    if (goldPriceCache.price && goldPriceCache.lastUpdated && 
        (now - goldPriceCache.lastUpdated) < 10 * 60 * 1000) {
      return goldPriceCache.price;
    }

    // Fetch fresh gold price
    const response = await axios.get('https://api.metals.live/v1/spot/gold');
    const goldPricePerOz = response.data.price;
    const goldPricePerGram = goldPricePerOz / 31.1035; // Convert ounce to gram
    
    // Update cache
    goldPriceCache.price = goldPricePerGram;
    goldPriceCache.lastUpdated = now;
    
    return goldPricePerGram;
  } catch (error) {
    console.error('Gold price API error:', error);
    return 65; // Fallback price if API fails
  }
}

// Calculate product price using the required formula
function calculatePrice(popularityScore, weight, goldPrice) {
  return (popularityScore + 1) * weight * goldPrice;
}

// Convert popularity score to 5-star rating with 1 decimal place
function convertToStarRating(popularityScore) {
  return Math.round(popularityScore * 50) / 10;
}

// Get all products with dynamic pricing and optional filtering
app.get('/api/products', async (req, res) => {
  try {
    const goldPrice = await getGoldPrice();
    const { minPrice, maxPrice, minPopularity, maxPopularity } = req.query;
    
    // Calculate prices for all products
    let filteredProducts = products.map(product => ({
      ...product,
      price: calculatePrice(product.popularityScore, product.weight, goldPrice),
      starRating: convertToStarRating(product.popularityScore),
      goldPrice: goldPrice
    }));

    // Apply price filters if provided
    if (minPrice || maxPrice) {
      filteredProducts = filteredProducts.filter(product => {
        const price = product.price;
        return (!minPrice || price >= parseFloat(minPrice)) &&
               (!maxPrice || price <= parseFloat(maxPrice));
      });
    }

    // Apply popularity filters if provided
    if (minPopularity || maxPopularity) {
      filteredProducts = filteredProducts.filter(product => {
        const popularity = product.starRating;
        return (!minPopularity || popularity >= parseFloat(minPopularity)) &&
               (!maxPopularity || popularity <= parseFloat(maxPopularity));
      });
    }

    res.json({
      success: true,
      products: filteredProducts,
      goldPrice: goldPrice,
      totalProducts: filteredProducts.length
    });
  } catch (error) {
    console.error('Products API error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching products',
      error: error.message
    });
  }
});

// Get single product by ID
app.get('/api/products/:id', async (req, res) => {
  try {
    const goldPrice = await getGoldPrice();
    const productId = parseInt(req.params.id);
    const product = products.find(p => p.id === productId);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Calculate price for single product
    const productWithPrice = {
      ...product,
      price: calculatePrice(product.popularityScore, product.weight, goldPrice),
      starRating: convertToStarRating(product.popularityScore),
      goldPrice: goldPrice
    };

    res.json({
      success: true,
      product: productWithPrice
    });
  } catch (error) {
    console.error('Single product API error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching product',
      error: error.message
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;