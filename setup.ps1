# Check if Docker is available
if (!(Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host 'ERROR: docker command not found.' -ForegroundColor Red
    Write-Host 'Please ensure Docker Desktop is installed, running, and your terminal is restarted.' -ForegroundColor Yellow
    exit 1
}

Write-Host 'Starting Docker containers...' -ForegroundColor Cyan
docker compose up -d

Write-Host 'Waiting 10 seconds for PostgreSQL to initialize...' -ForegroundColor Cyan
Start-Sleep -Seconds 10

Write-Host 'Restructuring routes...' -ForegroundColor Cyan
mkdir "src/app/(shop)" -ErrorAction SilentlyContinue
$shopDirs = "about", "cart", "checkout", "contact", "dashboard", "login", "register", "shop", "track", "wishlist"
foreach ($dir in $shopDirs) {
    if (Test-Path "src/app/$dir") {
        Move-Item "src/app/$dir" "src/app/(shop)/" -Force
    }
}
if (Test-Path "src/app/page.tsx") { Move-Item "src/app/page.tsx" "src/app/(shop)/" -Force }
if (Test-Path "src/app/not-found.tsx") { Move-Item "src/app/not-found.tsx" "src/app/(shop)/" -Force }

Write-Host 'Installing dependencies...' -ForegroundColor Cyan
npm install

Write-Host 'Generating Prisma Client...' -ForegroundColor Cyan
npx prisma generate

Write-Host 'Pushing schema to database...' -ForegroundColor Cyan
npx prisma db push --accept-data-loss

Write-Host 'Seeding database...' -ForegroundColor Cyan
npm run db:seed

Write-Host 'Setup complete! You can now start the dev server with npm run dev.' -ForegroundColor Green