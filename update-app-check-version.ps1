# Update App Check version to v3 in all Storage files

$files = @(
    "upload-foto-giocatori.html",
    "user-profile-upload.html",
    "profile.html",
    "bacheca.html",
    "admin-roster.html",
    "admin-import-players.html",
    "admin-cards.html"
)

$count = 0

foreach ($file in $files) {
    $path = Join-Path $PSScriptRoot $file
    if (Test-Path $path) {
        $content = Get-Content $path -Raw -Encoding UTF8
        
        # Update app-check-config version
        $pattern1 = 'app-check-config.js?v=20251021-1'
        $replacement1 = 'app-check-config.js?v=20251021-3'
        
        if ($content -match [regex]::Escape($pattern1)) {
            $content = $content -replace [regex]::Escape($pattern1), $replacement1
            Write-Host "  ✅ Updated app-check-config version in $file"
        }
        
        # Update firebase-config version
        $pattern2 = 'firebase-config.js?v=20251021-2'
        $replacement2 = 'firebase-config.js?v=20251021-3'
        
        if ($content -match [regex]::Escape($pattern2)) {
            $content = $content -replace [regex]::Escape($pattern2), $replacement2
            Write-Host "  ✅ Updated firebase-config version in $file"
        }
        
        # Save
        Set-Content $path $content -Encoding UTF8 -NoNewline
        Write-Host "✅ Updated: $file`n"
        $count++
    }
}

Write-Host "`n🎉 Updated $count files to v3!"
