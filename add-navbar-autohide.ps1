# Script per aggiungere navbar-autohide.js alle pagine
$files = @(
  "index.html", "profile.html", "bacheca.html", "formazioni.html", "squadre.html", 
  "calendario.html", "standings.html", "classifiche.html", "matchday.html",
  "statistiche.html", "admin.html", "admin-roster.html", "admin-teams.html",
  "admin-cards.html", "admin-admins.html", "admin-rules.html"
)

$navbarScript = '  <script src="resources/navbar-autohide.js?v=2025101805"></script>'

foreach ($file in $files) {
  $path = Join-Path $PSScriptRoot $file
  if (Test-Path $path) {
    $content = Get-Content $path -Raw -Encoding UTF8
    
    # Controlla se navbar-autohide già presente
    if ($content -notmatch 'navbar-autohide\.js') {
      # Cerca theme.js e inserisci prima
      $content = $content -replace '(<script src="resources/theme\.js[^>]*></script>)', "$navbarScript`n  `$1"
      Set-Content $path $content -Encoding UTF8 -NoNewline
      Write-Host "✅ navbar-autohide.js aggiunto a $file"
    } else {
      Write-Host "⏭️  $file già ha navbar-autohide.js"
    }
  }
}

Write-Host "`n✅ Completato!"
