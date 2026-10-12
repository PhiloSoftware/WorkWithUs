param([ValidateSet('preview', 'productive')][string]$Profile = 'productive')
$ErrorActionPreference = 'Stop'
$repoRoot = Split-Path -Parent $PSScriptRoot
$distRoot = [IO.Path]::GetFullPath((Join-Path $repoRoot "dist/$Profile"))
$providerNames = Get-ChildItem -LiteralPath (Join-Path $repoRoot 'providers') -Directory
foreach ($provider in $providerNames) {
    $providerRoot = Join-Path $distRoot $provider.Name
    $record = Get-Content -LiteralPath (Join-Path $providerRoot 'build-record.json') -Raw | ConvertFrom-Json
    $sourceRoot = [IO.Path]::GetFullPath((Join-Path $providerRoot 'work-with-philo'))
    if (-not $sourceRoot.StartsWith($distRoot + [IO.Path]::DirectorySeparatorChar, [StringComparison]::OrdinalIgnoreCase)) { throw 'Package escaped dist directory.' }
    for ($ancestor = Get-Item -LiteralPath $sourceRoot; $null -ne $ancestor; $ancestor = $ancestor.Parent) {
        if ($ancestor.Attributes -band [IO.FileAttributes]::ReparsePoint) { throw "Linked package directory: $($ancestor.FullName)" }
    }
    $files = @(Get-ChildItem -LiteralPath $sourceRoot -Recurse -Force -File)
    $links = @(Get-ChildItem -LiteralPath $sourceRoot -Recurse -Force | Where-Object { $_.Attributes -band [IO.FileAttributes]::ReparsePoint })
    if ($links.Count) { throw 'Package contains linked files or directories.' }
    if ($files.Count -ne $record.files.Count) { throw 'Package file count differs from build record. Rebuild before packaging.' }
    foreach ($file in $files) {
        $relative = [IO.Path]::GetRelativePath($sourceRoot, $file.FullName).Replace('\', '/')
        $expected = @($record.files | Where-Object path -CEQ $relative)
        if ($expected.Count -ne 1 -or (Get-FileHash -LiteralPath $file.FullName -Algorithm SHA256).Hash -ine $expected[0].sha256) { throw "Package content differs from build record: $relative" }
    }
    $destination = Join-Path $distRoot "work-with-philo-$($provider.Name)-$($record.version)-$Profile.zip"
    if (Test-Path -LiteralPath $destination) {
        if ((Get-Item -LiteralPath $destination).Attributes -band [IO.FileAttributes]::ReparsePoint) { throw 'Archive is a linked path.' }
        Remove-Item -LiteralPath $destination
    }
    [IO.Compression.ZipFile]::CreateFromDirectory($sourceRoot, $destination)
    $archive = [IO.Compression.ZipFile]::OpenRead($destination)
    try {
        if ($archive.Entries.Count -ne $record.files.Count) { throw 'Archive file count mismatch.' }
        $expectedManifest = if ($provider.Name -eq 'claude') { '.claude-plugin/plugin.json' } else { 'plugin.json' }
        if (-not ($archive.Entries.FullName -contains $expectedManifest)) { throw 'Archive is missing its provider manifest.' }
    } finally { $archive.Dispose() }
    Write-Output $destination
}
