# Script per aggiungere navbar.js a tutte le pagine
$files = @(
    "squadre.html",
    "formazioni.html", 
    "matchday.html",
    "standings.html",
    "allenatori.html",
    "giocatori.html",
    "profile.html",
    "asta.html",
    "bacheca.html",
    "curva.html"
)

$navbarScripts = @"
  <script src="resources/theme.js?v=2025101702"></script>
  <script src="resources/navbar.js?v=2025101702"></script>
  <script src="resources/auth-ui.js?v=2025101702"></script>
"@

foreach ($file in $files) {
    if (Test-Path $file) {
        $content = Get-Content $file -Raw
        
        # Rimuovi vecchi script se esistono
        $content = $content -replace '<script src="resources/theme\.js[^"]*"></script>\s*', ''
        $content = $content -replace '<script src="resources/navbar\.js[^"]*"></script>\s*', ''
        $content = $content -replace '<script src="resources/auth-ui\.js[^"]*"></script>\s*', ''
        
        # Aggiungi prima di </body>
        if ($content -notmatch 'navbar\.js') {
            $content = $content -replace '</body>', "$navbarScripts`n</body>"
            Set-Content $file $content -NoNewline
            Write-Host "✓ Aggiornato: $file" -ForegroundColor Green
        } else {
            Write-Host "○ Già presente: $file" -ForegroundColor Yellow
        }
    }
}

Write-Host "`n✅ Navbar aggiunta a tutte le pagine!" -ForegroundColor Green
