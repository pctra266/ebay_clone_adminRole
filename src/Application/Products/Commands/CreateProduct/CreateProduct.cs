using System;
using System.Collections.Generic;
using System.Text;
using EbayClone.Application.Common.Interfaces;
using EbayClone.Domain.Entities;

namespace EbayClone.Application.Products.Commands.CreateProduct;
public record CreateProductCommand : IRequest<int>
{
    public string? Title { get; set; }
    public string? Description { get; set; }
    public decimal? Price { get; set; }
    public string? Images { get; set; }
    public int? CategoryId { get; set; }
    public bool? IsAuction { get; set; }
    // SellerId thường lấy từ CurrentUserService (người đang đăng nhập), 
    // nhưng ở đây tôi để tạm là tham số truyền vào để bạn dễ test.
    public int? SellerId { get; set; }
}

// 2. Định nghĩa Handler (Logic xử lý)
public class CreateProductCommandHandler : IRequestHandler<CreateProductCommand, int>
{
    private readonly IApplicationDbContext _context;

    public CreateProductCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<int> Handle(CreateProductCommand request, CancellationToken cancellationToken)
    {
        var entity = new Product
        {
            Title = request.Title,
            Description = request.Description,
            Price = request.Price,
            Images = request.Images,
            CategoryId = request.CategoryId,
            SellerId = request.SellerId,
            IsAuction = request.IsAuction,
            Status = "InActive",
            ReportCount = 0
        };

        _context.Products.Add(entity);

        await _context.SaveChangesAsync(cancellationToken);

        return entity.Id; // Trả về ID của sản phẩm vừa tạo
    }
}
