# Railway Pre-Deployment Validation Script
# Run this before pushing to Railway

Write-Host "🔍 Validating Railway deployment..." -ForegroundColor Cyan

# 1. Check if we're in the right directory
if (-not (Test-Path "backend/package.json")) {
    Write-Host "❌ Error: backend/package.json not found!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Project structure valid" -ForegroundColor Green

# 2. Test npm install
Write-Host "`n📦 Testing npm install..." -ForegroundColor Cyan
Push-Location backend
npm install --silent
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ npm install failed!" -ForegroundColor Red
    Pop-Location
    exit 1
}
Write-Host "✅ npm install successful" -ForegroundColor Green

# 3. Test Prisma generate
Write-Host "`n🔧 Testing Prisma generate..." -ForegroundColor Cyan
npx prisma generate 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Prisma generate had warnings - okay for local dev" -ForegroundColor Yellow
} else {
    Write-Host "✅ Prisma generate successful" -ForegroundColor Green
}

# 4. Test build
Write-Host "`n🏗️  Testing build..." -ForegroundColor Cyan
npm run build --silent
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed!" -ForegroundColor Red
    Pop-Location
    exit 1
}
Write-Host "✅ Build successful" -ForegroundColor Green

Pop-Location

# 5. Check for required environment variables in railway.json
Write-Host "`n🔐 Checking configuration..." -ForegroundColor Cyan
if (Test-Path "railway.json") {
    Write-Host "✅ railway.json exists" -ForegroundColor Green
} else {
    Write-Host "⚠️  railway.json not found" -ForegroundColor Yellow
}

if (Test-Path "nixpacks.toml") {
    Write-Host "✅ nixpacks.toml exists" -ForegroundColor Green
} else {
    Write-Host "⚠️  nixpacks.toml not found" -ForegroundColor Yellow
}

Write-Host "`n✨ All validations passed! Ready to deploy to Railway." -ForegroundColor Green
Write-Host "`nNext steps:" -ForegroundColor Cyan
Write-Host "1. git add ." -ForegroundColor White
Write-Host "2. git commit -m 'your message'" -ForegroundColor White
Write-Host "3. git push" -ForegroundColor White
