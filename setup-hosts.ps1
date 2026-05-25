# Script para agregar entradas en el archivo hosts
# Requiere ejecutar como Administrador

param([switch]$Remove)

$hostsPath = "$env:SystemRoot\System32\drivers\etc\hosts"
$entries = @(
    "127.0.0.1 mongo1",
    "127.0.0.1 mongo2",
    "127.0.0.1 mongo3"
)

try {
    $hostsContent = Get-Content -Path $hostsPath -Raw

    if ($Remove) {
        Write-Host "Eliminando entradas del archivo hosts..." -ForegroundColor Yellow
        foreach ($entry in $entries) {
            $hostsContent = $hostsContent -replace [regex]::Escape("$entry`r`n"), ""
            $hostsContent = $hostsContent -replace [regex]::Escape("$entry`n"), ""
        }
        Write-Host "Entradas eliminadas correctamente." -ForegroundColor Green
    } else {
        Write-Host "Agregando entradas al archivo hosts..." -ForegroundColor Cyan
        $needsUpdate = $false
        foreach ($entry in $entries) {
            if ($hostsContent -notmatch [regex]::Escape($entry)) {
                $hostsContent += "`r`n$entry"
                $needsUpdate = $true
                Write-Host "Agregado: $entry" -ForegroundColor Green
            } else {
                Write-Host "Ya existe: $entry" -ForegroundColor Gray
            }
        }
        if (-not $needsUpdate) {
            Write-Host "Todas las entradas ya existen en el archivo hosts." -ForegroundColor Yellow
        }
    }

    Set-Content -Path $hostsPath -Value $hostsContent -NoNewline
    Write-Host "`nArchivo hosts actualizado correctamente!" -ForegroundColor Green

} catch {
    Write-Host "`nError: $_" -ForegroundColor Red
    Write-Host "Por favor, ejecuta este script como Administrador." -ForegroundColor Red
}
