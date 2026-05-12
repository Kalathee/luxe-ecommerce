# Check if git is available
if (!(Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host 'ERROR: git command not found.' -ForegroundColor Red
    Write-Host 'Please ensure Git is installed and in your PATH.' -ForegroundColor Yellow
    exit 1
}

Write-Host 'Staging files...' -ForegroundColor Cyan
git add .

Write-Host 'Committing changes...' -ForegroundColor Cyan
git commit -m "feat: implement premium admin dashboard, rbac security, and multi-tab sync"

Write-Host 'Pushing to GitHub...' -ForegroundColor Cyan
git push -u origin main

Write-Host 'Sync complete!' -ForegroundColor Green
