<#
Script helper: convert-images.ps1
- Converte imagens para WebP e gera versões em 3 larguras (400, 800, 1200)
- Requer 'magick' (ImageMagick) ou 'cwebp' no PATH.

Uso:
    powershell -ExecutionPolicy Bypass -File .\scripts\convert-images.ps1

#>

$imagesDir = Join-Path $PSScriptRoot '..\Images' | Resolve-Path
$images = Get-ChildItem -Path $imagesDir -File | Where-Object { $_.Extension -match '\.(jpg|jpeg|png|jfif)$' }

if(-not $images){ Write-Host "Nenhuma imagem encontrada em: $imagesDir"; exit }

function Has-Command($cmd){ try { $null = Get-Command $cmd -ErrorAction Stop; return $true } catch { return $false } }

$hasMagick = Has-Command 'magick'
$hasCwebp = Has-Command 'cwebp'

Write-Host "Encontradas $($images.Count) imagens. magick: $hasMagick, cwebp: $hasCwebp"

foreach($img in $images){
    $base = [System.IO.Path]::GetFileNameWithoutExtension($img.Name)
    $ext = $img.Extension.ToLower()
    $src = $img.FullName

    # gerar webp
    $webp = Join-Path $imagesDir "$base.webp"
    if($hasMagick){
        Write-Host "Gerando WebP (magick) -> $($webp)"
        & magick convert "$src" -quality 82 "$webp"
    } elseif($hasCwebp){
        Write-Host "Gerando WebP (cwebp) -> $($webp)"
        & cwebp -q 82 "$src" -o "$webp"
    } else {
        Write-Host "Nenhuma ferramenta de conversão disponível (magick/cwebp). Pulei $($img.Name)"
    }

    # gerar 3 larguras (se magick disponível)
    if($hasMagick){
        foreach($w in 400,800,1200){
            $out = Join-Path $imagesDir ("$base-$w$ext")
            Write-Host "Gerando $out"
            & magick convert "$src" -resize ${w}x "$out"
        }
    }
}

Write-Host "Concluído. Se não houver ferramentas instaladas, instale ImageMagick (https://imagemagick.org) ou cwebp (webp)."