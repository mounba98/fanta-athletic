# Script per aggiungere favicon a tutte le pagine HTML
$files = @(
  "profile.html", "bacheca.html", "formazioni.html", "squadre.html", 
  "matchday.html", "statistiche.html", "admin.html", "admin-users.html",
  "admin-rules.html", "asta.html", "auth.html", "set-admin.html"
)

$faviconLines = @"
  <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
  <link rel="icon" type="image/x-icon" href="/favicon.ico" />
"@

foreach ($file in $files) {
  $path = Join-Path $PSScriptRoot $file
  if (Test-Path $path) {
    $content = Get-Content $path -Raw -Encoding UTF8
    
    # Controlla se favicon già presente
    if ($content -notmatch 'favicon\.svg') {
      # Cerca <link rel="stylesheet" e inserisci prima
      $content = $content -replace '(<link rel="stylesheet")', "$faviconLines`n  `$1"
      Set-Content $path $content -Encoding UTF8 -NoNewline
      Write-Host "✅ Favicon aggiunto a $file"
    } else {
      Write-Host "⏭️  $file già ha favicon"
    }
  }
}

Write-Host "`n✅ Completato!"
