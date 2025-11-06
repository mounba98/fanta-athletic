# Script per aggiungere mobile-menu.js alle pagine
$files = @(
  "profile.html", "bacheca.html", "formazioni.html", "squadre.html", 
  "calendario.html", "standings.html", "classifiche.html", "matchday.html",
  "statistiche.html", "admin.html"
)

$mobileMenuScript = '  <script src="resources/mobile-menu.js?v=2025101803"></script>'

foreach ($file in $files) {
  $path = Join-Path $PSScriptRoot $file
  if (Test-Path $path) {
    $content = Get-Content $path -Raw -Encoding UTF8
    
    # Controlla se mobile-menu già presente
    if ($content -notmatch 'mobile-menu\.js') {
      # Cerca mobile-detect.js e inserisci dopo
      $content = $content -replace '(<script src="resources/mobile-detect\.js[^>]*></script>)', "`$1`n$mobileMenuScript"
      Set-Content $path $content -Encoding UTF8 -NoNewline
      Write-Host "✅ mobile-menu.js aggiunto a $file"
    } else {
      Write-Host "⏭️  $file già ha mobile-menu.js"
    }
  }
}

Write-Host "`n✅ Completato!"
