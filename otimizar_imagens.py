"""
Otimiza as fotos originais para a web (redimensiona + comprime + renomeia).

Uso:
    pip install pillow
    python otimizar_imagens.py <pasta_com_originais>

Gera as imagens em assets/img/. Se quiser trocar uma foto, basta rodar de novo.
"""
import sys
from pathlib import Path
from PIL import Image, ImageOps

DESTINO = Path(__file__).parent / "assets" / "img"
LARGURA_MAX = 1400

# arquivo original  ->  nome final no site
MAPA = {
    "1000070135.jpg": "retrato.jpg",
    "1000092425.webp": "joinha.jpg",
    "1000070149.jpg": "palco.jpg",
    "1000088696.jpg": "quadra-01.jpg",
    "1000089939.jpg": "quadra-02.jpg",
    "1000089942.jpg": "quadra-03.jpg",
    "1000089943.jpg": "ataque.jpg",
    "1000093449.jpg": "camisa9.jpg",
}


def otimizar(origem: Path, destino: Path) -> None:
    img = ImageOps.exif_transpose(Image.open(origem)).convert("RGB")
    if img.width > LARGURA_MAX:
        altura = round(img.height * LARGURA_MAX / img.width)
        img = img.resize((LARGURA_MAX, altura), Image.LANCZOS)
    img.save(destino, "JPEG", quality=82, optimize=True, progressive=True)
    print(f"✔ {origem.name:<22} → {destino.name:<14} {img.width}x{img.height}")


def main() -> None:
    if len(sys.argv) < 2:
        sys.exit("Informe a pasta com as fotos originais.")
    pasta = Path(sys.argv[1])
    DESTINO.mkdir(parents=True, exist_ok=True)
    for original, novo in MAPA.items():
        arq = pasta / original
        if arq.exists():
            otimizar(arq, DESTINO / novo)
        else:
            print(f"✘ não encontrado: {original}")


if __name__ == "__main__":
    main()
