while ($true) {
    git add .
    git commit -m "Auto-save changes"
    git push origin main
    Start-Sleep -Seconds 300  # Ejecuta cada 5 minutos
}
