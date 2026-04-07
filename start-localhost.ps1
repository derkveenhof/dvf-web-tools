param(
    [switch] $ReinstallDependencies
)

$ErrorActionPreference = 'Stop'

function Invoke-NpmCommand
{
    param(
        [Parameter(Mandatory = $true)]
        [string[]] $Arguments
    )

    & npm @Arguments

    if ($LASTEXITCODE -ne 0)
    {
        throw "npm $($Arguments -join ' ') failed with exit code $LASTEXITCODE."
    }
}

Set-Location -Path $PSScriptRoot
Write-Host 'Starting app on http://localhost:3000 ...' -ForegroundColor Cyan

if (-not (Get-Command npm -ErrorAction SilentlyContinue))
{
    throw 'npm was not found. Install Node.js first: https://nodejs.org/'
}

if (-not (Test-Path -Path 'package.json'))
{
    throw "No package.json found in $PSScriptRoot."
}

$viteBinaryPath = Join-Path -Path $PSScriptRoot -ChildPath 'node_modules/.bin/vite.cmd'
$shouldInstallDependencies = $ReinstallDependencies -or -not (Test-Path -Path 'node_modules') -or -not (Test-Path -Path $viteBinaryPath)

if ($ReinstallDependencies -and (Test-Path -Path 'node_modules'))
{
    Write-Host 'Removing existing node_modules for clean reinstall...' -ForegroundColor Yellow
    Remove-Item -Path 'node_modules' -Recurse -Force
}

if ($shouldInstallDependencies)
{
    Write-Host 'Installing dependencies (npm install)...' -ForegroundColor Yellow
    Invoke-NpmCommand -Arguments @('install')
}

Invoke-NpmCommand -Arguments @('run', 'dev')