# Script per aggiungere mobile-detect.js a tutte le pagine HTML
$files = @(
  "profile.html", "bacheca.html", "formazioni.html", "squadre.html", 
  "matchday.html", "statistiche.html", "admin.html", "admin-users.html",
  "admin-rules.html", "asta.html", "auth.html"
)

$mobileScript = '  <script src="resources/mobile-detect.js?v=2025101801"></script>'

foreach ($file in $files) {
  $path = Join-Path $PSScriptRoot $file
  if (Test-Path $path) {
    $content = Get-Content $path -Raw -Encoding UTF8
    
    # Controlla se mobile-detect già presente
    if ($content -notmatch 'mobile-detect\.js') {
      # Cerca theme.js e inserisci prima
      $content = $content -replace '(<script src="resources/theme\.js)', "$mobileScript`n  `$1"
      Set-Content $path $content -Encoding UTF8 -NoNewline
      Write-Host "✅ mobile-detect.js aggiunto a $file"
    } else {
      Write-Host "⏭️  $file già ha mobile-detect.js"
    }
  }
}

Write-Host "`n✅ Completato!"
