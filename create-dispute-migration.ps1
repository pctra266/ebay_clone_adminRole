# ====================================================
# Create Migration for Dispute Enhancement
# ====================================================

Write-Host "?? Creating migration for enhanced dispute system..." -ForegroundColor Cyan

Set-Location "$PSScriptRoot\src\Infrastructure"

dotnet ef migrations add EnhanceDisputeSystem `
    --context ApplicationDbContext `
    --startup-project ../Web

if ($LASTEXITCODE -eq 0) {
    Write-Host "? Migration created successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "1. Review migration file in src/Infrastructure/Data/Migrations/" -ForegroundColor White
    Write-Host "2. Run: .\migrate.ps1" -ForegroundColor White
    Write-Host "   Or: cd src/Infrastructure && dotnet ef database update" -ForegroundColor White
} else {
    Write-Host "? Migration failed!" -ForegroundColor Red
}

Set-Location "$PSScriptRoot"
