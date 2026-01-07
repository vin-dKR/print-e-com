# Category-First Product Generation System - Implementation Prompt

## Core Architecture Principle

**Categories are the primary entity** - Products are generated from Category pricing combinations, not created independently. The workflow is:
1. Admin creates/edits a Category with specifications
2. Admin sets up pricing rules with specification combinations
3. Admin can "Publish as Product" to convert a pricing combination into a Product
4. Products can be edited independently after creation
5. Web displays products with stock checking

---

## 1. Database Schema Changes

### 1.1 Add CategoryImage Model

Create a new model similar to `ProductImage` for categories:

```prisma
model CategoryImage {
  id           String   @id @default(uuid())
  categoryId   String
  url          String
  alt          String?
  isPrimary    Boolean  @default(false)
  displayOrder Int      @default(0)
  createdAt    DateTime @default(now())

  category Category @relation(fields: [categoryId], references: [id], onDelete: Cascade)

  @@index([categoryId])
  @@index([categoryId, displayOrder])
  @@index([isPrimary])
  @@map("category_images")
}
```

**Update Category model:**
- Add relation: `images CategoryImage[]`
- Keep existing `image` field for backward compatibility (can be removed later)

### 1.2 Update CategoryPricingRule Model

Add link to Product when published:

```prisma
model CategoryPricingRule {
  // ... existing fields ...
  productId    String?  @unique // Link to Product when published
  isPublished  Boolean  @default(false) // Whether this rule is published as a product
  
  // ... existing relations ...
  product      Product? @relation(fields: [productId], references: [id], onDelete: SetNull)
  
  @@index([productId])
  @@index([isPublished])
  @@index([categoryId, isPublished])
}
```

**Update Product model:**
- Add relation: `pricingRule CategoryPricingRule?` (one-to-one, optional)
- Add field: `generatedFromPricingRule Boolean @default(false)` to track if product was generated from category

---

## 2. Admin Panel - Category Management

### 2.1 Enhanced Category List Page (`/admin/categories`)

**Current State**: Basic table with name, slug, parent, created date

**Required Improvements**:

#### Visual Enhancements:
- **Category Images**: Display primary category image as thumbnail in list
- **Rich Information Display**:
  - Category name (with link to detail)
  - Primary image thumbnail
  - Slug
  - Parent category name (if exists)
  - Active status badge
  - **Specifications count** (e.g., "5 specs")
  - **Pricing rules count** (e.g., "12 pricing rules")
  - **Published products count** (e.g., "8 products")
  - **Total products count** (all products in category)
  - Created/Updated dates

#### Layout Options:
- **Grid View**: Card-based layout showing image, name, stats
- **Table View**: Detailed table with all columns
- **Toggle between views**

#### Filters & Search:
- Search by name, slug
- Filter by active/inactive
- Filter by parent category
- Filter by whether category has published products

#### Actions per Category:
- View/Edit category
- Manage specifications
- Manage pricing
- View published products
- Quick stats (specs count, rules count, products count)

### 2.2 Category Images Management

**Location**: `/admin/categories/[id]/images` or as a tab in category detail page

**Features**:
- Upload multiple images for category
- Set primary image
- Reorder images (drag & drop)
- Delete images
- Add alt text for each image
- Preview gallery

**API Endpoints**:
- `GET /api/v1/admin/categories/:id/images` - Get all category images
- `POST /api/v1/admin/categories/:id/images` - Upload image
- `PUT /api/v1/admin/categories/:id/images/:imageId` - Update image (alt, order, primary)
- `DELETE /api/v1/admin/categories/:id/images/:imageId` - Delete image

### 2.3 Category Detail Page Enhancements

**Current**: Basic category info

**Add Sections**:
1. **Overview Tab**:
   - Category info (name, slug, description)
   - Images gallery
   - Parent/children categories
   - Active status

2. **Specifications Tab**:
   - Manage category specifications (existing)

3. **Pricing Tab**:
   - Manage pricing rules (existing)
   - **NEW**: "Publish as Product" button for each pricing rule

4. **Products Tab**:
   - List all products in this category
   - Show which products were generated from pricing rules
   - Filter: "Generated from Category" vs "Manual Products"
   - Quick actions: Edit, View, Delete

---

## 3. "Publish as Product" Feature

### 3.1 Workflow

When admin clicks "Publish as Product" on a pricing rule:

1. **Pre-fill Product Form** with data from:
   - Category: `categoryId`, category name
   - Pricing Rule: `specificationValues` → product specifications
   - Pricing: `basePrice` → product `basePrice`
   - Category Configuration: `pageTitle`, `pageDescription`, `features`

2. **Product Creation Form** (simplified, pre-filled):
   - **Step 1: Basic Info** (pre-filled, editable)
     - Name: Auto-generated from specification combination (e.g., "A4 70 Gsm BW Single")
     - Slug: Auto-generated
     - Description: From category configuration
     - Short Description: Auto-generated
   
   - **Step 2: Pricing** (pre-filled from pricing rule)
     - Base Price: From `basePrice` in pricing rule
     - Selling Price: Optional
     - MRP: Optional
   
   - **Step 3: Inventory** (admin sets)
     - SKU: Auto-generated or manual
     - Stock: Default 0, admin sets
     - Min/Max Order Quantity
   
   - **Step 4: Images** (optional)
     - Copy category images to product
     - Or upload new images
   
   - **Step 5: Specifications** (auto-filled from `specificationValues`)
     - Convert pricing rule `specificationValues` to `ProductSpecification` entries
     - Admin can add more
   
   - **Step 6: Review & Publish**
     - Summary of all data
     - Publish button

3. **After Publishing**:
   - Create Product record
   - Link `CategoryPricingRule.productId` to new product
   - Set `CategoryPricingRule.isPublished = true`
   - Set `Product.generatedFromPricingRule = true`
   - Convert `specificationValues` to `ProductSpecification` entries

### 3.2 API Endpoints

- `POST /api/v1/admin/categories/:categoryId/pricing-rules/:ruleId/publish`
  - Request body: Additional product data (stock, images, etc.)
  - Response: Created product with full details

- `GET /api/v1/admin/categories/:categoryId/pricing-rules/:ruleId/preview-product`
  - Returns pre-filled product data for preview before publishing

### 3.3 UI Components

**In Pricing Rules Table/Matrix**:
- do not show the raw json instead you can represent it with specefication make it more understandable by layman 
- Add "Publish" button/icon for each pricing rule
- Show status: "Published" badge if `isPublished = true`
- Link to product if published

**Publish Modal/Page**:
- Multi-step form (as described above)
- Preview before publishing
- Option to "Save as Draft" (create product but don't publish)

---

## 4. Product Editing

### 4.1 Edit Products Generated from Categories

**Key Points**:
- Products can be edited independently after creation
- Editing product does NOT automatically update the pricing rule
- Admin can choose to "Sync with Pricing Rule" (optional feature)
- If pricing rule is updated, admin can choose to "Update Product from Rule"

**Product Edit Page** (`/admin/products/[id]/edit`):
- Full product editing form
- Show indicator: "Generated from Category: [Category Name]"
- Show link to source pricing rule
- Option to "Unlink from Pricing Rule" (makes it a manual product)
- Option to "Update from Pricing Rule" (syncs pricing and specifications)

### 4.2 Product List Enhancements

**Add Columns**:
- "Source" column: "Category" or "Manual"
- Link to category if generated from category
- Link to pricing rule if applicable

**Filters**:
- Filter by source: "From Category" vs "Manual"
- Filter by category
- Filter by stock status

---

## 5. Stock Management & "Out of Stock" Display

### 5.1 Stock Checking Logic

**On Web Side** (`localhost/`):

When displaying products from a category:
1. Check if product exists for the selected specification combination
2. If product exists:
   - Check `Product.stock`
   - If `stock > 0`: Show "In Stock" / "Add to Cart"
   - If `stock = 0`: Show "Out of Stock" / disable "Add to Cart"
3. If product doesn't exist (pricing rule not published):
   - Show "Available" (can still calculate price from pricing rule)
   - Or show "Contact for Availability"

### 5.2 Web Product Display

**Category Service Page** (`/localhost/services/[categorySlug]`):

- User selects specification combinations
- System checks if a Product exists for that combination:
  - If yes: Show product details, stock status, "Add to Cart"
  - If no: Show calculated price from pricing rule, "Request Quote" or "Contact Us"
- Display "Out of Stock" badge/notice when `stock = 0`
- Disable quantity selector and "Add to Cart" when out of stock

**Product Detail Page** (`/localhost/products/[id]`):

- Show stock status prominently
- If `stock = 0`:
  - Display "Out of Stock" badge
  - Show "Notify Me When Available" option
  - Disable "Add to Cart"
  - Show estimated restock date (if available in product metadata)

### 5.3 API Endpoints

- `GET /api/v1/categories/:slug/products?specifications={...}`
  - Returns products matching specification combination
  - Includes stock status

- `GET /api/v1/products/:id/stock`
  - Returns current stock level

---

## 6. Detailed Category List Implementation

### 6.1 Enhanced Category List Component

**File**: `apps/admin/app/components/features/categories/categories-list.tsx`

**New Features**:

1. **Card/Grid View**:
   ```tsx
   - Category image (primary)
   - Category name
   - Active badge
   - Quick stats:
     * X Specifications
     * Y Pricing Rules
     * Z Published Products
   - Actions: View, Edit, Manage
   ```

2. **Detailed Table View**:
   - Image thumbnail
   - Name (link)
   - Slug
   - Parent category
   - Active status
   - Specifications count
   - Pricing rules count
   - Published products count
   - Total products count
   - Created date
   - Updated date
   - Actions

3. **Stats Aggregation**:
   - Fetch category with counts:
     - `_count.specifications`
     - `_count.pricingRules`
     - `_count.products` (total)
     - `_count.pricingRules` where `isPublished = true` (published products)

### 6.2 API Updates

**Update**: `GET /api/v1/admin/categories`

**Response should include**:
```json
{
  "categories": [
    {
      "id": "...",
      "name": "...",
      "slug": "...",
      "image": "...",
      "images": [...], // NEW: array of category images
      "isActive": true,
      "parent": {...},
      "_count": {
        "specifications": 5,
        "pricingRules": 12,
        "products": 8,
        "publishedPricingRules": 6 // NEW: count of published rules
      },
      "primaryImage": {...} // NEW: primary category image
    }
  ]
}
```

---

## 7. Web Side - Category & Product Display

### 7.1 Category Listing Page

**Route**: `/localhost/categories` or `/localhost/services`

**Display**:
- Grid of category cards
- Each card shows:
  - Primary category image
  - Category name
  - Description
  - Link to category service page
  - Count of available products (optional)

### 7.2 Category Service Page

**Route**: `localhost/services/[categorySlug]`

**Features**:
- Display category images (gallery)
- Show category description
- Dynamic specification selectors (existing)
- Real-time price calculation (existing)
- **NEW**: Check for published products matching selection
- **NEW**: Show stock status
- **NEW**: "Add to Cart" or "Out of Stock" based on product availability

### 7.3 Product Detail Page

**Route**: `localhost/products/[id]`

**Ensure all product data is displayed**:
- All images (gallery)
- Name, description, short description
- Pricing (basePrice, sellingPrice, MRP)
- Stock status (prominent)
- Specifications (from ProductSpecification)
- Attributes (for filtering)
- Tags
- Variants (if any)
- Return policy, warranty
- Reviews, ratings
- Related products

**Stock Handling**:
- If `stock = 0`: Show "Out of Stock" prominently
- Disable "Add to Cart"
- Show "Notify Me" option
- If `stock > 0`: Show stock count or "In Stock"

---

## 8. Implementation Checklist

### Phase 1: Database & API
- [ ] Add `CategoryImage` model to schema
- [ ] Update `CategoryPricingRule` with `productId` and `isPublished`
- [ ] Update `Product` with `generatedFromPricingRule`
- [ ] Run migrations
- [ ] Create API endpoints for category images
- [ ] Update category API to include image counts and stats
- [ ] Create "Publish as Product" API endpoint

### Phase 2: Admin - Category Images
- [ ] Create category image upload component
- [ ] Add images tab/section to category detail page
- [ ] Implement image management (upload, delete, reorder, set primary)
- [ ] Update category list to show images

### Phase 3: Admin - Enhanced Category List
- [ ] Update category list component with rich information
- [ ] Add grid/card view option
- [ ] Add stats columns (specs count, rules count, products count)
- [ ] Update API calls to fetch counts
- [ ] Add filters and search enhancements

### Phase 4: Admin - Publish as Product
- [ ] Create "Publish as Product" button in pricing rules
- [ ] Create multi-step publish form
- [ ] Implement product creation from pricing rule
- [ ] Add "Published" status indicators
- [ ] Link products to pricing rules

### Phase 5: Admin - Product Management
- [ ] Update product list to show source (Category/Manual)
- [ ] Add product edit page with category link
- [ ] Add "Update from Pricing Rule" option
- [ ] Add "Unlink from Pricing Rule" option

### Phase 6: Web - Stock & Availability
- [ ] Update category service page to check for products
- [ ] Implement stock checking logic
- [ ] Add "Out of Stock" display
- [ ] Disable cart actions when out of stock
- [ ] Update product detail page with stock status

### Phase 7: Web - Category Display
- [ ] Create category listing page with images
- [ ] Update category service pages to show all product data
- [ ] Ensure product detail pages show all fields

---

## 9. Success Criteria

✅ Categories have multiple images (like products)  
✅ Category list shows rich information (images, stats, counts)  
✅ Pricing rules can be published as products  
✅ Products generated from categories are clearly marked  
✅ Products can be edited independently  
✅ Stock checking works on web side  
✅ "Out of Stock" is displayed when stock = 0  
✅ Web displays all product data comprehensively  
✅ Category-first workflow is intuitive for admins  

---

## 10. Technical Notes

- **Backward Compatibility**: Keep existing `Category.image` field during migration
- **Performance**: Use database indexes for counts and lookups
- **Validation**: Ensure pricing rule → product conversion validates all required fields
- **Error Handling**: Handle cases where pricing rule is deleted but product exists
- **UI/UX**: Make "Publish as Product" workflow smooth and intuitive
- **Stock Sync**: Consider if stock should sync between pricing rules and products (probably not, keep independent)

---

## 11. Example Workflow

1. **Admin creates "PDF Printing" category**
   - Adds images (A4 paper, printer, etc.)
   - Adds specifications (Paper Size, Paper Type, Color, etc.)
   - Sets up pricing rules for combinations

2. **Admin publishes a pricing rule**
   - Selects: A4, 70 Gsm, BW, Single
   - Clicks "Publish as Product"
   - Fills in stock: 1000
   - Publishes → Product created

3. **Customer on web**
   - Visits PDF Printing service page
   - Selects: A4, 70 Gsm, BW, Single
   - System finds published product
   - Shows: "In Stock (1000 available)"
   - Can add to cart

4. **Stock runs out**
   - Admin sets stock to 0
   - Customer selects same combination
   - System shows: "Out of Stock"
   - "Add to Cart" is disabled

