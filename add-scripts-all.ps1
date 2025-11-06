# Script per aggiungere script navbar/theme a tutte le pagine
$files = @(
    "allenatori.html",
    "giocatori.html",
    "profile.html",
    "asta.html",
    "bacheca.html",
    "curva.html"
)

$scripts = @"
  <script src="resources/theme.js?v=2025101703"></script>
  <script src="resources/navbar.js?v=2025101703"></script>
  <script src="resources/auth-ui.js?v=2025101703"></script>
"@

foreach ($file in $files) {
    if (Test-Path $file) {
        $content = Get-Content $file -Raw
        
        # Rimuovi vecchi script se esistono
        $content = $content -replace '<script src="resources/theme\.js[^"]*"></script>\s*', ''
        $content = $content -replace '<script src="resources/navbar\.js[^"]*"></script>\s*', ''
        $content = $content -replace '<script src="resources/auth-ui\.js[^"]*"></script>\s*', ''
        
        # Aggiungi prima di </body> se non ci sono già
        if ($content -notmatch 'navbar\.js\?v=2025101703') {
            $content = $content -replace '</body>', "$scripts`n</body>"
            Set-Content $file $content -NoNewline -Encoding UTF8
            Write-Host "OK $file" -ForegroundColor Green
        } else {
            Write-Host "SKIP $file" -ForegroundColor Yellow
        }
    }
}

Write-Host "`nFatto!" -ForegroundColor Cyan
