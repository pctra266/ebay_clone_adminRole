IF OBJECT_ID(N'[__EFMigrationsHistory]') IS NULL
BEGIN
    CREATE TABLE [__EFMigrationsHistory] (
        [MigrationId] nvarchar(150) NOT NULL,
        [ProductVersion] nvarchar(32) NOT NULL,
        CONSTRAINT [PK___EFMigrationsHistory] PRIMARY KEY ([MigrationId])
    );
END;
GO

BEGIN TRANSACTION;
CREATE TABLE [AdminRoles] (
    [Id] int NOT NULL IDENTITY,
    [RoleName] nvarchar(max) NOT NULL,
    [Permissions] nvarchar(max) NULL,
    [Description] nvarchar(max) NULL,
    [CreatedAt] datetime2 NOT NULL,
    CONSTRAINT [PK_AdminRoles] PRIMARY KEY ([Id])
);

CREATE TABLE [AspNetRoles] (
    [Id] nvarchar(450) NOT NULL,
    [Name] nvarchar(256) NULL,
    [NormalizedName] nvarchar(256) NULL,
    [ConcurrencyStamp] nvarchar(max) NULL,
    CONSTRAINT [PK_AspNetRoles] PRIMARY KEY ([Id])
);

CREATE TABLE [AspNetUsers] (
    [Id] nvarchar(450) NOT NULL,
    [UserName] nvarchar(256) NULL,
    [NormalizedUserName] nvarchar(256) NULL,
    [Email] nvarchar(256) NULL,
    [NormalizedEmail] nvarchar(256) NULL,
    [EmailConfirmed] bit NOT NULL,
    [PasswordHash] nvarchar(max) NULL,
    [SecurityStamp] nvarchar(max) NULL,
    [ConcurrencyStamp] nvarchar(max) NULL,
    [PhoneNumber] nvarchar(max) NULL,
    [PhoneNumberConfirmed] bit NOT NULL,
    [TwoFactorEnabled] bit NOT NULL,
    [LockoutEnd] datetimeoffset NULL,
    [LockoutEnabled] bit NOT NULL,
    [AccessFailedCount] int NOT NULL,
    CONSTRAINT [PK_AspNetUsers] PRIMARY KEY ([Id])
);

CREATE TABLE [Category] (
    [id] int NOT NULL IDENTITY,
    [name] nvarchar(100) NULL,
    CONSTRAINT [PK__Category__3213E83FD8CC36EB] PRIMARY KEY ([id])
);

CREATE TABLE [User] (
    [id] int NOT NULL IDENTITY,
    [username] nvarchar(100) NULL,
    [email] nvarchar(100) NULL,
    [password] nvarchar(255) NULL,
    [role] nvarchar(20) NULL,
    [avatarURL] nvarchar(max) NULL,
    [Status] nvarchar(max) NOT NULL,
    [ApprovalStatus] nvarchar(max) NOT NULL,
    [ApprovedBy] int NULL,
    [ApprovedAt] datetime2 NULL,
    [BannedReason] nvarchar(max) NULL,
    [BannedBy] int NULL,
    [BannedAt] datetime2 NULL,
    [TwoFactorEnabled] bit NOT NULL,
    [TwoFactorSecret] nvarchar(max) NULL,
    [IpWhitelist] nvarchar(max) NULL,
    [LastLoginIp] nvarchar(max) NULL,
    [LastLoginAt] datetime2 NULL,
    [ViolationCount] int NOT NULL,
    [IsVerified] bit NOT NULL,
    [VerificationDocuments] nvarchar(max) NULL,
    CONSTRAINT [PK__User__3213E83F7595922F] PRIMARY KEY ([id])
);

CREATE TABLE [AspNetRoleClaims] (
    [Id] int NOT NULL IDENTITY,
    [RoleId] nvarchar(450) NOT NULL,
    [ClaimType] nvarchar(max) NULL,
    [ClaimValue] nvarchar(max) NULL,
    CONSTRAINT [PK_AspNetRoleClaims] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_AspNetRoleClaims_AspNetRoles_RoleId] FOREIGN KEY ([RoleId]) REFERENCES [AspNetRoles] ([Id]) ON DELETE CASCADE
);

CREATE TABLE [AspNetUserClaims] (
    [Id] int NOT NULL IDENTITY,
    [UserId] nvarchar(450) NOT NULL,
    [ClaimType] nvarchar(max) NULL,
    [ClaimValue] nvarchar(max) NULL,
    CONSTRAINT [PK_AspNetUserClaims] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_AspNetUserClaims_AspNetUsers_UserId] FOREIGN KEY ([UserId]) REFERENCES [AspNetUsers] ([Id]) ON DELETE CASCADE
);

CREATE TABLE [AspNetUserLogins] (
    [LoginProvider] nvarchar(128) NOT NULL,
    [ProviderKey] nvarchar(128) NOT NULL,
    [ProviderDisplayName] nvarchar(max) NULL,
    [UserId] nvarchar(450) NOT NULL,
    CONSTRAINT [PK_AspNetUserLogins] PRIMARY KEY ([LoginProvider], [ProviderKey]),
    CONSTRAINT [FK_AspNetUserLogins_AspNetUsers_UserId] FOREIGN KEY ([UserId]) REFERENCES [AspNetUsers] ([Id]) ON DELETE CASCADE
);

CREATE TABLE [AspNetUserRoles] (
    [UserId] nvarchar(450) NOT NULL,
    [RoleId] nvarchar(450) NOT NULL,
    CONSTRAINT [PK_AspNetUserRoles] PRIMARY KEY ([UserId], [RoleId]),
    CONSTRAINT [FK_AspNetUserRoles_AspNetRoles_RoleId] FOREIGN KEY ([RoleId]) REFERENCES [AspNetRoles] ([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_AspNetUserRoles_AspNetUsers_UserId] FOREIGN KEY ([UserId]) REFERENCES [AspNetUsers] ([Id]) ON DELETE CASCADE
);

CREATE TABLE [AspNetUserTokens] (
    [UserId] nvarchar(450) NOT NULL,
    [LoginProvider] nvarchar(128) NOT NULL,
    [Name] nvarchar(128) NOT NULL,
    [Value] nvarchar(max) NULL,
    CONSTRAINT [PK_AspNetUserTokens] PRIMARY KEY ([UserId], [LoginProvider], [Name]),
    CONSTRAINT [FK_AspNetUserTokens_AspNetUsers_UserId] FOREIGN KEY ([UserId]) REFERENCES [AspNetUsers] ([Id]) ON DELETE CASCADE
);

CREATE TABLE [PlatformFees] (
    [Id] int NOT NULL IDENTITY,
    [FeeType] nvarchar(max) NOT NULL,
    [CategoryId] int NULL,
    [Percentage] decimal(18,2) NULL,
    [FixedAmount] decimal(18,2) NULL,
    [MinAmount] decimal(18,2) NULL,
    [MaxAmount] decimal(18,2) NULL,
    [IsActive] bit NOT NULL,
    [EffectiveFrom] datetime2 NULL,
    [EffectiveTo] datetime2 NULL,
    CONSTRAINT [PK_PlatformFees] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_PlatformFees_Category_CategoryId] FOREIGN KEY ([CategoryId]) REFERENCES [Category] ([id])
);

CREATE TABLE [Address] (
    [id] int NOT NULL IDENTITY,
    [userId] int NULL,
    [fullName] nvarchar(100) NULL,
    [phone] nvarchar(20) NULL,
    [street] nvarchar(100) NULL,
    [city] nvarchar(50) NULL,
    [state] nvarchar(50) NULL,
    [country] nvarchar(50) NULL,
    [isDefault] bit NULL,
    CONSTRAINT [PK__Address__3213E83F7BAA3D75] PRIMARY KEY ([id]),
    CONSTRAINT [FK__Address__userId__3A81B327] FOREIGN KEY ([userId]) REFERENCES [User] ([id])
);

CREATE TABLE [AdminActions] (
    [Id] int NOT NULL IDENTITY,
    [AdminId] int NOT NULL,
    [Action] nvarchar(max) NOT NULL,
    [TargetType] nvarchar(max) NOT NULL,
    [TargetId] int NULL,
    [Details] nvarchar(max) NULL,
    [IpAddress] nvarchar(max) NULL,
    [CreatedAt] datetime2 NOT NULL,
    CONSTRAINT [PK_AdminActions] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_AdminActions_User_AdminId] FOREIGN KEY ([AdminId]) REFERENCES [User] ([id]) ON DELETE CASCADE
);

CREATE TABLE [AdminUserRoles] (
    [Id] int NOT NULL IDENTITY,
    [UserId] int NOT NULL,
    [RoleId] int NOT NULL,
    [AssignedBy] int NULL,
    [AssignedAt] datetime2 NOT NULL,
    CONSTRAINT [PK_AdminUserRoles] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_AdminUserRoles_AdminRoles_RoleId] FOREIGN KEY ([RoleId]) REFERENCES [AdminRoles] ([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_AdminUserRoles_User_AssignedBy] FOREIGN KEY ([AssignedBy]) REFERENCES [User] ([id]),
    CONSTRAINT [FK_AdminUserRoles_User_UserId] FOREIGN KEY ([UserId]) REFERENCES [User] ([id]) ON DELETE CASCADE
);

CREATE TABLE [Feedback] (
    [id] int NOT NULL IDENTITY,
    [sellerId] int NULL,
    [averageRating] decimal(3,2) NULL,
    [totalReviews] int NULL,
    [positiveRate] decimal(5,2) NULL,
    CONSTRAINT [PK__Feedback__3213E83F55C0387E] PRIMARY KEY ([id]),
    CONSTRAINT [FK__Feedback__seller__66603565] FOREIGN KEY ([sellerId]) REFERENCES [User] ([id])
);

CREATE TABLE [Message] (
    [id] int NOT NULL IDENTITY,
    [senderId] int NULL,
    [receiverId] int NULL,
    [content] nvarchar(max) NULL,
    [timestamp] datetime NULL,
    CONSTRAINT [PK__Message__3213E83FA09029AA] PRIMARY KEY ([id]),
    CONSTRAINT [FK__Message__receive__5DCAEF64] FOREIGN KEY ([receiverId]) REFERENCES [User] ([id]),
    CONSTRAINT [FK__Message__senderI__5CD6CB2B] FOREIGN KEY ([senderId]) REFERENCES [User] ([id])
);

CREATE TABLE [Notifications] (
    [Id] int NOT NULL IDENTITY,
    [UserId] int NULL,
    [UserRole] nvarchar(max) NULL,
    [Title] nvarchar(max) NOT NULL,
    [Content] nvarchar(max) NULL,
    [Type] nvarchar(max) NOT NULL,
    [Status] nvarchar(max) NOT NULL,
    [ScheduledAt] datetime2 NULL,
    [SentAt] datetime2 NULL,
    [CreatedBy] int NULL,
    [CreatedAt] datetime2 NOT NULL,
    CONSTRAINT [PK_Notifications] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_Notifications_User_CreatedBy] FOREIGN KEY ([CreatedBy]) REFERENCES [User] ([id]),
    CONSTRAINT [FK_Notifications_User_UserId] FOREIGN KEY ([UserId]) REFERENCES [User] ([id])
);

CREATE TABLE [Product] (
    [id] int NOT NULL IDENTITY,
    [title] nvarchar(255) NULL,
    [description] nvarchar(max) NULL,
    [price] decimal(10,2) NULL,
    [images] nvarchar(max) NULL,
    [categoryId] int NULL,
    [sellerId] int NULL,
    [isAuction] bit NULL,
    [auctionEndTime] datetime NULL,
    [Status] nvarchar(max) NOT NULL,
    [ReportCount] int NOT NULL,
    [ReportedBy] nvarchar(max) NULL,
    [ReportReason] nvarchar(max) NULL,
    [IsVerified] bit NOT NULL,
    [VerifiedBy] int NULL,
    [VerifiedAt] datetime2 NULL,
    [ViolationType] nvarchar(max) NULL,
    [ModerationNotes] nvarchar(max) NULL,
    CONSTRAINT [PK__Product__3213E83FD22EA9AF] PRIMARY KEY ([id]),
    CONSTRAINT [FK__Product__categor__3F466844] FOREIGN KEY ([categoryId]) REFERENCES [Category] ([id]),
    CONSTRAINT [FK__Product__sellerI__403A8C7D] FOREIGN KEY ([sellerId]) REFERENCES [User] ([id])
);

CREATE TABLE [SellerWallets] (
    [Id] int NOT NULL IDENTITY,
    [SellerId] int NOT NULL,
    [PendingBalance] decimal(18,2) NOT NULL,
    [AvailableBalance] decimal(18,2) NOT NULL,
    [TotalEarnings] decimal(18,2) NOT NULL,
    [TotalWithdrawn] decimal(18,2) NOT NULL,
    [UpdatedAt] datetime2 NOT NULL,
    CONSTRAINT [PK_SellerWallets] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_SellerWallets_User_SellerId] FOREIGN KEY ([SellerId]) REFERENCES [User] ([id]) ON DELETE CASCADE
);

CREATE TABLE [Store] (
    [id] int NOT NULL IDENTITY,
    [sellerId] int NULL,
    [storeName] nvarchar(100) NULL,
    [description] nvarchar(max) NULL,
    [bannerImageURL] nvarchar(max) NULL,
    CONSTRAINT [PK__Store__3213E83F0CC490A2] PRIMARY KEY ([id]),
    CONSTRAINT [FK__Store__sellerId__6D0D32F4] FOREIGN KEY ([sellerId]) REFERENCES [User] ([id])
);

CREATE TABLE [WithdrawalRequests] (
    [Id] int NOT NULL IDENTITY,
    [SellerId] int NOT NULL,
    [Amount] decimal(18,2) NOT NULL,
    [BankName] nvarchar(max) NULL,
    [BankAccountNumber] nvarchar(max) NULL,
    [BankAccountName] nvarchar(max) NULL,
    [Status] nvarchar(max) NOT NULL,
    [RequestedAt] datetime2 NOT NULL,
    [ProcessedBy] int NULL,
    [ProcessedAt] datetime2 NULL,
    [RejectionReason] nvarchar(max) NULL,
    [TransactionId] nvarchar(max) NULL,
    CONSTRAINT [PK_WithdrawalRequests] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_WithdrawalRequests_User_ProcessedBy] FOREIGN KEY ([ProcessedBy]) REFERENCES [User] ([id]),
    CONSTRAINT [FK_WithdrawalRequests_User_SellerId] FOREIGN KEY ([SellerId]) REFERENCES [User] ([id]) ON DELETE CASCADE
);

CREATE TABLE [OrderTable] (
    [id] int NOT NULL IDENTITY,
    [buyerId] int NULL,
    [addressId] int NULL,
    [orderDate] datetime NULL,
    [totalPrice] decimal(10,2) NULL,
    [status] nvarchar(20) NULL,
    [CompletedAt] datetime2 NULL,
    [CanDisputeUntil] datetime2 NULL,
    [PlatformFee] decimal(18,2) NULL,
    [SellerEarnings] decimal(18,2) NULL,
    CONSTRAINT [PK__OrderTab__3213E83FC585EDBE] PRIMARY KEY ([id]),
    CONSTRAINT [FK__OrderTabl__addre__440B1D61] FOREIGN KEY ([addressId]) REFERENCES [Address] ([id]),
    CONSTRAINT [FK__OrderTabl__buyer__4316F928] FOREIGN KEY ([buyerId]) REFERENCES [User] ([id])
);

CREATE TABLE [Bid] (
    [id] int NOT NULL IDENTITY,
    [productId] int NULL,
    [bidderId] int NULL,
    [amount] decimal(10,2) NULL,
    [bidTime] datetime NULL,
    CONSTRAINT [PK__Bid__3213E83F6F4FB122] PRIMARY KEY ([id]),
    CONSTRAINT [FK__Bid__bidderId__5629CD9C] FOREIGN KEY ([bidderId]) REFERENCES [User] ([id]),
    CONSTRAINT [FK__Bid__productId__5535A963] FOREIGN KEY ([productId]) REFERENCES [Product] ([id])
);

CREATE TABLE [Coupon] (
    [id] int NOT NULL IDENTITY,
    [code] nvarchar(50) NULL,
    [discountPercent] decimal(5,2) NULL,
    [startDate] datetime NULL,
    [endDate] datetime NULL,
    [maxUsage] int NULL,
    [productId] int NULL,
    CONSTRAINT [PK__Coupon__3213E83F3A903473] PRIMARY KEY ([id]),
    CONSTRAINT [FK__Coupon__productI__60A75C0F] FOREIGN KEY ([productId]) REFERENCES [Product] ([id])
);

CREATE TABLE [Inventory] (
    [id] int NOT NULL IDENTITY,
    [productId] int NULL,
    [quantity] int NULL,
    [lastUpdated] datetime NULL,
    CONSTRAINT [PK__Inventor__3213E83F804209EB] PRIMARY KEY ([id]),
    CONSTRAINT [FK__Inventory__produ__6383C8BA] FOREIGN KEY ([productId]) REFERENCES [Product] ([id])
);

CREATE TABLE [ProductReports] (
    [Id] int NOT NULL IDENTITY,
    [ProductId] int NOT NULL,
    [ReporterUserId] int NULL,
    [ReporterType] nvarchar(max) NOT NULL,
    [Reason] nvarchar(max) NULL,
    [EvidenceFiles] nvarchar(max) NULL,
    [Status] nvarchar(max) NOT NULL,
    [Priority] nvarchar(max) NOT NULL,
    [ResolvedBy] int NULL,
    [ResolvedAt] datetime2 NULL,
    [Resolution] nvarchar(max) NULL,
    [CreatedAt] datetime2 NOT NULL,
    CONSTRAINT [PK_ProductReports] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_ProductReports_Product_ProductId] FOREIGN KEY ([ProductId]) REFERENCES [Product] ([id]) ON DELETE CASCADE,
    CONSTRAINT [FK_ProductReports_User_ReporterUserId] FOREIGN KEY ([ReporterUserId]) REFERENCES [User] ([id]),
    CONSTRAINT [FK_ProductReports_User_ResolvedBy] FOREIGN KEY ([ResolvedBy]) REFERENCES [User] ([id])
);

CREATE TABLE [Review] (
    [id] int NOT NULL IDENTITY,
    [productId] int NULL,
    [reviewerId] int NULL,
    [rating] int NULL,
    [comment] nvarchar(max) NULL,
    [createdAt] datetime NULL,
    [Status] nvarchar(max) NOT NULL,
    [FlaggedBySystem] bit NOT NULL,
    [FlagReason] nvarchar(max) NULL,
    [ModeratedBy] int NULL,
    [ModeratedAt] datetime2 NULL,
    [ModerationAction] nvarchar(max) NULL,
    CONSTRAINT [PK__Review__3213E83FEE16BDFC] PRIMARY KEY ([id]),
    CONSTRAINT [FK__Review__productI__59063A47] FOREIGN KEY ([productId]) REFERENCES [Product] ([id]),
    CONSTRAINT [FK__Review__reviewer__59FA5E80] FOREIGN KEY ([reviewerId]) REFERENCES [User] ([id])
);

CREATE TABLE [Dispute] (
    [id] int NOT NULL IDENTITY,
    [orderId] int NULL,
    [raisedBy] int NULL,
    [description] nvarchar(max) NULL,
    [status] nvarchar(20) NULL,
    [resolution] nvarchar(max) NULL,
    [CaseId] nvarchar(max) NULL,
    [Priority] nvarchar(max) NOT NULL,
    [Amount] decimal(18,2) NULL,
    [Deadline] datetime2 NULL,
    [BuyerEvidence] nvarchar(max) NULL,
    [SellerEvidence] nvarchar(max) NULL,
    [ChatLog] nvarchar(max) NULL,
    [AdminNotes] nvarchar(max) NULL,
    [ResolvedBy] int NULL,
    [ResolvedAt] datetime2 NULL,
    [Winner] nvarchar(max) NULL,
    CONSTRAINT [PK__Dispute__3213E83F3853B7E9] PRIMARY KEY ([id]),
    CONSTRAINT [FK__Dispute__orderId__693CA210] FOREIGN KEY ([orderId]) REFERENCES [OrderTable] ([id]),
    CONSTRAINT [FK__Dispute__raisedB__6A30C649] FOREIGN KEY ([raisedBy]) REFERENCES [User] ([id])
);

CREATE TABLE [FinancialTransactions] (
    [Id] int NOT NULL IDENTITY,
    [UserId] int NOT NULL,
    [Type] nvarchar(max) NOT NULL,
    [Amount] decimal(18,2) NOT NULL,
    [BalanceAfter] decimal(18,2) NOT NULL,
    [OrderId] int NULL,
    [WithdrawalId] int NULL,
    [Description] nvarchar(max) NULL,
    [CreatedAt] datetime2 NOT NULL,
    CONSTRAINT [PK_FinancialTransactions] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_FinancialTransactions_OrderTable_OrderId] FOREIGN KEY ([OrderId]) REFERENCES [OrderTable] ([id]),
    CONSTRAINT [FK_FinancialTransactions_User_UserId] FOREIGN KEY ([UserId]) REFERENCES [User] ([id]) ON DELETE CASCADE,
    CONSTRAINT [FK_FinancialTransactions_WithdrawalRequests_WithdrawalId] FOREIGN KEY ([WithdrawalId]) REFERENCES [WithdrawalRequests] ([Id])
);

CREATE TABLE [OrderItem] (
    [id] int NOT NULL IDENTITY,
    [orderId] int NULL,
    [productId] int NULL,
    [quantity] int NULL,
    [unitPrice] decimal(10,2) NULL,
    CONSTRAINT [PK__OrderIte__3213E83F9FF5B9AE] PRIMARY KEY ([id]),
    CONSTRAINT [FK__OrderItem__order__46E78A0C] FOREIGN KEY ([orderId]) REFERENCES [OrderTable] ([id]),
    CONSTRAINT [FK__OrderItem__produ__47DBAE45] FOREIGN KEY ([productId]) REFERENCES [Product] ([id])
);

CREATE TABLE [Payment] (
    [id] int NOT NULL IDENTITY,
    [orderId] int NULL,
    [userId] int NULL,
    [amount] decimal(10,2) NULL,
    [method] nvarchar(50) NULL,
    [status] nvarchar(20) NULL,
    [paidAt] datetime NULL,
    CONSTRAINT [PK__Payment__3213E83F00F350AF] PRIMARY KEY ([id]),
    CONSTRAINT [FK__Payment__orderId__4AB81AF0] FOREIGN KEY ([orderId]) REFERENCES [OrderTable] ([id]),
    CONSTRAINT [FK__Payment__userId__4BAC3F29] FOREIGN KEY ([userId]) REFERENCES [User] ([id])
);

CREATE TABLE [ReturnRequest] (
    [id] int NOT NULL IDENTITY,
    [orderId] int NULL,
    [userId] int NULL,
    [reason] nvarchar(max) NULL,
    [status] nvarchar(20) NULL,
    [createdAt] datetime NULL,
    CONSTRAINT [PK__ReturnRe__3213E83F6944D4ED] PRIMARY KEY ([id]),
    CONSTRAINT [FK__ReturnReq__order__5165187F] FOREIGN KEY ([orderId]) REFERENCES [OrderTable] ([id]),
    CONSTRAINT [FK__ReturnReq__userI__52593CB8] FOREIGN KEY ([userId]) REFERENCES [User] ([id])
);

CREATE TABLE [ShippingInfo] (
    [id] int NOT NULL IDENTITY,
    [orderId] int NULL,
    [carrier] nvarchar(100) NULL,
    [trackingNumber] nvarchar(100) NULL,
    [status] nvarchar(50) NULL,
    [estimatedArrival] datetime NULL,
    CONSTRAINT [PK__Shipping__3213E83FEDF3D996] PRIMARY KEY ([id]),
    CONSTRAINT [FK__ShippingI__order__4E88ABD4] FOREIGN KEY ([orderId]) REFERENCES [OrderTable] ([id])
);

CREATE INDEX [IX_Address_userId] ON [Address] ([userId]);

CREATE INDEX [IX_AdminActions_AdminId] ON [AdminActions] ([AdminId]);

CREATE INDEX [IX_AdminUserRoles_AssignedBy] ON [AdminUserRoles] ([AssignedBy]);

CREATE INDEX [IX_AdminUserRoles_RoleId] ON [AdminUserRoles] ([RoleId]);

CREATE INDEX [IX_AdminUserRoles_UserId] ON [AdminUserRoles] ([UserId]);

CREATE INDEX [IX_AspNetRoleClaims_RoleId] ON [AspNetRoleClaims] ([RoleId]);

CREATE UNIQUE INDEX [RoleNameIndex] ON [AspNetRoles] ([NormalizedName]) WHERE [NormalizedName] IS NOT NULL;

CREATE INDEX [IX_AspNetUserClaims_UserId] ON [AspNetUserClaims] ([UserId]);

CREATE INDEX [IX_AspNetUserLogins_UserId] ON [AspNetUserLogins] ([UserId]);

CREATE INDEX [IX_AspNetUserRoles_RoleId] ON [AspNetUserRoles] ([RoleId]);

CREATE INDEX [EmailIndex] ON [AspNetUsers] ([NormalizedEmail]);

CREATE UNIQUE INDEX [UserNameIndex] ON [AspNetUsers] ([NormalizedUserName]) WHERE [NormalizedUserName] IS NOT NULL;

CREATE INDEX [IX_Bid_bidderId] ON [Bid] ([bidderId]);

CREATE INDEX [IX_Bid_productId] ON [Bid] ([productId]);

CREATE INDEX [IX_Coupon_productId] ON [Coupon] ([productId]);

CREATE INDEX [IX_Dispute_orderId] ON [Dispute] ([orderId]);

CREATE INDEX [IX_Dispute_raisedBy] ON [Dispute] ([raisedBy]);

CREATE INDEX [IX_Feedback_sellerId] ON [Feedback] ([sellerId]);

CREATE INDEX [IX_FinancialTransactions_OrderId] ON [FinancialTransactions] ([OrderId]);

CREATE INDEX [IX_FinancialTransactions_UserId] ON [FinancialTransactions] ([UserId]);

CREATE INDEX [IX_FinancialTransactions_WithdrawalId] ON [FinancialTransactions] ([WithdrawalId]);

CREATE INDEX [IX_Inventory_productId] ON [Inventory] ([productId]);

CREATE INDEX [IX_Message_receiverId] ON [Message] ([receiverId]);

CREATE INDEX [IX_Message_senderId] ON [Message] ([senderId]);

CREATE INDEX [IX_Notifications_CreatedBy] ON [Notifications] ([CreatedBy]);

CREATE INDEX [IX_Notifications_UserId] ON [Notifications] ([UserId]);

CREATE INDEX [IX_OrderItem_orderId] ON [OrderItem] ([orderId]);

CREATE INDEX [IX_OrderItem_productId] ON [OrderItem] ([productId]);

CREATE INDEX [IX_OrderTable_addressId] ON [OrderTable] ([addressId]);

CREATE INDEX [IX_OrderTable_buyerId] ON [OrderTable] ([buyerId]);

CREATE INDEX [IX_Payment_orderId] ON [Payment] ([orderId]);

CREATE INDEX [IX_Payment_userId] ON [Payment] ([userId]);

CREATE INDEX [IX_PlatformFees_CategoryId] ON [PlatformFees] ([CategoryId]);

CREATE INDEX [IX_Product_categoryId] ON [Product] ([categoryId]);

CREATE INDEX [IX_Product_sellerId] ON [Product] ([sellerId]);

CREATE INDEX [IX_ProductReports_ProductId] ON [ProductReports] ([ProductId]);

CREATE INDEX [IX_ProductReports_ReporterUserId] ON [ProductReports] ([ReporterUserId]);

CREATE INDEX [IX_ProductReports_ResolvedBy] ON [ProductReports] ([ResolvedBy]);

CREATE INDEX [IX_ReturnRequest_orderId] ON [ReturnRequest] ([orderId]);

CREATE INDEX [IX_ReturnRequest_userId] ON [ReturnRequest] ([userId]);

CREATE INDEX [IX_Review_productId] ON [Review] ([productId]);

CREATE INDEX [IX_Review_reviewerId] ON [Review] ([reviewerId]);

CREATE INDEX [IX_SellerWallets_SellerId] ON [SellerWallets] ([SellerId]);

CREATE INDEX [IX_ShippingInfo_orderId] ON [ShippingInfo] ([orderId]);

CREATE INDEX [IX_Store_sellerId] ON [Store] ([sellerId]);

CREATE UNIQUE INDEX [UQ__User__AB6E6164E7C24207] ON [User] ([email]) WHERE [email] IS NOT NULL;

CREATE INDEX [IX_WithdrawalRequests_ProcessedBy] ON [WithdrawalRequests] ([ProcessedBy]);

CREATE INDEX [IX_WithdrawalRequests_SellerId] ON [WithdrawalRequests] ([SellerId]);

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20260131170653_InitialCreate', N'10.0.0');

COMMIT;
GO

BEGIN TRANSACTION;
DECLARE @var nvarchar(max);
SELECT @var = QUOTENAME([d].[name])
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[AspNetUserTokens]') AND [c].[name] = N'Name');
IF @var IS NOT NULL EXEC(N'ALTER TABLE [AspNetUserTokens] DROP CONSTRAINT ' + @var + ';');
ALTER TABLE [AspNetUserTokens] ALTER COLUMN [Name] nvarchar(450) NOT NULL;

DECLARE @var1 nvarchar(max);
SELECT @var1 = QUOTENAME([d].[name])
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[AspNetUserTokens]') AND [c].[name] = N'LoginProvider');
IF @var1 IS NOT NULL EXEC(N'ALTER TABLE [AspNetUserTokens] DROP CONSTRAINT ' + @var1 + ';');
ALTER TABLE [AspNetUserTokens] ALTER COLUMN [LoginProvider] nvarchar(450) NOT NULL;

DECLARE @var2 nvarchar(max);
SELECT @var2 = QUOTENAME([d].[name])
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[AspNetUserLogins]') AND [c].[name] = N'ProviderKey');
IF @var2 IS NOT NULL EXEC(N'ALTER TABLE [AspNetUserLogins] DROP CONSTRAINT ' + @var2 + ';');
ALTER TABLE [AspNetUserLogins] ALTER COLUMN [ProviderKey] nvarchar(450) NOT NULL;

DECLARE @var3 nvarchar(max);
SELECT @var3 = QUOTENAME([d].[name])
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[AspNetUserLogins]') AND [c].[name] = N'LoginProvider');
IF @var3 IS NOT NULL EXEC(N'ALTER TABLE [AspNetUserLogins] DROP CONSTRAINT ' + @var3 + ';');
ALTER TABLE [AspNetUserLogins] ALTER COLUMN [LoginProvider] nvarchar(450) NOT NULL;

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20260201130011_AddInitialEntities', N'10.0.0');

COMMIT;
GO

BEGIN TRANSACTION;
DECLARE @var4 nvarchar(max);
SELECT @var4 = QUOTENAME([d].[name])
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[ProductReports]') AND [c].[name] = N'CreatedAt');
IF @var4 IS NOT NULL EXEC(N'ALTER TABLE [ProductReports] DROP CONSTRAINT ' + @var4 + ';');
ALTER TABLE [ProductReports] DROP COLUMN [CreatedAt];

EXEC sp_rename N'[ProductReports].[Resolution]', N'LastModifiedBy', 'COLUMN';

ALTER TABLE [ProductReports] ADD [AdminReply] nvarchar(max) NULL;

ALTER TABLE [ProductReports] ADD [Created] datetimeoffset NOT NULL DEFAULT '0001-01-01T00:00:00.0000000+00:00';

ALTER TABLE [ProductReports] ADD [CreatedBy] nvarchar(max) NULL;

ALTER TABLE [ProductReports] ADD [Description] nvarchar(max) NULL;

ALTER TABLE [ProductReports] ADD [LastModified] datetimeoffset NOT NULL DEFAULT '0001-01-01T00:00:00.0000000+00:00';

ALTER TABLE [Product] ADD [Created] datetimeoffset NOT NULL DEFAULT '0001-01-01T00:00:00.0000000+00:00';

ALTER TABLE [Product] ADD [CreatedBy] nvarchar(max) NULL;

ALTER TABLE [Product] ADD [LastModified] datetimeoffset NOT NULL DEFAULT '0001-01-01T00:00:00.0000000+00:00';

ALTER TABLE [Product] ADD [LastModifiedBy] nvarchar(max) NULL;

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20260202050110_AddProductReports', N'10.0.0');

COMMIT;
GO

BEGIN TRANSACTION;
ALTER TABLE [FinancialTransactions] DROP CONSTRAINT [FK_FinancialTransactions_User_UserId];

EXEC sp_rename N'[FinancialTransactions].[UserId]', N'SellerId', 'COLUMN';

EXEC sp_rename N'[FinancialTransactions].[CreatedAt]', N'Date', 'COLUMN';

EXEC sp_rename N'[FinancialTransactions].[IX_FinancialTransactions_UserId]', N'IX_FinancialTransactions_SellerId', 'INDEX';

ALTER TABLE [FinancialTransactions] ADD CONSTRAINT [FK_FinancialTransactions_User_SellerId] FOREIGN KEY ([SellerId]) REFERENCES [User] ([id]) ON DELETE CASCADE;

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20260205070141_PlatformFeeConfig', N'10.0.0');

COMMIT;
GO

BEGIN TRANSACTION;
EXEC sp_rename N'[ProductReports].[Created]', N'CreatedAt', 'COLUMN';

EXEC sp_rename N'[Product].[Created]', N'CreatedAt', 'COLUMN';

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20260221034144_AddProductReport_VeRO', N'10.0.0');

COMMIT;
GO

BEGIN TRANSACTION;
ALTER TABLE [SellerWallets] ADD [DisputedBalance] decimal(18,2) NOT NULL DEFAULT 0.0;

ALTER TABLE [SellerWallets] ADD [TotalRefunded] decimal(18,2) NOT NULL DEFAULT 0.0;

ALTER TABLE [Dispute] ADD [AssignedAt] datetime2 NULL;

ALTER TABLE [Dispute] ADD [AssignedTo] int NULL;

ALTER TABLE [Dispute] ADD [BuyerResponse] nvarchar(max) NULL;

ALTER TABLE [Dispute] ADD [CreatedAt] datetime2 NOT NULL DEFAULT '0001-01-01T00:00:00.0000000';

ALTER TABLE [Dispute] ADD [DeliveryStatus] nvarchar(max) NULL;

ALTER TABLE [Dispute] ADD [DesiredOutcome] nvarchar(max) NULL;

ALTER TABLE [Dispute] ADD [EscalatedAt] datetime2 NULL;

ALTER TABLE [Dispute] ADD [FirstResponseAt] datetime2 NULL;

ALTER TABLE [Dispute] ADD [IsAutoGenerated] bit NOT NULL DEFAULT CAST(0 AS bit);

ALTER TABLE [Dispute] ADD [IsHighValue] bit NOT NULL DEFAULT CAST(0 AS bit);

ALTER TABLE [Dispute] ADD [IsVeRO] bit NOT NULL DEFAULT CAST(0 AS bit);

ALTER TABLE [Dispute] ADD [LastOfferAmount] decimal(18,2) NULL;

ALTER TABLE [Dispute] ADD [LastViewedAt] datetime2 NULL;

ALTER TABLE [Dispute] ADD [NegotiationRounds] int NOT NULL DEFAULT 0;

ALTER TABLE [Dispute] ADD [OfferHistory] nvarchar(max) NULL;

ALTER TABLE [Dispute] ADD [RefundAmount] decimal(18,2) NULL;

ALTER TABLE [Dispute] ADD [RefundMethod] nvarchar(max) NULL;

ALTER TABLE [Dispute] ADD [RefundProcessedAt] datetime2 NULL;

ALTER TABLE [Dispute] ADD [RefundTransactionId] nvarchar(max) NULL;

ALTER TABLE [Dispute] ADD [RequiresReturn] bit NOT NULL DEFAULT CAST(0 AS bit);

ALTER TABLE [Dispute] ADD [ReturnReceivedAt] datetime2 NULL;

ALTER TABLE [Dispute] ADD [ReturnTrackingNumber] nvarchar(max) NULL;

ALTER TABLE [Dispute] ADD [Subcategory] nvarchar(max) NULL;

ALTER TABLE [Dispute] ADD [TrackingNumber] nvarchar(max) NULL;

ALTER TABLE [Dispute] ADD [Type] nvarchar(max) NULL;

ALTER TABLE [Dispute] ADD [ViewCount] int NOT NULL DEFAULT 0;

CREATE TABLE [DisputeMessages] (
    [Id] int NOT NULL IDENTITY,
    [DisputeId] int NOT NULL,
    [SenderId] int NOT NULL,
    [SenderType] nvarchar(20) NOT NULL,
    [MessageType] nvarchar(20) NOT NULL,
    [Content] nvarchar(max) NOT NULL,
    [Attachments] nvarchar(max) NULL,
    [OfferAmount] decimal(18,2) NULL,
    [OfferReason] nvarchar(max) NULL,
    [CreatedAt] datetime2 NOT NULL,
    [IsRead] bit NOT NULL,
    [ReadAt] datetime2 NULL,
    [IsInternal] bit NOT NULL,
    CONSTRAINT [PK_DisputeMessages] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_DisputeMessages_Dispute_DisputeId] FOREIGN KEY ([DisputeId]) REFERENCES [Dispute] ([id]) ON DELETE CASCADE,
    CONSTRAINT [FK_DisputeMessages_User_SenderId] FOREIGN KEY ([SenderId]) REFERENCES [User] ([id]) ON DELETE NO ACTION
);

CREATE INDEX [IX_DisputeMessages_CreatedAt] ON [DisputeMessages] ([CreatedAt]);

CREATE INDEX [IX_DisputeMessages_DisputeId] ON [DisputeMessages] ([DisputeId]);

CREATE INDEX [IX_DisputeMessages_DisputeId_CreatedAt] ON [DisputeMessages] ([DisputeId], [CreatedAt]);

CREATE INDEX [IX_DisputeMessages_SenderId] ON [DisputeMessages] ([SenderId]);

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20260222083549_EnhanceDisputeSystem', N'10.0.0');

COMMIT;
GO

BEGIN TRANSACTION;
DECLARE @var5 nvarchar(max);
SELECT @var5 = QUOTENAME([d].[name])
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Dispute]') AND [c].[name] = N'status');
IF @var5 IS NOT NULL EXEC(N'ALTER TABLE [Dispute] DROP CONSTRAINT ' + @var5 + ';');
ALTER TABLE [Dispute] ALTER COLUMN [status] nvarchar(30) NULL;

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20260222083951_IncreaseDisputeStatusColumnLength', N'10.0.0');

COMMIT;
GO

BEGIN TRANSACTION;
INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20260222092848_DisputeSystemPhase1', N'10.0.0');

COMMIT;
GO

BEGIN TRANSACTION;
IF COL_LENGTH('Product', 'ReportReason') IS NOT NULL ALTER TABLE [Product] DROP COLUMN [ReportReason];

IF COL_LENGTH('Product', 'ReportedBy') IS NOT NULL ALTER TABLE [Product] DROP COLUMN [ReportedBy];

ALTER TABLE [ReturnRequest] ADD [AdminNote] nvarchar(max) NULL;

ALTER TABLE [ReturnRequest] ADD [EvidenceImages] nvarchar(max) NULL;

ALTER TABLE [ReturnRequest] ADD [ResolvedAt] datetime2 NULL;

ALTER TABLE [ReturnRequest] ADD [ResolvedByAdminId] int NULL;

ALTER TABLE [ReturnRequest] ADD [ShopSolution] nvarchar(max) NULL;

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20260306071234_UpdateReturnRequest', N'10.0.0');

COMMIT;
GO

BEGIN TRANSACTION;
ALTER TABLE [FinancialTransactions] DROP CONSTRAINT [FK_FinancialTransactions_OrderTable_OrderId];

ALTER TABLE [FinancialTransactions] DROP CONSTRAINT [FK_FinancialTransactions_WithdrawalRequests_WithdrawalId];

ALTER TABLE [PlatformFees] DROP CONSTRAINT [FK_PlatformFees_Category_CategoryId];

ALTER TABLE [SellerWallets] DROP CONSTRAINT [FK_SellerWallets_User_SellerId];

ALTER TABLE [WithdrawalRequests] DROP CONSTRAINT [FK_WithdrawalRequests_User_ProcessedBy];

ALTER TABLE [WithdrawalRequests] DROP CONSTRAINT [FK_WithdrawalRequests_User_SellerId];

IF EXISTS (SELECT * FROM sys.columns WHERE Name = 'ReportReason' AND Object_ID = OBJECT_ID('Product')) BEGIN ALTER TABLE [Product] DROP COLUMN [ReportReason]; END

IF EXISTS (SELECT * FROM sys.columns WHERE Name = 'ReportedBy' AND Object_ID = OBJECT_ID('Product')) BEGIN ALTER TABLE [Product] DROP COLUMN [ReportedBy]; END

DECLARE @var6 nvarchar(max);
SELECT @var6 = QUOTENAME([d].[name])
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[WithdrawalRequests]') AND [c].[name] = N'TransactionId');
IF @var6 IS NOT NULL EXEC(N'ALTER TABLE [WithdrawalRequests] DROP CONSTRAINT ' + @var6 + ';');
ALTER TABLE [WithdrawalRequests] ALTER COLUMN [TransactionId] nvarchar(100) NULL;

DECLARE @var7 nvarchar(max);
SELECT @var7 = QUOTENAME([d].[name])
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[WithdrawalRequests]') AND [c].[name] = N'Status');
IF @var7 IS NOT NULL EXEC(N'ALTER TABLE [WithdrawalRequests] DROP CONSTRAINT ' + @var7 + ';');
ALTER TABLE [WithdrawalRequests] ALTER COLUMN [Status] nvarchar(50) NOT NULL;

DECLARE @var8 nvarchar(max);
SELECT @var8 = QUOTENAME([d].[name])
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[WithdrawalRequests]') AND [c].[name] = N'RejectionReason');
IF @var8 IS NOT NULL EXEC(N'ALTER TABLE [WithdrawalRequests] DROP CONSTRAINT ' + @var8 + ';');
ALTER TABLE [WithdrawalRequests] ALTER COLUMN [RejectionReason] nvarchar(500) NULL;

DECLARE @var9 nvarchar(max);
SELECT @var9 = QUOTENAME([d].[name])
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[WithdrawalRequests]') AND [c].[name] = N'BankName');
IF @var9 IS NOT NULL EXEC(N'ALTER TABLE [WithdrawalRequests] DROP CONSTRAINT ' + @var9 + ';');
ALTER TABLE [WithdrawalRequests] ALTER COLUMN [BankName] nvarchar(100) NULL;

DECLARE @var10 nvarchar(max);
SELECT @var10 = QUOTENAME([d].[name])
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[WithdrawalRequests]') AND [c].[name] = N'BankAccountNumber');
IF @var10 IS NOT NULL EXEC(N'ALTER TABLE [WithdrawalRequests] DROP CONSTRAINT ' + @var10 + ';');
ALTER TABLE [WithdrawalRequests] ALTER COLUMN [BankAccountNumber] nvarchar(50) NULL;

DECLARE @var11 nvarchar(max);
SELECT @var11 = QUOTENAME([d].[name])
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[WithdrawalRequests]') AND [c].[name] = N'BankAccountName');
IF @var11 IS NOT NULL EXEC(N'ALTER TABLE [WithdrawalRequests] DROP CONSTRAINT ' + @var11 + ';');
ALTER TABLE [WithdrawalRequests] ALTER COLUMN [BankAccountName] nvarchar(100) NULL;

ALTER TABLE [FinancialTransactions] ADD CONSTRAINT [FK_FinancialTransactions_OrderTable_OrderId] FOREIGN KEY ([OrderId]) REFERENCES [OrderTable] ([id]) ON DELETE SET NULL;

ALTER TABLE [FinancialTransactions] ADD CONSTRAINT [FK_FinancialTransactions_WithdrawalRequests_WithdrawalId] FOREIGN KEY ([WithdrawalId]) REFERENCES [WithdrawalRequests] ([Id]) ON DELETE SET NULL;

ALTER TABLE [PlatformFees] ADD CONSTRAINT [FK_PlatformFees_Category_CategoryId] FOREIGN KEY ([CategoryId]) REFERENCES [Category] ([id]) ON DELETE SET NULL;

ALTER TABLE [SellerWallets] ADD CONSTRAINT [FK_SellerWallets_User_SellerId] FOREIGN KEY ([SellerId]) REFERENCES [User] ([id]) ON DELETE NO ACTION;

ALTER TABLE [WithdrawalRequests] ADD CONSTRAINT [FK_WithdrawalRequests_User_ProcessedBy] FOREIGN KEY ([ProcessedBy]) REFERENCES [User] ([id]) ON DELETE SET NULL;

ALTER TABLE [WithdrawalRequests] ADD CONSTRAINT [FK_WithdrawalRequests_User_SellerId] FOREIGN KEY ([SellerId]) REFERENCES [User] ([id]) ON DELETE NO ACTION;

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20260311080317_FixDecimalPrecision', N'10.0.0');

COMMIT;
GO

BEGIN TRANSACTION;
ALTER TABLE [FinancialTransactions] ADD [UserId] int NOT NULL DEFAULT 0;

CREATE INDEX [IX_FinancialTransactions_UserId] ON [FinancialTransactions] ([UserId]);

ALTER TABLE [FinancialTransactions] ADD CONSTRAINT [FK_FinancialTransactions_User_UserId] FOREIGN KEY ([UserId]) REFERENCES [User] ([id]);

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20260314172021_MergeAdminRoleFeatures', N'10.0.0');

COMMIT;
GO

BEGIN TRANSACTION;
ALTER TABLE [User] ADD [IsReviewRestricted] bit NOT NULL DEFAULT CAST(0 AS bit);

ALTER TABLE [User] ADD [ProductBanUntil] datetime2 NULL;

ALTER TABLE [User] ADD [ReviewBanUntil] datetime2 NULL;

ALTER TABLE [User] ADD [ReviewViolationCount] int NOT NULL DEFAULT 0;

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20260315033033_UpdateReviewAndProductReportTable', N'10.0.0');

COMMIT;
GO

BEGIN TRANSACTION;
ALTER TABLE [User] ADD [PerformanceScore] int NOT NULL DEFAULT 0;

ALTER TABLE [ReturnRequest] ADD [IsRefundedByEbayFund] bit NOT NULL DEFAULT CAST(0 AS bit);

ALTER TABLE [ReturnRequest] ADD [ResolutionAction] nvarchar(max) NULL;

ALTER TABLE [ReturnRequest] ADD [ReturnLabelUrl] nvarchar(max) NULL;

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20260315070157_AddPerformanceScore', N'10.0.0');

COMMIT;
GO

BEGIN TRANSACTION;
DECLARE @var12 nvarchar(max);
SELECT @var12 = QUOTENAME([d].[name])
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[ReturnRequest]') AND [c].[name] = N'status');
IF @var12 IS NOT NULL EXEC(N'ALTER TABLE [ReturnRequest] DROP CONSTRAINT ' + @var12 + ';');
ALTER TABLE [ReturnRequest] ALTER COLUMN [status] nvarchar(50) NULL;

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20260315081355_IncreaseReturnRequestStatusLength', N'10.0.0');

COMMIT;
GO

BEGIN TRANSACTION;
ALTER TABLE [SellerWallets] ADD [LockedBalance] decimal(18,2) NOT NULL DEFAULT 0.0;

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20260316013203_AddLockedBalanceToWallet', N'10.0.0');

COMMIT;
GO

BEGIN TRANSACTION;
UPDATE [User] SET [role] = 'Administrator' WHERE [role] = 'Admin'

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20260316022422_FixAdminRoleName', N'10.0.0');

COMMIT;
GO

BEGIN TRANSACTION;
ALTER TABLE [Review] ADD [ReportedBySeller] bit NOT NULL DEFAULT CAST(0 AS bit);

ALTER TABLE [Review] ADD [SellerReply] nvarchar(max) NULL;

ALTER TABLE [Review] ADD [SellerReplyCreatedAt] datetime2 NULL;

ALTER TABLE [Review] ADD [SellerReportReason] nvarchar(max) NULL;

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20260316182347_AddSellerReviewFeatures', N'10.0.0');

COMMIT;
GO

BEGIN TRANSACTION;
CREATE TABLE [ReviewReports] (
    [Id] int NOT NULL IDENTITY,
    [ReviewId] int NOT NULL,
    [ReporterUserId] int NULL,
    [Reason] nvarchar(max) NOT NULL,
    [Description] nvarchar(max) NULL,
    [CreatedAt] datetime2 NOT NULL,
    [Status] nvarchar(max) NOT NULL,
    CONSTRAINT [PK_ReviewReports] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_ReviewReports_Review_ReviewId] FOREIGN KEY ([ReviewId]) REFERENCES [Review] ([id]) ON DELETE CASCADE,
    CONSTRAINT [FK_ReviewReports_User_ReporterUserId] FOREIGN KEY ([ReporterUserId]) REFERENCES [User] ([id])
);

CREATE INDEX [IX_ReviewReports_ReporterUserId] ON [ReviewReports] ([ReporterUserId]);

CREATE INDEX [IX_ReviewReports_ReviewId] ON [ReviewReports] ([ReviewId]);

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20260316185545_AddReviewReporting', N'10.0.0');

COMMIT;
GO

BEGIN TRANSACTION;
ALTER TABLE [User] ADD [CCCD] nvarchar(max) NULL;

ALTER TABLE [User] ADD [Latitude] float NULL;

ALTER TABLE [User] ADD [Longitude] float NULL;

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20260318080108_AddUserAutoReviewFields', N'10.0.0');

COMMIT;
GO

