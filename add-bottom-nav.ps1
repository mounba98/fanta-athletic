# Script per aggiungere bottom-nav.js alle pagine principali
$files = @(
  "index.html", "profile.html", "bacheca.html", "formazioni.html", "squadre.html", 
  "calendario.html", "standings.html", "classifiche.html"
)

$bottomNavScript = '  <script src="resources/bottom-nav.js?v=2025101802"></script>'

foreach ($file in $files) {
  $path = Join-Path $PSScriptRoot $file
  if (Test-Path $path) {
    $content = Get-Content $path -Raw -Encoding UTF8
    
    # Controlla se bottom-nav già presente
    if ($content -notmatch 'bottom-nav\.js') {
      # Cerca mobile-detect.js e inserisci dopo
      $content = $content -replace '(<script src="resources/mobile-detect\.js[^>]*></script>)', "`$1`n$bottomNavScript"
      Set-Content $path $content -Encoding UTF8 -NoNewline
      Write-Host "✅ bottom-nav.js aggiunto a $file"
    } else {
      Write-Host "⏭️  $file già ha bottom-nav.js"
    }
  }
}

Write-Host "`n✅ Completato!"
