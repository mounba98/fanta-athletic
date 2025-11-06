# Script per aggiornare automaticamente la versione cache
$version = Get-Date -Format "yyyyMMddHHmm"
Write-Host "Aggiornamento versione cache a: $version" -ForegroundColor Green

# Lista file da aggiornare
$files = @(
    "index.html",
    "squadre.html",
    "formazioni.html",
    "matchday.html",
    "standings.html",
    "statistiche.html",
    "allenatori.html",
    "giocatori.html",
    "profile.html",
    "asta.html",
    "bacheca.html",
    "curva.html",
    "sw.js"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        $content = Get-Content $file -Raw
        # Sostituisci vecchie versioni con la nuova
        $content = $content -replace '\?v=\d+', "?v=$version"
        $content = $content -replace "fanta-athletic-v\d+", "fanta-athletic-v$version"
        Set-Content $file $content -NoNewline
        Write-Host "✓ Aggiornato: $file" -ForegroundColor Cyan
    }
}

Write-Host "`n✅ Versione aggiornata a: $version" -ForegroundColor Green
Write-Host "Ora esegui: firebase deploy --only hosting" -ForegroundColor Yellow
