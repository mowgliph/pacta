# Script de backup para el proyecto PACTA
# Autor: Jelvys Triana
# Fecha: 25/03/2025

# Función para mostrar mensajes con formato
function Write-ColorMessage {
    param(
        [string]$Message,
        [string]$Color = "White"
    )
    Write-Host $Message -ForegroundColor $Color
}

# Obtener la fecha actual para el nombre del backup
$date = Get-Date -Format "yyyy-MM-dd_HH-mm"
$projectName = "PACTA"
$backupName = "${projectName}_backup_${date}"

# Solicitar al usuario que seleccione la unidad USB
Write-ColorMessage "Buscando unidades USB disponibles..." "Yellow"
$usbDrives = Get-WmiObject Win32_LogicalDisk | Where-Object { $_.DriveType -eq 2 }

if ($usbDrives.Count -eq 0) {
    Write-ColorMessage "No se encontraron unidades USB. Por favor, conecte una unidad USB e intente nuevamente." "Red"
    exit 1
}

Write-ColorMessage "`nUnidades USB disponibles:" "Cyan"
$index = 1
$usbDrives | ForEach-Object {
    Write-ColorMessage "$index. $($_.DeviceID) - $($_.VolumeName) ($([math]::Round($_.FreeSpace/1GB, 2)) GB libres)" "White"
    $index++
}

do {
    $selection = Read-Host "`nSeleccione el número de la unidad USB destino (1-$($usbDrives.Count))"
} while ($selection -lt 1 -or $selection -gt $usbDrives.Count)

$selectedDrive = $usbDrives[$selection - 1]
$destinationPath = Join-Path $selectedDrive.DeviceID $backupName

# Verificar si el directorio de backup ya existe
if (Test-Path $destinationPath) {
    Write-ColorMessage "`n¡ADVERTENCIA! El directorio de backup ya existe:" "Yellow"
    Write-ColorMessage $destinationPath "White"
    $overwrite = Read-Host "¿Desea sobreescribir? (S/N)"
    
    if ($overwrite -eq "S" -or $overwrite -eq "s") {
        Write-ColorMessage "Eliminando directorio existente..." "Yellow"
        Remove-Item -Path $destinationPath -Recurse -Force
    } else {
        $timestamp = Get-Date -Format "HHmmss"
        $backupName = "${projectName}_backup_${date}_${timestamp}"
        $destinationPath = Join-Path $selectedDrive.DeviceID $backupName
        Write-ColorMessage "Usando nuevo nombre de directorio: $backupName" "Cyan"
    }
}

# Crear directorio de backup
Write-ColorMessage "`nCreando directorio de backup en $destinationPath..." "Yellow"
New-Item -ItemType Directory -Path $destinationPath -Force | Out-Null

# Definir elementos a excluir
$excludedItems = @(
    "node_modules",
    ".git",
    "dist",
    "build",
    "coverage",
    ".next",
    ".nuxt",
    ".output"
)

# Función para copiar archivos excluyendo carpetas específicas
function Copy-ProjectFiles {
    param(
        [string]$source,
        [string]$destination,
        [array]$exclude
    )
    
    Get-ChildItem -Path $source -Exclude $exclude | ForEach-Object {
        $destinationItem = Join-Path $destination $_.Name
        if ($_.PSIsContainer) {
            # Si es un directorio, verificar si está en la lista de exclusión
            if ($exclude -notcontains $_.Name) {
                if (Test-Path $destinationItem) {
                    Write-ColorMessage "Actualizando directorio: $($_.Name)" "Cyan"
                } else {
                    Write-ColorMessage "Creando directorio: $($_.Name)" "White"
                }
                New-Item -ItemType Directory -Path $destinationItem -Force | Out-Null
                Copy-ProjectFiles -source $_.FullName -destination $destinationItem -exclude $exclude
            }
        } else {
            if (Test-Path $destinationItem) {
                Write-ColorMessage "Actualizando archivo: $($_.Name)" "Cyan"
            } else {
                Write-ColorMessage "Copiando archivo: $($_.Name)" "White"
            }
            Copy-Item $_.FullName -Destination $destinationItem -Force
        }
    }
}

# Iniciar el proceso de backup
Write-ColorMessage "`nIniciando backup del proyecto..." "Yellow"
$startTime = Get-Date

try {
    # Copiar archivos del frontend
    Write-ColorMessage "`nCopiando frontend..." "Cyan"
    $frontendSource = "frontend"
    $frontendDest = Join-Path $destinationPath "frontend"
    New-Item -ItemType Directory -Path $frontendDest -Force | Out-Null
    Copy-ProjectFiles -source $frontendSource -destination $frontendDest -exclude $excludedItems

    # Copiar archivos del backend
    Write-ColorMessage "`nCopiando backend..." "Cyan"
    $backendSource = "backend"
    $backendDest = Join-Path $destinationPath "backend"
    New-Item -ItemType Directory -Path $backendDest -Force | Out-Null
    Copy-ProjectFiles -source $backendSource -destination $backendDest -exclude $excludedItems

    # Copiar archivos de la raíz del proyecto
    Write-ColorMessage "`nCopiando archivos de configuración..." "Cyan"
    Get-ChildItem -Path "." -File | ForEach-Object {
        $destFile = Join-Path $destinationPath $_.Name
        if (Test-Path $destFile) {
            Write-ColorMessage "Actualizando archivo: $($_.Name)" "Cyan"
        } else {
            Write-ColorMessage "Copiando archivo: $($_.Name)" "White"
        }
        Copy-Item $_.FullName -Destination $destFile -Force
    }

    $endTime = Get-Date
    $duration = $endTime - $startTime

    # Crear archivo de información del backup
    $infoContent = @"
Backup del Proyecto PACTA
------------------------
Fecha: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
Duración: $($duration.Minutes) minutos y $($duration.Seconds) segundos
Ubicación: $destinationPath
Elementos excluidos: $($excludedItems -join ", ")
"@

    $infoContent | Out-File -FilePath (Join-Path $destinationPath "backup-info.txt") -Force

    Write-ColorMessage "`n¡Backup completado exitosamente!" "Green"
    Write-ColorMessage "Ubicación: $destinationPath" "White"
    Write-ColorMessage "Duración: $($duration.Minutes) minutos y $($duration.Seconds) segundos" "White"

} catch {
    Write-ColorMessage "`n¡Error durante el backup!" "Red"
    Write-ColorMessage $_.Exception.Message "Red"
    exit 1
}

# Verificar el backup
Write-ColorMessage "`nVerificando backup..." "Yellow"
$backupSize = (Get-ChildItem -Path $destinationPath -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB
Write-ColorMessage "Tamaño total del backup: $([math]::Round($backupSize, 2)) MB" "White"

# Preguntar si desea crear un archivo ZIP
$createZip = Read-Host "`n¿Desea crear un archivo ZIP del backup? (S/N)"
if ($createZip -eq "S" -or $createZip -eq "s") {
    Write-ColorMessage "Creando archivo ZIP..." "Yellow"
    $zipPath = "$destinationPath.zip"
    
    # Verificar si el archivo ZIP ya existe
    if (Test-Path $zipPath) {
        Write-ColorMessage "¡ADVERTENCIA! El archivo ZIP ya existe:" "Yellow"
        Write-ColorMessage $zipPath "White"
        $overwriteZip = Read-Host "¿Desea sobreescribir? (S/N)"
        
        if ($overwriteZip -eq "S" -or $overwriteZip -eq "s") {
            Write-ColorMessage "Sobreescribiendo archivo ZIP existente..." "Yellow"
            Remove-Item -Path $zipPath -Force
        } else {
            $timestamp = Get-Date -Format "HHmmss"
            $zipPath = "$destinationPath_$timestamp.zip"
            Write-ColorMessage "Usando nuevo nombre para ZIP: $([System.IO.Path]::GetFileName($zipPath))" "Cyan"
        }
    }
    
    Compress-Archive -Path $destinationPath -DestinationPath $zipPath -Force
    Write-ColorMessage "Archivo ZIP creado en: $zipPath" "Green"
    
    # Preguntar si desea eliminar la carpeta original
    $deleteFolder = Read-Host "¿Desea eliminar la carpeta original del backup? (S/N)"
    if ($deleteFolder -eq "S" -or $deleteFolder -eq "s") {
        Remove-Item -Path $destinationPath -Recurse -Force
        Write-ColorMessage "Carpeta original eliminada" "Yellow"
    }
}

Write-ColorMessage "`n¡Proceso de backup completado!" "Green"
Write-ColorMessage "Presione cualquier tecla para salir..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") 