using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EbayClone.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class UpdateReturnRequest : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ReportReason",
                table: "Product");

            migrationBuilder.DropColumn(
                name: "ReportedBy",
                table: "Product");

            migrationBuilder.AddColumn<string>(
                name: "AdminNote",
                table: "ReturnRequest",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "EvidenceImages",
                table: "ReturnRequest",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ResolvedAt",
                table: "ReturnRequest",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ResolvedByAdminId",
                table: "ReturnRequest",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ShopSolution",
                table: "ReturnRequest",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AdminNote",
                table: "ReturnRequest");

            migrationBuilder.DropColumn(
                name: "EvidenceImages",
                table: "ReturnRequest");

            migrationBuilder.DropColumn(
                name: "ResolvedAt",
                table: "ReturnRequest");

            migrationBuilder.DropColumn(
                name: "ResolvedByAdminId",
                table: "ReturnRequest");

            migrationBuilder.DropColumn(
                name: "ShopSolution",
                table: "ReturnRequest");

            migrationBuilder.AddColumn<string>(
                name: "ReportReason",
                table: "Product",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ReportedBy",
                table: "Product",
                type: "nvarchar(max)",
                nullable: true);
        }
    }
}
