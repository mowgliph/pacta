#define MyAppName "PACTA"
#define MyAppVersion "1.0.0"
#define MyAppPublisher "IDS Informática Pinar del Río"
#define MyAppExeName "pacta.exe"

[Setup]
AppId={{817213ca-bb14-4c33-8397-4ada681eba25}}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppPublisher={#MyAppPublisher}
DefaultDirName={autopf}\{#MyAppName}
DefaultGroupName={#MyAppName}
DisableProgramGroupPage=yes
OutputDir=..\dist
OutputBaseFilename=PACTA_Setup
Compression=lzma
SolidCompression=yes
PrivilegesRequired=admin

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"
Name: "spanish"; MessagesFile: "compiler:Languages\Spanish.isl"

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"

[Files]
; Main executable and required files
Source: "..\backend\dist\pacta.exe"; DestDir: "{app}"; Flags: ignoreversion
Source: "..\backend\dist\config\*"; DestDir: "{app}\config"; Flags: ignoreversion recursesubdirs
Source: "..\backend\dist\models\*"; DestDir: "{app}\models"; Flags: ignoreversion recursesubdirs
Source: "..\backend\dist\.env"; DestDir: "{app}"; Flags: ignoreversion

; Database directory
Source: "..\backend\dist\database\*"; DestDir: "{app}\database"; Flags: ignoreversion recursesubdirs createallsubdirs
; Create empty database directory if it doesn't exist
[Dirs]
Name: "{app}\database"

[Icons]
Name: "{group}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"
Name: "{autodesktop}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"; Tasks: desktopicon

[Run]
Filename: "{app}\{#MyAppExeName}"; Description: "{cm:LaunchProgram,{#StringChange(MyAppName, '&', '&&')}}"; Flags: nowait postinstall skipifsilent

[Code]
// Check if the port 3000 is available before installation
function InitializeSetup(): Boolean;
var
  ResultCode: Integer;
begin
  Result := True;
  // You can add additional checks here if needed
end;

// Create necessary directories after installation
procedure CurStepChanged(CurStep: TSetupStep);
begin
  if CurStep = ssPostInstall then
  begin
    // Create database directory if it doesn't exist
    CreateDir(ExpandConstant('{app}\database'));
    
    // Set appropriate permissions for the database directory
    Exec(ExpandConstant('{sys}\icacls.exe'),
      ExpandConstant('"{app}\database" /grant Users:(OI)(CI)F'),
      '', SW_HIDE, ewWaitUntilTerminated, ResultCode);
  end;
end;