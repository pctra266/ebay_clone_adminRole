
using EbayClone.Application.Common.Models;
using EbayClone.Application.Products.Commands.CreateProduct;
using EbayClone.Application.Products.Commands.DeleteProduct;
using EbayClone.Application.Products.Commands.UpdateProduct;
using EbayClone.Application.Products.Queries.DTOs;
using EbayClone.Application.Products.Queries.GetProducts;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Mvc;

namespace EbayClone.Web.Endpoints;

public class Products : EndpointGroupBase
{
    public override void Map(RouteGroupBuilder group)
    {
        // 'group' ở đây chính là nhóm route "/api/products" đã được hệ thống tạo sẵn

        // Chỉ cần khai báo các hành động cụ thể vào group này
        group.MapGet(GetProducts);              // Tự động thành: GET /api/products
        group.MapPost(CreateProduct);           // Tự động thành: POST /api/products
        group.MapPut("{id}", UpdateProduct);
        group.MapDelete("{id}", DeleteProduct);

      

        // [MỚI] Màn hình 5: Lấy danh sách quản lý (có Lọc/Tab)
        group.MapGet("managed", GetManagedProducts); // GET /api/products/managed

    }
    // 1. Hàm xử lý GET
    public async Task<List<ProductDto>> GetProducts(ISender sender)
    {
        return await sender.Send(new GetProductsQuery());
    }

    // 2. Hàm xử lý POST (Create)
    public async Task<int> CreateProduct(ISender sender, CreateProductCommand command)
    {
        return await sender.Send(command);
    }

    // 3. Hàm xử lý PUT (Update)
    public async Task<IResult> UpdateProduct(ISender sender, int id, UpdateProductCommand command)
    {
        if (id != command.Id) return Results.BadRequest();

        await sender.Send(command);

        return Results.NoContent();
    }

    // 4. Hàm xử lý DELETE
    public async Task<IResult> DeleteProduct(ISender sender, int id)
    {
        await sender.Send(new DeleteProductCommand(id));

        return Results.NoContent();
    }

    // 1. API cho Màn hình 5 (List)
    // Sử dụng [AsParameters] để map query string (?page=1&tab=Reported) vào Object Query
    public async Task<PaginatedList<ManagedProductDto>> GetManagedProducts(ISender sender, [AsParameters] GetManagedProductsQuery query)
    {
        return await sender.Send(query);
    }


}
