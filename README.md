# EbayClone

The project was generated using the [Clean.Architecture.Solution.Template](https://github.com/jasontaylordev/CleanArchitecture) version 10.0.0-preview.

## 🚀 Quick Start

### Known Issues

⚠️ **NSwag Compatibility:** NSwag code generation is currently disabled due to .NET 10 compatibility issues. Swagger UI is still available at `/swagger` endpoint.

### 1. Setup Database Connection

**Option A: Automated Setup (Recommended)**
```powershell
# Run the setup script (Windows)
.\setup-database.ps1
```

**Option B: Manual Setup with User Secrets**
```powershell
cd src/Web
dotnet user-secrets init
dotnet user-secrets set "ConnectionStrings:EbayCloneDb" "Server=(localdb)\mssqllocaldb;Database=CloneEbayDB;Trusted_Connection=True;TrustServerCertificate=True"
```

**Option C: Edit Configuration File**
- Copy `src/Web/appsettings.Development.json.example` to `src/Web/appsettings.Development.json`
- Update the connection string with your SQL Server details

📖 **For detailed database setup instructions, see [README-DATABASE.md](./README-DATABASE.md)**

### 2. Create Database
```bash
cd src/Infrastructure
dotnet ef database update --context ApplicationDbContext --startup-project ../Web
```

### 3. Run the Application
```bash
cd src/Web
dotnet watch run
```

Navigate to https://localhost:5001

**🌱 The database will automatically seed with sample data on first run!**

📖 **See [README-SEED-DATA.md](./README-SEED-DATA.md) for details on seeded data**  
📖 **See [README-SEEDERS.md](./README-SEEDERS.md) for seeder architecture**

---

## 🔐 Default Login Credentials

After seeding, you can login with:

**Admin Account:**
```
Email: administrator@localhost
Password: Administrator1!
```

**Sample Seller Account:**
```
Username: tech_seller_pro
Password: Password123!
```

---

## Build

Run `dotnet build -tl` to build the solution.

## Run

To run the web application:

```bash
cd .\src\Web\
dotnet watch run
```

Navigate to https://localhost:5001. The application will automatically reload if you change any of the source files.

## 🗄️ Database Configuration

### Connection String Examples

**LocalDB (Default):**
```
Server=(localdb)\mssqllocaldb;Database=CloneEbayDB;Trusted_Connection=True;TrustServerCertificate=True
```

**SQL Server Express:**
```
Server=.\SQLEXPRESS;Database=CloneEbayDB;Trusted_Connection=True;TrustServerCertificate=True
```

**SQL Server with SQL Authentication:**
```
Server=localhost;uid=sa;password=YourPassword;Database=CloneEbayDB;Encrypt=True;TrustServerCertificate=True
```

### Database Migrations

**Create a new migration:**
```bash
cd src/Infrastructure
dotnet ef migrations add MigrationName --context ApplicationDbContext --startup-project ../Web
```

**Apply migrations:**
```bash
dotnet ef database update --context ApplicationDbContext --startup-project ../Web
```

**Rollback migration:**
```bash
dotnet ef database update PreviousMigrationName --context ApplicationDbContext --startup-project ../Web
```

---

## Code Styles & Formatting

The template includes [EditorConfig](https://editorconfig.org/) support to help maintain consistent coding styles for multiple developers working on the same project across various editors and IDEs. The **.editorconfig** file defines the coding styles applicable to this solution.

## Code Scaffolding

The template includes support to scaffold new commands and queries.

Start in the `.\src\Application\` folder.

Create a new command:

```
dotnet new ca-usecase --name CreateTodoList --feature-name TodoLists --usecase-type command --return-type int
```

Create a new query:

```
dotnet new ca-usecase -n GetTodos -fn TodoLists -ut query -rt TodosVm
```

If you encounter the error *"No templates or subcommands found matching: 'ca-usecase'."*, install the template and try again:

```bash
dotnet new install Clean.Architecture.Solution.Template::10.0.0-preview
```

## Test

The solution contains unit, integration, functional, and acceptance tests.

To run the unit, integration, and functional tests (excluding acceptance tests):
```bash
dotnet test --filter "FullyQualifiedName!~AcceptanceTests"
```

To run the acceptance tests, first start the application:

```bash
cd .\src\Web\
dotnet run
```

Then, in a new console, run the tests:
```bash
cd .\src\Web\
dotnet test
```

## 📁 Project Structure

```
├── src/
│   ├── Web/                    # Razor Pages Web Application
│   ├── Application/            # Business Logic & CQRS
│   ├── Domain/                 # Domain Entities & Events
│   └── Infrastructure/         # Data Access & External Services
├── tests/
│   ├── Application.UnitTests/
│   ├── Application.FunctionalTests/
│   └── Web.AcceptanceTests/
├── setup-database.ps1          # Database setup script
├── README-DATABASE.md          # Detailed database guide
└── README.md                   # This file
```

## 🔒 Security Notes

- **Never commit passwords** in `appsettings.json` or `appsettings.Development.json`
- Use **User Secrets** for development environments
- Use **Environment Variables** or **Azure Key Vault** for production
- The `.gitignore` is configured to protect sensitive configuration files

## Help
To learn more about the template go to the [project website](https://github.com/jasontaylordev/CleanArchitecture). Here you can find additional guidance, request new features, report a bug, and discuss the template with other users.