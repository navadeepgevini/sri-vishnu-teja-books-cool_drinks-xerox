"""Turns raw product photos into same-style cut-outs: transparent background, product centred,
fitted inside the same box, 800x800 WebP. Output: web/public/products/<product-id>.webp"""
import os
import numpy as np
from PIL import Image, ImageOps, ImageFilter, ImageDraw
from scipy import ndimage

SCRATCH = os.path.dirname(os.path.abspath(__file__))
PICS = r'P:\e-commerce sites\shop_pics'
OUT = r'P:\e-commerce sites\web\public\products'
os.makedirs(OUT, exist_ok=True)
SIZE, FIT = 800, 640  # canvas and the box every product is fitted into


def remove_flat_background(im, bg_colours, tol=28):
    """Background = pixels close to a background colour AND connected to the image border."""
    rgb = np.asarray(im.convert('RGB')).astype(int)
    near = np.zeros(rgb.shape[:2], bool)
    for colour in bg_colours:
        near |= np.abs(rgb - np.array(colour)).max(axis=2) < tol
    labels, _ = ndimage.label(near)
    border = set(np.unique(np.concatenate([labels[0], labels[-1], labels[:, 0], labels[:, -1]]))) - {0}
    bg = np.isin(labels, list(border))
    fg = ndimage.binary_fill_holes(~bg)
    fg = ndimage.binary_opening(fg, iterations=2)
    alpha = Image.fromarray((fg * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.2))
    out = im.convert('RGBA')
    out.putalpha(alpha)
    return out


def perspective(im, corners, width, height):
    """Warps the quadrilateral `corners` (TL, TR, BR, BL) to a flat width x height image."""
    dst = [(0, 0), (width, 0), (width, height), (0, height)]
    rows = []
    for (x, y), (u, v) in zip(corners, dst):
        rows.append([u, v, 1, 0, 0, 0, -x * u, -x * v])
        rows.append([0, 0, 0, u, v, 1, -y * u, -y * v])
    coeffs = np.linalg.solve(np.array(rows, float), np.array([c for p in corners for c in p], float))
    return im.transform((width, height), Image.PERSPECTIVE, coeffs, Image.BICUBIC)


def polygon_cutout(im, points, feather=2):
    mask = Image.new('L', im.size, 0)
    ImageDraw.Draw(mask).polygon(points, fill=255)
    out = im.convert('RGBA')
    out.putalpha(mask.filter(ImageFilter.GaussianBlur(feather)))
    return out


def place(cutout, name):
    """Trim to the product, fit it in the FIT box, centre it on a transparent SIZE canvas."""
    cutout = cutout.crop(cutout.getchannel('A').getbbox())
    scale = min(FIT / cutout.width, FIT / cutout.height)
    cutout = cutout.resize((round(cutout.width * scale), round(cutout.height * scale)), Image.LANCZOS)
    canvas = Image.new('RGBA', (SIZE, SIZE), (0, 0, 0, 0))
    canvas.alpha_composite(cutout, ((SIZE - cutout.width) // 2, (SIZE - cutout.height) // 2))
    path = os.path.join(OUT, f'{name}.webp')
    canvas.save(path, 'WEBP', quality=86, method=6)
    print(name, cutout.size, os.path.getsize(path) // 1024, 'KB')


# 1. Apsara Platinum: shop-site photo, two flat background colours.
apsara = Image.open(os.path.join(SCRATCH, 'dl', 'apsara_2.jpg'))
place(remove_flat_background(apsara, [(212, 214, 196), (244, 239, 238)]), 'apsara-platinum-pencils')

# 2. Flair Hotline: shop-site photo on white.
flair = Image.open(os.path.join(SCRATCH, 'dl', 'flair_851642.jpg'))
place(remove_flat_background(flair, [(255, 255, 255)], tol=18), 'flair-hotline-gel-pen')

# 3. Tejaswini long notebook: cut from the shop photo and flattened (front cover of the right-hand stack).
shelf = ImageOps.exif_transpose(Image.open(os.path.join(PICS, 'IMG20260613142324.jpg')))
ox, oy = 1316, 3160  # where crop_notebook.jpg starts in the original photo
cover_corners = [(ox + 556, oy + 246), (ox + 843, oy + 268), (ox + 878, oy + 666), (ox + 484, oy + 640)]
cover = perspective(shelf, cover_corners, 520, 680)
book = Image.new('RGBA', (520 + 14, 680 + 18), (0, 0, 0, 0))
pages = ImageDraw.Draw(book)
pages.rounded_rectangle((10, 12, 533, 697), 6, fill=(236, 234, 228, 255))  # page block behind the cover
for y in range(684, 696, 3):
    pages.line((14, y, 530, y), fill=(214, 211, 204, 255))
book.alpha_composite(cover.convert('RGBA'), (0, 0))
place(book, 'long-single-line-notebook')

# 4. Blue school backpack: cut from the shop-front photo (small in the photo, so it is upscaled).
front = Image.open(os.path.join(PICS, '1000251458.jpg')).crop((265, 230, 375, 365))
front = front.resize((front.width * 4, front.height * 4), Image.LANCZOS).filter(ImageFilter.UnsharpMask(2, 60, 2))
outline = [(68, 80), (115, 60), (200, 52), (300, 52), (352, 60), (384, 90), (386, 440), (374, 488),
           (330, 496), (80, 496), (54, 478), (50, 112)]
place(polygon_cutout(front, outline), 'blue-school-backpack')
