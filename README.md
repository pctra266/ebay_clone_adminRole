<div align="center">
  <h1> eBay Clone - Admin & Backend API</h1>
  <i>Hệ thống backend và nền tảng quản trị (Admin) cho dự án eBay Clone.</i>
</div>

---

## 1. Giới thiệu project
Đây là hệ thống Backend và trang quản trị (Admin Dashboard) của dự án **eBay Clone**. Dự án cung cấp các API cần thiết để vận hành một nền tảng thương mại điện tử tương tự eBay, với đầy đủ các nghiệp vụ tư phân quyền quản trị nội dung, quản lý người dùng, sản phẩm, tài chính, đến hệ thống thống kê và báo cáo phức tạp.

Dự án được triển khai dựa trên **Clean Architecture** (jasontaylordev template), đảm bảo tính mở rộng, bảo trì dễ dàng và khả năng test độc lập giữa các module.

---

## 2. Kiến trúc hệ thống
Hệ thống được thiết kế theo tiêu chuẩn **Clean Architecture** kết hợp mô hình **CQRS** (Command Query Responsibility Segregation) để phân tách rõ ràng luồng đọc/ghi dữ liệu.

```text
├── src/
│   ├── Domain/              # Chứa Entities, Value Objects, Enums, Exceptions, Domain Events
│   ├── Application/         # Chứa Business Logic, Use Cases (CQRS với MediatR), DTOs, Validators
│   ├── Infrastructure/      # Data Access (EF Core), External Services, Identity
│   └── Web/                 # Razor Pages & RESTful APIs (Endpoints)
├── tests/                   # Unit Tests, Functional Tests, Acceptance Tests
└── infra/ & k8s/            # Cấu hình triển khai hệ thống (Docker, Kubernetes)
```

**Nguyên lý nền tảng:**
- Domain Layer là trung tâm, không phụ thuộc vào bất kỳ layer nào khác.
- Application Layer chỉ phụ thuộc vào Domain Layer.
- Infrastructure Layer và Web Layer phụ thuộc vào Application Layer.

---

## 3. Danh sách chức năng (Features)
Hệ thống bao gồm các nhóm chức năng chính phục vụ việc vận hành sàn thương mại điện tử:

- ** Quản lý hệ thống & Phân quyền:**
  - Login / Authentication & Authorization.
  - Phân quyền theo Role cho đội ngũ quản trị (`AdminRoles`).
  - Ghi nhận lịch sử thao tác hệ thống (`AuditLogs`).
- ** Quản lý Người dùng:**
  - Danh sách người dùng, Khóa/Mở khóa tài khoản (`Users`, `UpdateUserStatus`).
  - Phê duyệt người dùng hoặc thăng cấp (`ApproveUser`).
- **Quản lý Sản phẩm & Danh mục:**
  - Phân loại danh mục hệ thống đa cấp (`Categories`).
  - Quản trị thông tin sản phẩm trên sàn (`Products`).
- **Quản lý Tài chính & Phí:**
  - Tính toán và cấu hình phí nền tảng (`PlatformFees`).
  - Quản lý ví, giao dịch tiền tệ hệ thống (`Financials`).
  - Xử lý các yêu cầu rút tiền của Seller (`Withdrawals`).
- **Quản lý Rủi ro & Đơn hàng:**
  - Xử lý các khiếu nại và yêu cầu trả hàng (`ReturnRequests/ReturRequests`).
  - Quản lý các đánh giá sản phẩm / người bán (`Reviews`).
- **Báo cáo & Thống kê:**
  - Màn hình Dashboard tổng quan cho Admin (`Dashboard`).
  - Xuất báo cáo hoạt động và doanh thu (`Reports`).
  - Thống kê chi tiết dữ liệu hệ thống (`Stats`).
- **Truyển thông (Broadcast):**
  - Gửi thông báo / tin nhắn hàng loạt trên hệ thống (`Broadcasts`).

---

## 4. Công nghệ sử dụng
- **Framework:** .NET (10.0 Preview / 8.0)
- **Architecture & Pattern:** Clean Architecture, CQRS (MediatR)
- **Cơ sở dữ liệu:** SQL Server (EF Core Code-First)
- **Authentication:** ASP.NET Core Identity & JWT
- **UI (Admin):** Razor Pages, Reactjs
- **Validation:** FluentValidation
- **Testing:** xUnit, Moq
- **Deployment:** Docker, Docker Compose, Kubernetes

---

## 5. Cách chạy project (Step by Step)

### 5.1. Yêu cầu hệ thống
- .NET SDK tương ứng.
- SQL Server (hoặc SQL Server Express / LocalDB).
- Docker (Tùy chọn nếu muốn chạy qua môi trường container).

### 5.2. Chạy môi trường Local (Windows / MacOS / Linux)

**Bước 1: Thiết lập chuỗi kết nối Database**
*Có thể chạy script thiết lập tự động (nếu sử dụng Windows):*
```powershell
.\setup-database.ps1
```
*Hoặc cấu hình qua User Secrets:*
```bash
cd src/Web
dotnet user-secrets init
dotnet user-secrets set "ConnectionStrings:EbayCloneDb" "Server=(localdb)\mssqllocaldb;Database=CloneEbayDB;Trusted_Connection=True;TrustServerCertificate=True"
```
*(Hoặc sửa trực tiếp file `appsettings.Development.json` dựa trên `appsettings.Development.json.example`).*

**Bước 2: Migrate Database**
```bash
cd src/Infrastructure
dotnet ef database update --context ApplicationDbContext --startup-project ../Web
```

**Bước 3: Chạy ứng dụng**
```bash
cd src/Web
dotnet watch run
```
Trang web sẽ tự động mở hoặc bạn có thể truy cập `https://localhost:5001`. Cơ sở dữ liệu sẽ được tự động seed dữ liệu mẫu trong lần chạy đầu tiên.

---

## 6. Tài khoản Demo
Sau khi hệ thống khởi tạo và chạy tự động Seeder, bạn có thể đăng nhập bằng các tài khoản sau:

* Admin Account:**
- **Email:** `administrator@localhost`
- **Password:** `Administrator1!`

**Sample Seller Account:**
- **Username:** `tech_seller_pro`
- **Password:** `Password123!`

---

## 7. API / Module chính
Hệ thống tổ chức source code trong `src/Application` theo các Use Cases ứng với mỗi Feature:
- `AdminRoles` / `Users`: Lõi xử lý thông tin tài khoản người dùng và quyền hạn Admin.
- `Products` / `Categories`: Các Use Cases Query/Command dữ liệu sản phẩm.
- `Financials` / `Withdrawals` / `PlatformFees`: Mô-đun xử lý dòng tiền của hệ thống.
- `Reports` / `Stats` / `Dashboard`: Mô-đun lấy dữ liệu phân tích dạng aggregate hoặc real-time cho việc hiển thị Dashboard.

*Lưu ý: NSwag hiện đang được disable do cấu hình mặc định tương thích chưa được hỗ trợ, nhưng có thể xem Swagger UI bình thường tại endpoint `/swagger` theo cấu hình `Program.cs`.*

---

## 8. Hướng phát triển thêm
- Tích hợp thêm Payment Gateway thực tế (VNPay, Stripe, PayPal, v.v.)
- Hoàn thiện hệ thống Chat / Messaging real-time (SignalR) giữa Buyer và Seller.
- Bổ sung ElasticSearch cho phần tìm kiếm (Search) sản phẩm để tăng hiệu năng với lượng data lớn.
- Bổ sung Caching (Redis) ở các query thống kê (`Stats`, `Dashboard`) để giảm tải database.
- Tự động hóa CI/CD pipelines trên GitHub Actions cho kịch bản triển khai prod trên Docker / K8s. 

---
> *Template dự án gốc thuộc về [Clean.Architecture.Solution.Template](https://github.com/jasontaylordev/CleanArchitecture).*