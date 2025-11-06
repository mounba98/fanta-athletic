# Add App Check to Storage Files
# Adds firebase-app-check-compat.js and activateAppCheck() call

$files = @(
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
        
        # Pattern 1: Add app-check-compat.js after app-compat.js
        $pattern1 = '  <script src="https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js"></script>'
        $replacement1 = '  <script src="https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/10.14.1/firebase-app-check-compat.js"></script>'
        
        if ($content -match [regex]::Escape($pattern1) -and $content -notmatch 'firebase-app-check-compat') {
            $content = $content -replace [regex]::Escape($pattern1), $replacement1
            Write-Host "  ✅ Added app-check-compat.js to $file"
        }
        
        # Pattern 2: Add app-check-config.js after firebase-config.js
        $pattern2 = '  <script src="resources/firebase-config.js?v=20251021-2"></script>'
        $replacement2 = '  <script src="resources/firebase-config.js?v=20251021-2"></script>
  <script src="resources/app-check-config.js?v=20251021-1"></script>'
        
        if ($content -match [regex]::Escape($pattern2) -and $content -notmatch 'app-check-config') {
            $content = $content -replace [regex]::Escape($pattern2), $replacement2
            Write-Host "  ✅ Added app-check-config.js to $file"
        }
        
        # Pattern 3: Add activateAppCheck() call after initializeApp
        $pattern3 = '    // Init Firebase SUBITO
    if (!firebase.apps.length) {
      firebase.initializeApp(window.firebaseConfig);
    }
  </script>'
        
        $replacement3 = '    // Init Firebase SUBITO
    if (!firebase.apps.length) {
      firebase.initializeApp(window.firebaseConfig);
    }
    
    // Attiva App Check (dev: debug token, prod: reCAPTCHA v3)
    activateAppCheck();
  </script>'
        
        if ($content -match [regex]::Escape($pattern3) -and $content -notmatch 'activateAppCheck') {
            $content = $content -replace [regex]::Escape($pattern3), $replacement3
            Write-Host "  ✅ Added activateAppCheck() to $file"
            $count++
        }
        
        # Save file
        Set-Content $path $content -Encoding UTF8 -NoNewline
        Write-Host "✅ Fixed: $file`n"
    } else {
        Write-Host "❌ Not found: $file`n"
    }
}

Write-Host "`n🎉 Fixed $count files with App Check!"
Write-Host "`nNext steps:"
Write-Host "1. Configure reCAPTCHA Site Key in app-check-config.js"
Write-Host "2. Follow instructions in APP_CHECK_SETUP.md"
Write-Host "3. Run: firebase deploy --only hosting"
