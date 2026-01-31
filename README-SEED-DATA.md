# ?? Database Seed Data Guide

## Overview

The application automatically seeds essential data when running in **Development** environment on first launch.

---

## ?? Seeded Data Structure

### 1?? **Admin Roles** (for Admin Dashboard)

| Role | Description | Permissions |
|------|-------------|------------|
| **SuperAdmin** | Full system access | All permissions (*) |
| **Monitor** | Read-only monitoring | ViewDashboard, ViewReports, ViewUsers, ViewProducts, ViewOrders, ViewAnalytics |
| **Support** | Customer support | ManageDisputes, ManageReturns, ViewUsers, ViewOrders, SendNotifications |
| **ContentModerator** | Content moderation | ModerateProducts, ModerateReviews, HandleReports, ViewUsers |
| **FinanceManager** | Financial management | ManagePlatformFees, ProcessWithdrawals, ViewFinancialReports |

---

### 2?? **Categories** (eBay Main Categories)

- Electronics
- Fashion
- Home & Garden
- Motors
- Collectibles & Art
- Sports & Outdoors
- Toys & Hobbies
- Books, Movies & Music
- Health & Beauty
- Business & Industrial
- Jewelry & Watches
- Baby Essentials
- Pet Supplies
- Musical Instruments

---

### 3?? **Platform Fees** (Based on Real eBay Structure)

| Fee Type | Category | Rate | Max Cap | Description |
|----------|----------|------|---------|-------------|
| **FinalValueFee** | All Categories | 12.9% | None | Standard fee on final sale price |
| **FinalValueFee** | Motors | 3.0% | $125 | Lower rate for vehicles |
| **FinalValueFee** | Collectibles & Art | 15.0% | None | Higher rate for collectibles |
| **ListingFee** | All | $0.35 | None | Per listing (after 250 free) |
| **PromotedListingFee** | All | 8.0% | None | Optional marketing fee |

---

### 4?? **Sample Users**

#### Default Admin
- **Username:** `administrator@localhost`
- **Password:** `Administrator1!`
- **Role:** Administrator (Identity)

#### Sample Buyers/Sellers
- **john_buyer** - Verified buyer
- **tech_seller_pro** - Verified seller (2FA enabled)
- **fashion_boutique** - Verified seller
- **pending_seller** - Pending approval seller

**Default Password for all sample users:** `Password123!`

---

### 5?? **Sample Products**

- Apple iPhone 15 Pro Max - $1,199.99
- Sony WH-1000XM5 Headphones - $349.99
- Vintage Nike Air Jordan 1 (Auction) - Starting $2,500
- Gucci Marmont Bag - $1,850

---

## ?? How to Seed Database

### **Automatic (On First Run)**

```powershell
cd src/Web
dotnet run
```

The seeding happens automatically when:
- Environment is **Development**
- Database is empty

### **Manual Re-seed**

If you want to reset and re-seed:

```powershell
# 1. Drop database
cd src/Infrastructure
dotnet ef database drop --context ApplicationDbContext --startup-project ../Web --force

# 2. Re-create and seed
cd ../Web
dotnet run
```

---

## ?? Verify Seeded Data

### **Check via SQL**

```sql
-- Check Admin Roles
SELECT * FROM AdminRoles;

-- Check Categories
SELECT * FROM Category;

-- Check Platform Fees
SELECT * FROM PlatformFees;

-- Check Sample Users
SELECT id, username, email, role, status, approvalStatus FROM [User];

-- Check Sample Products
SELECT id, title, price, status FROM Product;
```

### **Check via Application**

1. Run the application
2. Navigate to `/swagger` for API endpoints
3. Use admin credentials to login
4. Access admin dashboard

---

## ?? Seed Data Breakdown

### **Admin Roles Permissions Explained**

```json
// SuperAdmin
["*"] // All permissions

// Monitor
[
  "ViewDashboard",
  "ViewReports", 
  "ViewUsers",
  "ViewProducts",
  "ViewOrders",
  "ViewAnalytics"
]

// Support
[
  "ViewDashboard",
  "ManageDisputes",
  "ManageReturns",
  "ViewUsers",
  "ViewOrders",
  "SendNotifications"
]

// ContentModerator
[
  "ViewDashboard",
  "ModerateProducts",
  "ModerateReviews",
  "HandleReports",
  "ViewUsers"
]

// FinanceManager
[
  "ViewDashboard",
  "ManagePlatformFees",
  "ProcessWithdrawals",
  "ViewFinancialReports"
]
```

---

## ?? Platform Fee Calculation Examples

### **Standard Product (Electronics)**
- Selling Price: $1,000
- Platform Fee (12.9%): $129
- Seller Receives: $871

### **Vehicle (Motors Category)**
- Selling Price: $25,000
- Platform Fee (3% capped at $125): $125
- Seller Receives: $24,875

### **Collectible Item**
- Selling Price: $5,000
- Platform Fee (15%): $750
- Seller Receives: $4,250

---

## ?? Default Credentials

### **Admin Access**
```
Email: administrator@localhost
Password: Administrator1!
```

### **Sample User Access**
```
Username: tech_seller_pro
Password: Password123!
```

---

## ?? Important Notes

1. **Development Only:** Seed data only runs in Development environment
2. **Idempotent:** Running seed multiple times won't duplicate data
3. **Password Hashing:** All passwords are BCrypt hashed
4. **Seller Wallets:** Auto-created for all seller accounts (balance: $0)

---

## ?? Testing Scenarios

Use seeded data to test:

? Admin login and role permissions
? Category browsing
? Product listing with different fee structures
? User approval workflow (pending_seller)
? Platform fee calculations
? Seller wallet management
? 2FA flow (tech_seller_pro has 2FA enabled)

---

## ?? Customizing Seed Data

To modify seed data, edit: `src/Infrastructure/Data/ApplicationDbContextInitialiser.cs`

**Key sections:**
- Line 90-140: Admin Roles
- Line 142-180: Categories  
- Line 182-250: Platform Fees
- Line 252-310: Sample Users
- Line 320-380: Sample Products

---

## ?? Reset Database

```powershell
# Complete reset
cd src/Infrastructure
dotnet ef database drop --force --context ApplicationDbContext --startup-project ../Web
dotnet ef database update --context ApplicationDbContext --startup-project ../Web

# Application will auto-seed on next run
cd ../Web
dotnet run
```

---

## ?? Expected Data Counts After Seeding

| Entity | Count |
|--------|-------|
| Admin Roles | 5 |
| Categories | 14 |
| Platform Fees | 5 |
| Sample Users | 4 |
| Sample Products | 4 |
| Seller Wallets | 3 |
| Identity Admin | 1 |

---

## ?? Troubleshooting

### **Seed not running**
- Check environment is Development
- Verify connection string in `appsettings.Development.json`
- Check logs for errors

### **Duplicate key errors**
- Seed is idempotent, should not happen
- If occurs, drop and recreate database

### **Password validation errors**
- Ensure password meets complexity requirements
- Default: min 6 chars, uppercase, lowercase, number, special char

---

## ?? References

- Real eBay Fee Structure: https://www.ebay.com/help/selling/fees-credits-invoices
- eBay Categories: https://www.ebay.com/n/all-categories
