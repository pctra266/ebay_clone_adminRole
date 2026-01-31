# ?? Seeders Architecture Guide

## Overview

The seed data is organized into **separate seeder classes** following the **Single Responsibility Principle**. Each seeder handles a specific entity and runs in a defined order.

---

## ?? Structure

```
src/Infrastructure/Data/Seeders/
??? ISeeder.cs                    # Base interface
??? AdminRolesSeeder.cs           # Order: 1
??? CategoriesSeeder.cs           # Order: 2
??? PlatformFeesSeeder.cs         # Order: 3
??? UsersSeeder.cs                # Order: 4
??? SellerWalletsSeeder.cs        # Order: 5
??? ProductsSeeder.cs             # Order: 6
??? StoresSeeder.cs               # Order: 7
??? AddressesSeeder.cs            # Order: 8
```

---

## ?? Execution Flow

```
ApplicationDbContextInitialiser
    ?
1. InitialiseAsync()
    ? Run EF Core Migrations
    ?
2. SeedIdentityRolesAsync()
    ? Seed ASP.NET Identity Roles
    ?
3. SeedDefaultAdminAsync()
    ? Seed Default Admin User
    ?
4. ExecuteSeedersAsync()
    ? AdminRolesSeeder (Order: 1)
    ? CategoriesSeeder (Order: 2)
    ? PlatformFeesSeeder (Order: 3)
    ? UsersSeeder (Order: 4)
    ? SellerWalletsSeeder (Order: 5)
    ? ProductsSeeder (Order: 6)
    ? StoresSeeder (Order: 7)
    ? AddressesSeeder (Order: 8)
```

---

## ?? Seeder Details

### **ISeeder Interface**

```csharp
public interface ISeeder
{
    Task SeedAsync();
    int Order { get; } // Execution order
}
```

### **1. AdminRolesSeeder** (Order: 1)

**Purpose:** Seed admin dashboard roles  
**Entities:** AdminRole  
**Count:** 5 roles  

**Roles:**
- SuperAdmin (all permissions)
- Monitor (read-only)
- Support (disputes, returns)
- ContentModerator (products, reviews)
- FinanceManager (fees, withdrawals)

---

### **2. CategoriesSeeder** (Order: 2)

**Purpose:** Seed product categories  
**Entities:** Category  
**Count:** 14 categories  

**Categories:**
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

### **3. PlatformFeesSeeder** (Order: 3)

**Purpose:** Seed platform fee structure  
**Entities:** PlatformFee  
**Count:** 5 fee types  

**Fees:**
- Standard Final Value Fee: 12.9%
- Listing Fee: $0.35 (inactive by default)
- Motors Final Value Fee: 3% (capped at $125)
- Collectibles Final Value Fee: 15%
- Promoted Listing Fee: 8%

---

### **4. UsersSeeder** (Order: 4)

**Purpose:** Seed sample buyers and sellers  
**Entities:** User  
**Count:** 5 users  

**Users:**
- john_buyer (verified buyer)
- tech_seller_pro (verified seller, 2FA enabled)
- fashion_boutique (verified seller)
- pending_seller (awaiting approval)
- collectibles_expert (verified seller)

**Default Password:** `Password123!`

---

### **5. SellerWalletsSeeder** (Order: 5)

**Purpose:** Create wallets for all sellers  
**Entities:** SellerWallet  
**Dependencies:** UsersSeeder  

**Logic:**
- Finds all users with Role = "Seller"
- Creates a wallet for each seller if not exists
- Initial balance: $0

---

### **6. ProductsSeeder** (Order: 6)

**Purpose:** Seed sample products  
**Entities:** Product  
**Dependencies:** UsersSeeder, CategoriesSeeder  
**Count:** 8 products  

**Products:**
- Apple iPhone 15 Pro Max ($1,199.99)
- Sony WH-1000XM5 Headphones ($349.99)
- MacBook Pro 16" M3 Pro ($2,899.00)
- Nike Air Jordan 1 Chicago (Auction: $2,500)
- Gucci Marmont Bag ($1,850)
- Rolex Submariner ($15,500)
- Pokémon Charizard PSA 9 (Auction: $8,500)
- Michael Jordan Signed Ball ($3,200)

---

### **7. StoresSeeder** (Order: 7)

**Purpose:** Seed seller stores  
**Entities:** Store  
**Dependencies:** UsersSeeder  
**Count:** 2-3 stores  

**Stores:**
- Tech Pro Electronics (by tech_seller_pro)
- Fashion Boutique Elite (by fashion_boutique)
- Rare Collectibles & Memorabilia (by collectibles_expert)

---

### **8. AddressesSeeder** (Order: 8)

**Purpose:** Seed user addresses  
**Entities:** Address  
**Dependencies:** UsersSeeder  
**Count:** 5-6 addresses  

**Addresses:**
- John's home & office addresses
- Tech Seller's business address
- Fashion Seller's store & warehouse addresses

---

## ? Benefits of This Architecture

### **1. Single Responsibility**
- Each seeder handles ONE entity type
- Easy to understand and maintain

### **2. Ordered Execution**
- Dependencies are respected automatically
- No race conditions

### **3. Idempotent**
- Safe to run multiple times
- Checks if data exists before seeding

### **4. Testable**
- Each seeder can be unit tested independently

### **5. Extensible**
- Easy to add new seeders
- Just implement `ISeeder` interface

### **6. Logging**
- Each seeder logs its own progress
- Easy to debug issues

---

## ?? How to Add a New Seeder

### **Step 1: Create Seeder Class**

```csharp
using Microsoft.Extensions.Logging;

namespace EbayClone.Infrastructure.Data.Seeders;

public class MyNewSeeder : ISeeder
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<MyNewSeeder> _logger;

    public int Order => 9; // Set appropriate order

    public MyNewSeeder(ApplicationDbContext context, ILogger<MyNewSeeder> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task SeedAsync()
    {
        if (_context.MyEntity.Any())
        {
            _logger.LogInformation("MyEntity already seeded, skipping...");
            return;
        }

        var entities = new List<MyEntity>
        {
            new MyEntity { /* data */ }
        };

        _context.MyEntity.AddRange(entities);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Seeded {Count} MyEntity records", entities.Count);
    }
}
```

### **Step 2: Register in ApplicationDbContextInitialiser**

Add to `seederTypes` list in `ExecuteSeedersAsync()`:

```csharp
var seederTypes = new List<Type>
{
    // ...existing seeders...
    typeof(MyNewSeeder) // Add here
};
```

### **Step 3: Build and Run**

```powershell
dotnet build
dotnet run --project src/Web
```

---

## ?? Testing Individual Seeders

You can test seeders individually:

```csharp
[Test]
public async Task AdminRolesSeeder_ShouldSeed5Roles()
{
    // Arrange
    var context = GetInMemoryDbContext();
    var logger = Mock.Of<ILogger<AdminRolesSeeder>>();
    var seeder = new AdminRolesSeeder(context, logger);

    // Act
    await seeder.SeedAsync();

    // Assert
    Assert.AreEqual(5, context.AdminRoles.Count());
}
```

---

## ?? Seeder Dependencies

```
AdminRolesSeeder ? (independent)
CategoriesSeeder ? (independent)
PlatformFeesSeeder ? CategoriesSeeder
UsersSeeder ? (independent)
SellerWalletsSeeder ? UsersSeeder
ProductsSeeder ? UsersSeeder, CategoriesSeeder
StoresSeeder ? UsersSeeder
AddressesSeeder ? UsersSeeder
```

---

## ?? Common Issues

### **Issue: Foreign Key Constraint Error**

**Solution:** Check seeder order. Ensure parent entities are seeded first.

### **Issue: Duplicate Key Error**

**Solution:** Seeder should check if data exists before inserting.

```csharp
if (_context.MyEntity.Any())
{
    return; // Skip seeding
}
```

### **Issue: Seeder Not Running**

**Solution:**
1. Check seeder is added to `seederTypes` list
2. Verify `Order` property is set
3. Check logs for errors

---

## ?? Best Practices

1. **Always check if data exists** before seeding
2. **Use meaningful Order values** (leave gaps for future seeders)
3. **Log all actions** for debugging
4. **Keep seeders focused** on one entity type
5. **Use realistic data** matching production scenarios
6. **Document dependencies** in code comments

---

## ?? Debugging Seeders

Enable detailed logging:

```json
// appsettings.Development.json
{
  "Logging": {
    "LogLevel": {
      "EbayClone.Infrastructure.Data.Seeders": "Debug"
    }
  }
}
```

View seeder execution:

```
info: EbayClone.Infrastructure.Data.ApplicationDbContextInitialiser[0]
      Starting database seeding...
info: EbayClone.Infrastructure.Data.ApplicationDbContextInitialiser[0]
      Executing seeder: AdminRolesSeeder
info: EbayClone.Infrastructure.Data.Seeders.AdminRolesSeeder[0]
      Seeded 5 Admin Roles
```

---

## ?? References

- [Seed Data in ASP.NET Core](https://learn.microsoft.com/en-us/ef/core/modeling/data-seeding)
- [Dependency Injection in .NET](https://learn.microsoft.com/en-us/dotnet/core/extensions/dependency-injection)
- [Clean Architecture Patterns](https://github.com/jasontaylordev/CleanArchitecture)
