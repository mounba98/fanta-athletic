# Fix Firebase Init in All HTML Files
# Adds versioned firebase-config.js and immediate init

$files = @(
    "wirc-royale.html",
    "wirc-card-gallery.html",
    "wirc-battle.html",
    "user-profile-upload.html",
    "test-penalties.html",
    "standings.html",
    "squadre_live.html",
    "squadre.html",
    "set-first-admin.html",
    "profile.html",
    "populate-data.html",
    "osm-manager-v2.html",
    "osm-manager.html",
    "migrate-existing-data.html",
    "matchday_live.html",
    "matchday.html",
    "join-team.html",
    "h2h-standings.html",
    "fix-users-leagues.html",
    "classifiche.html",
    "clash-cards.html",
    "calendario.html",
    "bacheca.html",
    "asta.html",
    "admin.html",
    "admin-users.html",
    "admin-teams.html",
    "admin-rules.html",
    "admin-roster.html",
    "admin-leghe.html",
    "admin-import-players.html",
    "admin-debug.html",
    "admin-deadline.html",
    "admin-cup.html",
    "admin-cards.html",
    "admin-admins.html"
)

$oldPattern1 = '  <script src="resources/firebase-config.js"></script>'
$newPattern1 = '  <script src="resources/firebase-config.js?v=20251021-2"></script>
  <script>
    // Init Firebase SUBITO
    if (!firebase.apps.length) {
      firebase.initializeApp(window.firebaseConfig);
    }
  </script>'

$oldPattern2 = '  <script src="resources/firebase-config.js"></script>
  <script>
    if (!firebase.apps.length) {
      firebase.initializeApp(window.firebaseConfig);
    }
  </script>'

$newPattern2 = '  <script src="resources/firebase-config.js?v=20251021-2"></script>
  <script>
    // Init Firebase SUBITO
    if (!firebase.apps.length) {
      firebase.initializeApp(window.firebaseConfig);
    }
  </script>'

$oldPattern3 = '  <script src="resources/firebase-config.js"></script>
  <script src="resources/firebase.js"></script>'

$newPattern3 = '  <script src="resources/firebase-config.js?v=20251021-2"></script>
  <script>
    // Init Firebase SUBITO
    if (!firebase.apps.length) {
      firebase.initializeApp(window.firebaseConfig);
    }
  </script>
  <script src="resources/firebase.js"></script>'

$count = 0
foreach ($file in $files) {
    $path = Join-Path $PSScriptRoot $file
    if (Test-Path $path) {
        $content = Get-Content $path -Raw -Encoding UTF8
        
        # Try pattern 3 first (with firebase.js)
        if ($content -match [regex]::Escape($oldPattern3)) {
            $content = $content -replace [regex]::Escape($oldPattern3), $newPattern3
            Set-Content $path $content -Encoding UTF8 -NoNewline
            Write-Host "✅ Fixed: $file (pattern 3)"
            $count++
        }
        # Then pattern 2 (with init already)
        elseif ($content -match [regex]::Escape($oldPattern2)) {
            $content = $content -replace [regex]::Escape($oldPattern2), $newPattern2
            Set-Content $path $content -Encoding UTF8 -NoNewline
            Write-Host "✅ Fixed: $file (pattern 2)"
            $count++
        }
        # Then pattern 1 (simple)
        elseif ($content -match [regex]::Escape($oldPattern1)) {
            $content = $content -replace [regex]::Escape($oldPattern1), $newPattern1
            Set-Content $path $content -Encoding UTF8 -NoNewline
            Write-Host "✅ Fixed: $file (pattern 1)"
            $count++
        }
        else {
            Write-Host "⏭️  Skipped: $file (already fixed or different pattern)"
        }
    } else {
        Write-Host "❌ Not found: $file"
    }
}

Write-Host "`n🎉 Fixed $count files!"
Write-Host "`nNext steps:"
Write-Host "1. Review changes"
Write-Host "2. Run: firebase deploy --only hosting"
