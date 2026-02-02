using System;
using System.Collections.Generic;
using System.Text;
using EbayClone.Application.Common.Interfaces;
using EbayClone.Domain.Entities;

namespace EbayClone.Application.Products.Commands.UpdateProduct;
public record UpdateProductCommand : IRequest
{
    public int Id { get; set; } // Cần ID để biết sửa cái nào
    public string? Title { get; set; }
    public string? Description { get; set; }
    public decimal? Price { get; set; }
    public string? Status { get; set; }
}

public class UpdateProductCommandHandler : IRequestHandler<UpdateProductCommand>
{
    private readonly IApplicationDbContext _context;

    public UpdateProductCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task Handle(UpdateProductCommand request, CancellationToken cancellationToken)
    {
        // 1. Tìm entity trong DB
        var entity = await _context.Products
            .FindAsync(new object[] { request.Id }, cancellationToken);

        // 2. Kiểm tra nếu không tồn tại
        if (entity == null)
        {
            // NotFoundException thường có sẵn trong template Clean Architecture
            // Nếu chưa có, bạn có thể throw new Exception("Not Found");
            throw new NotFoundException(nameof(Product), $"{request.Id}");
        }

        // 3. Cập nhật dữ liệu
        // Chỉ cập nhật những trường được phép sửa
        entity.Title = request.Title;
        entity.Description = request.Description;
        entity.Price = request.Price;

        if (!string.IsNullOrEmpty(request.Status))
        {
            entity.Status = request.Status;
        }

        // 4. Lưu thay đổi
        await _context.SaveChangesAsync(cancellationToken);
    }
}
