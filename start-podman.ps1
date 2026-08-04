param(
    [string] $Tag = 'dvf-web-tools:local',
    [int]    $Port = 8080,
    [switch] $RebuildImage
)

$ErrorActionPreference = 'Stop'

Set-Location -Path $PSScriptRoot

if (-not (Get-Command podman -ErrorAction SilentlyContinue))
{
    throw 'podman was not found. Install Podman Desktop first: https://podman-desktop.io/'
}

# Check if a podman machine is running; start the default one if not
$runnningMachine = podman machine list --format '{{.Running}}' 2>$null | Where-Object { $_ -eq 'true' }
if (-not $runnningMachine)
{
    Write-Host 'No running Podman machine found. Starting default machine...' -ForegroundColor Yellow
    podman machine start

    if ($LASTEXITCODE -ne 0)
    {
        throw "podman machine start failed. Run 'podman machine init' first if you have no machine yet."
    }
}

$imageExists = podman image exists $Tag 2>$null
$shouldBuild = $RebuildImage -or ($LASTEXITCODE -ne 0)

if ($shouldBuild)
{
    Write-Host "Building image '$Tag'..." -ForegroundColor Yellow
    podman build -t $Tag .

    if ($LASTEXITCODE -ne 0)
    {
        throw "podman build failed with exit code $LASTEXITCODE."
    }
}
else
{
    Write-Host "Using existing image '$Tag'. Use -RebuildImage to force a rebuild." -ForegroundColor DarkGray
}

# Stop and remove any existing container on the same port to avoid conflicts
$existingContainer = podman ps -q --filter "publish=$Port" 2>$null
if ($existingContainer)
{
    Write-Host "Stopping existing container on port $Port..." -ForegroundColor Yellow
    podman stop $existingContainer | Out-Null
}

Write-Host "Starting container on http://localhost:$Port ..." -ForegroundColor Cyan
podman run --rm -p "${Port}:8080" $Tag
