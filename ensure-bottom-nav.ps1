# Script per assicurare bottom-nav.js in TUTTE le pagine
$files = @(
  "index.html", "profile.html", "bacheca.html", "formazioni.html", "squadre.html", 
  "calendario.html", "standings.html", "classifiche.html", "matchday.html",
  "statistiche.html", "admin.html", "admin-roster.html", "admin-teams.html",
  "admin-cards.html", "admin-admins.html", "admin-rules.html", "admin-users.html",
  "h2h-standings.html", "asta.html"
)

$bottomNavScript = '  <script src="resources/bottom-nav.js?v=2025101802"></script>'

foreach ($file in $files) {
  $path = Join-Path $PSScriptRoot $file
  if (Test-Path $path) {
    $content = Get-Content $path -Raw -Encoding UTF8
    
    # Controlla se bottom-nav già presente
    if ($content -notmatch 'bottom-nav\.js') {
      # Cerca mobile-menu.js e inserisci dopo, oppure mobile-detect.js
      if ($content -match 'mobile-menu\.js') {
        $content = $content -replace '(<script src="resources/mobile-menu\.js[^>]*></script>)', "`$1`n$bottomNavScript"
      } elseif ($content -match 'mobile-detect\.js') {
        $content = $content -replace '(<script src="resources/mobile-detect\.js[^>]*></script>)', "`$1`n$bottomNavScript"
      } else {
        # Inserisci prima di theme.js
        $content = $content -replace '(<script src="resources/theme\.js[^>]*></script>)', "$bottomNavScript`n  `$1"
      }
      Set-Content $path $content -Encoding UTF8 -NoNewline
      Write-Host "✅ bottom-nav.js aggiunto a $file"
    } else {
      Write-Host "⏭️  $file già ha bottom-nav.js"
    }
  } else {
    Write-Host "⚠️  $file non trovato"
  }
}

Write-Host "`n✅ Completato!"
