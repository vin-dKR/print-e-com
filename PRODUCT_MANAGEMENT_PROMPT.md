## Admin Product Management – Full Feature Prompt

### 1. Objective

Design and implement a complete **admin-manageable Product Management system** that uses **all fields from the `Product` model (and related models like `ProductImage`, `ProductVariant`, `ProductSpecification`, `ProductAttribute`, `ProductTag`)** defined in `apps/api/prisma/schema.prisma`.  
The current admin only shows very basic product info; this system must support **end‑to‑end product lifecycle**:
- Creating products
- Editing and organizing products
- Managing images, variants, attributes, specifications, tags
- Linking products to categories
- Managing pricing, inventory, SEO, and merchandising flags

Everything must be manageable by admins in the UI, without code changes.

---

### 2. Data Model (from `schema.prisma`)

Use these models and **cover all fields** in the admin UI and API design.

#### 2.1 `Category`
- `id`, `name`, `slug`, `description`, `image`, `parentId`, `isActive`, `createdAt`, `updatedAt`
- Relations: `products`, `specifications`, `pricingRules`, `configuration`

#### 2.2 `Brand` (not needed)
- Already exists; use as selectable relation for products (`brandId`). ***do not do this part 

#### 2.3 `Product`
- **Identification & basic info**
  - `id`: String (UUID, generated)
  - `name`: String
  - `slug`: String? (`@unique`, nullable for migration but should be required in new UI)
  - `description`: String?
  - `shortDescription`: String?
- **Pricing**
  - `basePrice`: Decimal (core base price)
  - `sellingPrice`: Decimal? (discounted/offer price)
  - `mrp`: Decimal? (maximum retail price)
- **Classification**
  - `categoryId`: String (required; link to `Category`)
  - `brandId`: String? (optional link to `Brand`)
- **Inventory & sales**
  - `sku`: String? (`@unique`)
  - `stock`: Int (current stock)
  - `minOrderQuantity`: Int
  - `maxOrderQuantity`: Int?
  - `totalSold`: Int (readonly/statistics)
- **Logistics & physical details**
  - `weight`: Decimal? (kg)
  - `dimensions`: String? (e.g. `10x5x2 cm`)
- **Merchandising flags**
  - `isActive`: Boolean
  - `isFeatured`: Boolean
  - `isNewArrival`: Boolean
  - `isBestSeller`: Boolean
- **Ratings & social proof**
  - `rating`: Decimal? (avg 0–5)
  - `totalReviews`: Int
- **Policies**
  - `returnPolicy`: String?
  - `warranty`: String?
- **Timestamps**
  - `createdAt`, `updatedAt`
- **Relations (to be managed or surfaced)**
  - `category`
  - `variants: ProductVariant[]`
  - `images: ProductImage[]`
  - `specifications: ProductSpecification[]`
  - `attributes: ProductAttribute[]`
  - `tags: ProductTag[]`
  - `orderItems`, `cartItems`, `wishlistItems`, `reviews`, `recentlyViewed`, `offerProducts` (mostly read‑only context in admin)

#### 2.4 `ProductImage`
- `id`, `productId`, `url`, `alt`, `isPrimary`, `displayOrder`, `createdAt`

#### 2.5 `ProductSpecification`
- `id`, `productId`, `key`, `value`, `displayOrder`, `createdAt`
  - Use as **free‑form key/value specs** shown in product detail pages.

#### 2.6 `ProductAttribute`
- `id`, `productId`, `attributeType`, `attributeValue`, `createdAt`
  - Use for **filterable attributes** (e.g. color=red, size=L).

#### 2.7 `ProductTag`
- `id`, `productId`, `tag`, `createdAt`
  - Use as simple textual tags for search and merchandising.

#### 2.8 `ProductVariant`
- `id`, `productId`, `name`, `sku?`, `stock`, `priceModifier`, `available`, `createdAt`, `updatedAt`
  - Represents SKUs under a product (e.g. sizes or colors) with **delta pricing** via `priceModifier`.

---

### 3. Admin UX Flow – Multi‑Step Product Creation

Implement a **multi‑step wizard** for creating and editing products. At minimum, include these steps; you may split/merge where it improves UX but do not drop any fields.

#### Step 1: Product Information (Basic Info)
- Fields:
  - `name` (required)
  - `slug` (required, auto‑suggest from name with option to edit; enforce uniqueness)
  - `shortDescription`
  - `description` (rich text)
  - `isActive` (default: true)
- UI/behavior:
  - Show validation errors inline.
  - Prevent moving to next step if required fields invalid.

#### Step 2: Product Detail Information (Classification & Pricing)
- **Category**
  - `categoryId` (required; select from active categories, support search/tree for parent/child)
- **Pricing**
  - `basePrice` (required)
  - `sellingPrice` (optional; must be `<= mrp` if `mrp` is set, and usually `<= basePrice` – validate and warn)
  - `mrp` (optional)
  - Auto‑show computed **discount percentage** between `mrp` and `sellingPrice` (if both exist).
- **Policies**
  - `returnPolicy` (textarea or editor)
  - `warranty` (textarea or editor)

#### Step 3: Inventory & Logistics
- **Inventory**
  - `sku` (optional but recommended; unique validation)
  - `stock` (required; Int >= 0)
  - `minOrderQuantity` (required; default 1)
  - `maxOrderQuantity` (optional; if set, must be `>= minOrderQuantity`)
- **Physical details**
  - `weight` (kg; Decimal, optional)
  - `dimensions` (string; helper hint like `"length x width x height cm"`)

#### Step 4: Merchandising & SEO
- **Flags**
  - `isFeatured`
  - `isNewArrival`
  - `isBestSeller`
  - (Optionally surface `totalSold`, `rating`, `totalReviews` as read‑only stats)
- **SEO & URLs**
  - Confirm `slug` and show resulting product URL path.
  - Optional meta title/description fields (if you add a separate SEO config model; otherwise describe how slug + names will be used).

#### Step 5: Images (`ProductImage` management)
- Support **full CRUD for images**:
  - Upload new images (integrate with existing file storage pipeline used in the app).
  - Set `url` automatically after upload.
  - Edit `alt` text.
  - Toggle `isPrimary` (ensure only one primary per product).
  - Reorder using drag‑and‑drop to update `displayOrder`.
  - Delete images.
- UI requirements:
  - Thumbnail grid view.
  - Clearly indicate primary image.
  - Validation: require at least **one** image before publishing a product (configurable, but assume yes by default).

#### Step 6: Specifications (`ProductSpecification`)
- Manage **structured key/value specifications**:
  - Add rows with:
    - `key` (e.g., “Material”, “Paper Size”, “Pages”)
    - `value` (e.g., “Cotton”, “A4”, “200 pages”)
    - `displayOrder`
  - Allow reordering rows.
  - Allow deleting and editing existing specs.
- These specifications will appear on the public product detail page as a **Specifications** section.

#### Step 7: Attributes & Tags (`ProductAttribute`, `ProductTag`)
- **Attributes** (filterable facets):
  - UI to add/edit/remove:
    - `attributeType` (e.g., “color”, “size”, “finish”)
    - `attributeValue` (e.g., “red”, “L”, “matte”)
  - Suggest common attribute types and values (optional; good UX).
- **Tags**:
  - Simple tagging UI (chips / tokens) for:
    - `tag` (e.g., “trending”, “sale”, “recommended”)
  - Use tags for search, recommendations, merchandising.

#### Step 8: Variants (`ProductVariant`)
- Support products that have multiple variants (e.g., size/color) with **per‑variant stock and price modifiers**.
- Variant fields:
  - `name` (required; e.g., “A4 – 70 Gsm – Color”, “Size L”)
  - `sku` (optional; unique; may override product sku semantics)
  - `stock` (Int; required; variant‑level stock)
  - `priceModifier` (Decimal; required; can be `0`; represents delta vs `basePrice`:
    - final price = `basePrice` + `priceModifier`)
  - `available` (Boolean)
- Features:
  - Add/edit/delete variants.
  - Bulk actions (e.g., set availability or stock for multiple variants).
  - Display computed final price per variant in the UI.
  - Optional: derive variant names from specifications/attributes selected for that variant.

#### Step 9: Review & Publish
- Final step summarizing:
  - Basic info (name, slug, category)
  - Pricing
  - Inventory
  - Images
  - Variants
  - Specs & attributes
- Allow:
  - Save as **Draft** (`isActive = false`)
  - **Publish** (`isActive = true`) if validation passes
  - Edit later via the same wizard (support jumping between steps).

---

### 4. Admin Product List & Detail Pages

#### 4.1 Product List Page (Index)
- Columns (at minimum):
  - Name, Category, Brand
  - Base Price, Selling Price, Stock
  - Status badges: `isActive`, `isFeatured`, `isNewArrival`, `isBestSeller`
  - Created/Updated at
- Features:
  - Search by name, slug, sku.
  - Filters:
    - Category
    - Brand
    - Active/Inactive
    - Featured/New Arrival/Best Seller
  - Pagination and sorting (by createdAt, name, price, stock).
  - Bulk actions: activate/deactivate, mark featured, etc.
  - Quick actions: view, edit, duplicate product.

#### 4.2 Product Detail View (Admin)
- Read‑only view combining key information from all steps, with clear link to “Edit” (wizard), “View on site”, and logs (optional).

---

### 5. API Design (Admin & Public)

#### 5.1 Admin Product API (under `/api/v1/admin/products`)
- `GET /products`
  - Query params: pagination, search, filters (categoryId, brandId, isActive, flags).
- `POST /products`
  - Create product with core fields (steps 1–3, 4 flags).
- `GET /products/:id`
  - Returns product with:
    - core `Product` fields
    - `images`, `specifications`, `attributes`, `tags`, `variants`
    - related `category` basic info.
- `PUT /products/:id`
  - Update product core fields.
- `DELETE /products/:id`
  - Soft delete or deactivate (prefer `isActive` toggle; document behavior).

#### 5.2 Nested/Related Resources
- `POST /products/:id/images`, `PUT /products/:id/images/:imageId`, `DELETE /products/:id/images/:imageId`
- `POST /products/:id/specifications`, `PUT /products/:id/specifications/:specId`, `DELETE /products/:id/specifications/:specId`
- `POST /products/:id/attributes`, `DELETE /products/:id/attributes/:attrId`
- `POST /products/:id/tags`, `DELETE /products/:id/tags/:tagId`
- `POST /products/:id/variants`, `PUT /products/:id/variants/:variantId`, `DELETE /products/:id/variants/:variantId`
- Implement batch endpoints where convenient (e.g., bulk variant update).

#### 5.3 Public Product API
- `GET /products/:slug`
  - Returns product with:
    - `Product` core fields
    - primary `ProductImage` + gallery
    - `ProductSpecification` list
    - `ProductAttribute` list
    - `ProductVariant` list and computed prices
    - category & brand summary
- Use these fields for the storefront product page and for integrating with dynamic category/specification/pricing systems.

---

### 6. Validation, Security, and DX

- **Validation**
  - Enforce all required fields from the schema (e.g., `name`, `basePrice`, `categoryId`, `stock`, `minOrderQuantity`).
  - Type‑safe DTOs in TypeScript for all admin endpoints.
  - Prevent invalid price relationships (e.g., `sellingPrice` > `mrp`).
  - Ensure uniqueness constraints (`slug`, `sku`, `ProductImage.isPrimary` per product).
- **Security**
  - All admin product APIs must require admin authentication and authorization.
  - Audit logging for critical changes (optional but recommended).
- **Developer Experience**
  - Keep APIs RESTful and consistent with existing admin/category APIs.
  - Reuse existing infrastructure (error handling, pagination, response envelopes).

---

### 7. Integration with Category System

- When selecting `categoryId` for a product:
  - Use the existing category tree from the new category/specification system.
  - Optionally:
    - Suggest default attributes/specifications based on the category’s specification schema.
    - Allow admins to map product‑level specs/variants to category‑level specs.

---

### 8. Success Criteria

- **Coverage**
  - Every field on the `Product` model is either:
    - Editable in the admin, or
    - Clearly surfaced as read‑only/statistical (e.g., `totalSold`, `rating`, `totalReviews`).
  - Full CRUD for `ProductImage`, `ProductVariant`, `ProductSpecification`, `ProductAttribute`, and `ProductTag`.
- **Usability**
  - Product creation feels like a guided, logical multi‑step flow.
  - Admins can create complex products (with variants, specs, images) without touching code.
- **Consistency**
  - APIs follow existing patterns used by categories and other admin modules.
  - Storefront uses the enriched product data cleanly.


