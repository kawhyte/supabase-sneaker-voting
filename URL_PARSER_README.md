# SoleTracker URL Parser System

A comprehensive system for extracting product data from sneaker retailer websites and managing product information in the SoleTracker database.

## 🚀 Features

### URL Parsing
- **Automatic Data Extraction**: Parse product details from supported retailer URLs
- **Store-Specific Logic**: Custom parsing rules for each supported store
- **Smart Caching**: 15-minute cache to improve performance and reduce API calls
- **Real-Time Validation**: Instant feedback on URL format and store support

### Manual Entry Fallback
- **Complete Control**: Add products when URL parsing isn't available
- **Flexible Input**: Support for custom stores, brands, and product details
- **Multiple Images**: Add multiple product images
- **Custom Sizing**: Define available sizes for each product

### Intelligent Features
- **Duplicate Detection**: Automatically checks for existing products
- **Price History**: Tracks pricing across different stores and sizes
- **Stock Status**: Monitors product availability
- **Image Management**: Handles multiple product images automatically

## 🏪 Supported Stores

| Store | Domain | Features |
|-------|--------|----------|
| **Nike** | nike.com | Brand detection, size parsing, stock status |
| **Snipes USA** | snipesusa.com | Colorway extraction, sale price detection |
| **Shoe Palace** | shoepalace.com | Multi-image support, size availability |
| **Foot Locker** | footlocker.com | Brand/model separation, pricing |
| **Hibbett Sports** | hibbett.com | Stock status, image gallery |

## 📁 System Architecture

```
supabase/functions/parse-product/
├── index.ts                 # Edge Function for URL parsing
app/api/parse-product/
├── route.ts                 # API route with caching layer
components/
├── url-parser.tsx           # URL input and product preview
├── manual-product-entry.tsx # Manual entry form
├── product-data-manager.tsx # Combined interface
└── ui/                      # Shadcn/ui components
lib/
└── product-cache.ts         # Caching system
```

## 🛠 Installation & Setup

### 1. Deploy Edge Function

```bash
# Deploy the parse-product Edge Function
supabase functions deploy parse-product
```

### 2. Database Setup

Ensure your database has the required tables:
- `products` - Core product information
- `stores` - Retailer information
- `price_history` - Historical pricing data

### 3. Environment Variables

Add to your `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 🎯 Usage

### Using the URL Parser

```typescript
import { UrlParser } from '@/components/url-parser'

function MyPage() {
  const handleProductParsed = (product) => {
    console.log('Parsed product:', product)
    // Handle the parsed product data
  }

  return <UrlParser onProductParsed={handleProductParsed} />
}
```

### Using the Manual Entry

```typescript
import { ManualProductEntry } from '@/components/manual-product-entry'

function MyPage() {
  const handleProductAdded = () => {
    console.log('Product added manually')
    // Handle the manually added product
  }

  return <ManualProductEntry onProductAdded={handleProductAdded} />
}
```

### Using the Complete System

```typescript
import { ProductDataManager } from '@/components/product-data-manager'

function MyPage() {
  return <ProductDataManager />
}
```

## 🔧 API Reference

### Parse Product Endpoint

**POST** `/api/parse-product`

```json
{
  "url": "https://www.nike.com/t/product-url",
  "forceRefresh": false // optional, bypasses cache
}
```

**Response:**
```json
{
  "success": true,
  "fromCache": false,
  "product": {
    "name": "Nike Air Force 1 '07",
    "brand": "Nike",
    "model": "Air Force 1 '07",
    "colorway": "White/White",
    "price": 110,
    "salePrice": 99,
    "sku": "DD8959-100",
    "images": ["https://..."],
    "sizes": ["7", "8", "9", "10"],
    "inStock": true,
    "storeId": "nike",
    "url": "https://..."
  },
  "store": {
    "id": "nike",
    "name": "Nike",
    "domain": "nike.com"
  }
}
```

### Cache Management

**GET** `/api/parse-product` - Get cache statistics

**DELETE** `/api/parse-product` - Clear all cache

**DELETE** `/api/parse-product?store=nike` - Clear cache for specific store

## 🧪 Testing

### Sample URLs for Testing

```bash
# Nike
https://www.nike.com/t/air-force-1-07-mens-shoes-5QFp5Z/DD8959-100

# Snipes USA
https://www.snipesusa.com/air-jordan-1-retro-high-og-mens-555088-063.html

# Foot Locker
https://www.footlocker.com/product/nike-dunk-low-mens/DD1391100.html

# Shoe Palace
https://www.shoepalace.com/product/nike/dd1391-100/mens-nike-dunk-low/

# Hibbett Sports
https://www.hibbett.com/nike-air-force-1-07-mens-shoes/
```

### Test Page

Visit `/product-parser` to access the full testing interface.

## ⚡ Performance Features

### Caching System
- **Duration**: 15 minutes per URL
- **Smart Keys**: Normalized URLs for better cache hits
- **Cleanup**: Automatic expired entry removal
- **Store-Specific**: Clear cache by individual store

### Optimization
- **Parallel Processing**: Handle multiple URLs simultaneously
- **Image Optimization**: Limit to 10 images per product
- **Size Detection**: Smart size parsing and normalization
- **Error Handling**: Graceful fallbacks for parsing failures

## 🛡 Error Handling

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `Unsupported store` | Store not in supported list | Add store config or use manual entry |
| `Product name not found` | Page structure changed | Update store selectors |
| `Failed to fetch product page` | Network/server issues | Retry or check URL validity |
| `Invalid URL format` | Malformed URL | Validate URL before parsing |

### Debugging

1. **Check Edge Function logs** in Supabase dashboard
2. **Monitor API route** responses in browser dev tools
3. **Verify cache state** using cache statistics endpoint
4. **Test store selectors** individually in browser console

## 🔄 Adding New Stores

To add support for a new store:

1. **Add store configuration** in `supabase/functions/parse-product/index.ts`:

```typescript
'newstore.com': {
  id: 'new-store',
  name: 'New Store',
  domain: 'newstore.com',
  selectors: {
    name: '.product-title',
    price: '.price',
    // ... other selectors
  },
  priceCleanup: (text: string) => parseFloat(text.replace(/[$,]/g, '')),
  nameParser: (name: string) => {
    // Custom name parsing logic
    return { brand: 'Brand', model: name }
  }
}
```

2. **Add to supported stores list** in components
3. **Test thoroughly** with sample URLs
4. **Update documentation**

## 📊 Monitoring

### Cache Statistics

```typescript
import { productCache } from '@/lib/product-cache'

const stats = productCache.getCacheStats()
console.log(`Cache size: ${stats.size} entries`)
```

### Performance Metrics
- Parse success rate
- Average parse time
- Cache hit ratio
- Store-specific performance

## 🚀 Deployment

1. **Deploy Edge Function**: `supabase functions deploy parse-product`
2. **Build frontend**: `npm run build`
3. **Deploy application**: Follow your hosting provider's process
4. **Test in production**: Use sample URLs to verify functionality

## 🔐 Security Considerations

- **Rate Limiting**: Implement rate limiting for the API endpoint
- **Input Validation**: All URLs are validated before processing
- **Error Sanitization**: Errors are sanitized before client response
- **CORS Headers**: Properly configured for your domain only

## 📈 Future Enhancements

- [ ] **AI-Powered Parsing**: Use ML for better product data extraction
- [ ] **Price Tracking**: Automated price monitoring and alerts
- [ ] **Inventory Sync**: Real-time stock status updates
- [ ] **Mobile App Support**: React Native compatible components
- [ ] **Bulk Import**: CSV/Excel file import functionality
- [ ] **Store Analytics**: Performance metrics per retailer

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new stores/features
4. Submit a pull request with detailed description

## 📄 License

This project is part of SoleTracker and follows the same licensing terms.

---

**Built with ❤️ for the sneaker community**