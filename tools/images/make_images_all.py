"""Same-style cut-outs for the remaining 44 products (see make_images.py for the first four).
Internet photos: background colours are read from the image border and removed.
Shop-photo crops: cut with a soft rounded outline (the products sit among other stock)."""
import os
import numpy as np
from PIL import Image, ImageOps, ImageFilter, ImageDraw
from scipy import ndimage

HERE = os.path.dirname(os.path.abspath(__file__))
DL = os.path.join(HERE, 'dl2')
PICS = 'P:/e-commerce sites/shop_pics/'
OUT = 'P:/e-commerce sites/web/public/products'
SIZE, FIT = 800, 640
K = 3072 / 1050  # preview (1050 px wide) → original for the 3072x4096 shop photos


def border_colours(rgb, max_colours=3):
    """Dominant colours along the image border (coarsely quantised)."""
    edge = np.concatenate([rgb[0], rgb[-1], rgb[:, 0], rgb[:, -1]])
    q = (edge // 24) * 24 + 12
    colours, counts = np.unique(q, axis=0, return_counts=True)
    order = np.argsort(-counts)
    return [colours[i] for i in order[:max_colours] if counts[i] > 0.06 * len(edge)]


def remove_background(im, tol=34, extra=()):
    rgb = np.asarray(im.convert('RGB')).astype(int)
    near = np.zeros(rgb.shape[:2], bool)
    for colour in list(border_colours(rgb)) + list(extra):
        near |= np.abs(rgb - np.array(colour)).max(axis=2) < tol
    labels, _ = ndimage.label(near)
    border = set(np.unique(np.concatenate([labels[0], labels[-1], labels[:, 0], labels[:, -1]]))) - {0}
    fg = ndimage.binary_fill_holes(~np.isin(labels, list(border)))
    fg = ndimage.binary_opening(fg, iterations=2)
    # keep the big pieces only (drops specks of shadow)
    parts, n = ndimage.label(fg)
    if n > 1:
        sizes = ndimage.sum(fg, parts, range(1, n + 1))
        fg = np.isin(parts, [i + 1 for i, s in enumerate(sizes) if s > 0.02 * sizes.max()])
    out = im.convert('RGBA')
    out.putalpha(Image.fromarray((fg * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.2)))
    return out


def shop_crop(photo, box, scale=K, radius=0.08, upscale=1):
    """Crop from a shop photo with a soft rounded-rectangle outline."""
    im = ImageOps.exif_transpose(Image.open(PICS + photo)).convert('RGB')
    im = im.crop(tuple(int(v * scale) for v in box))
    if upscale > 1:
        im = im.resize((im.width * upscale, im.height * upscale), Image.LANCZOS).filter(ImageFilter.UnsharpMask(2, 60, 2))
    mask = Image.new('L', im.size, 0)
    r = int(min(im.size) * radius)
    ImageDraw.Draw(mask).rounded_rectangle((3, 3, im.width - 4, im.height - 4), r, fill=255)
    im = im.convert('RGBA')
    im.putalpha(mask.filter(ImageFilter.GaussianBlur(2)))
    return im


def stack(images, gap=30, horizontal=False):
    """Several cut-outs side by side (or one above the other) as one picture."""
    images = [i.crop(i.getchannel('A').getbbox()) for i in images]
    if horizontal:
        h = max(i.height for i in images)
        images = [i.resize((round(i.width * h / i.height), h)) for i in images]
        canvas = Image.new('RGBA', (sum(i.width for i in images) + gap * (len(images) - 1), h))
        x = 0
        for i in images:
            canvas.alpha_composite(i, (x, 0)); x += i.width + gap
    else:
        w = max(i.width for i in images)
        images = [i.resize((w, round(i.height * w / i.width))) for i in images]
        canvas = Image.new('RGBA', (w, sum(i.height for i in images) + gap * (len(images) - 1)))
        y = 0
        for i in images:
            canvas.alpha_composite(i, (0, y)); y += i.height + gap
    return canvas


def place(cutout, name):
    cutout = cutout.crop(cutout.getchannel('A').getbbox())
    scale = min(FIT / cutout.width, FIT / cutout.height)
    cutout = cutout.resize((max(1, round(cutout.width * scale)), max(1, round(cutout.height * scale))), Image.LANCZOS)
    canvas = Image.new('RGBA', (SIZE, SIZE), (0, 0, 0, 0))
    canvas.alpha_composite(cutout, ((SIZE - cutout.width) // 2, (SIZE - cutout.height) // 2))
    canvas.save(os.path.join(OUT, f'{name}.webp'), 'WEBP', quality=86, method=6)


def web(name):
    return Image.open(os.path.join(DL, name))


# ── Internet photos (shop sites) ────────────────────────────────────────────
for pid, file in [
    ('long-register-notebook', 'long-register-notebook.jpg'),
    ('short-single-line-notebook', 'short-single-line-notebook.jpg'),
    ('rough-notebook', 'rough-notebook.jpg'),
    ('brown-cover-paper', 'brown-cover-paper.jpg'),
    ('flair-woody-ball-pen', 'flair-woody-ball-pen.jpg'),
    ('nataraj-621-pencils', 'nataraj-621-pencils-b.jpg'),
    ('apsara-non-dust-eraser', 'apsara-non-dust-eraser.jpg'),
    ('nataraj-sharpener', 'nataraj-sharpener.jpg'),
    ('kangaro-stapler-no10', 'kangaro-stapler-no10.jpg'),
    ('kangaro-staple-pins-no10', 'kangaro-staple-pins-no10.jpg'),
    ('packaging-tape-2-inch', 'packaging-tape-2-inch.jpg'),
    ('cellotape-small', 'cellotape-small.jpg'),
    ('exam-writing-pad', 'exam-writing-pad.jpg'),
    ('cream-glucose-biscuits', 'cream-glucose-biscuits.jpg'),
    ('cadbury-dairy-milk', 'cadbury-dairy-milk.jpg'),
    ('cadbury-5-star', 'cadbury-5-star.jpg'),
    ('candies-toffees', 'candies-toffees.jpg'),
    ('soft-drink-glass-bottle', 'coke-pack.jpg'),
    ('soft-drink-750ml', 'soft-drink-750ml.jpg'),
    ('drinking-water-1l', 'drinking-water-1l.jpg'),
    ('heritage-buttermilk', 'heritage-buttermilk.jpg'),
    ('dish-scrub-sponge', 'dish-scrub-sponge.jpg'),
    ('clothes-pegs', 'clothes-pegs.jpg'),
    ('hair-oil', 'hair-oil.jpg'),
    ('leaf-plates', 'leaf-plates.jpg'),
]:
    place(remove_background(web(file)), pid)

# Pencil box: white lid on a white background, so a tighter tolerance.
place(remove_background(web('pbox_d.jpg'), tol=10), 'plastic-pencil-box')

# Slate: the same pink-frame double-sided slate the shop stocks (Rama is not online).
place(remove_background(web('slate_b.jpg')), 'rama-slate')

# Parle-G: hide the "45 g" corner badge first.
parle = web('parle-g-biscuits.jpg').convert('RGB')
ImageDraw.Draw(parle).rectangle((396, 396, 500, 500), fill=(255, 255, 255))
place(remove_background(parle), 'parle-g-biscuits')

# Munch / KitKat: both in one picture.
place(stack([remove_background(web('kitkat.jpg')), remove_background(web('munch.jpg'))], gap=40), 'nestle-munch-kitkat')

# ── Cut from the owner's shop photos (preview coordinates, see g_*.jpg) ─────
P7, P6 = 'IMG20260609165436.jpg', 'IMG20260609165410.jpg'
place(shop_crop(P7, (526, 672, 602, 846)), 'unomax-click-11')
place(shop_crop(P7, (514, 888, 623, 1073)), 'flair-correction-pen')
place(shop_crop(P7, (178, 921, 270, 1022)), 'win-smoothie-ball-pen')
place(shop_crop(P7, (110, 1132, 203, 1224)), 'hauser-permanent-marker')
place(shop_crop(P7, (627, 800, 879, 1035), radius=0.04), '5g-digital-india-geometry-box')
place(shop_crop(P7, (636, 1035, 858, 1153), radius=0.04), 'world-map-geometry-box')
place(shop_crop(P7, (588, 440, 690, 540)), 'pen-display-card')
place(shop_crop(P6, (170, 255, 238, 300), upscale=2), 'parle-krackjack')
place(shop_crop(P6, (40, 497, 225, 729), radius=0.05), 'colour-chart-paper')
place(shop_crop(P6, (676, 660, 900, 820), radius=0.05), 'white-chart-paper')

# Backpacks hanging at the shop front (native 1200x900 photo, so upscaled).
P3 = '1000251458.jpg'
for pid, box in [
    ('red-school-backpack', (362, 235, 458, 369)),
    ('football-black-backpack', (470, 242, 559, 369)),
    ('maroon-school-backpack', (561, 247, 652, 371)),
    ('green-kids-school-bag', (657, 261, 734, 376)),
    ('charcoal-utility-backpack', (739, 266, 823, 388)),
]:
    place(shop_crop(P3, box, scale=1, radius=0.18, upscale=4), pid)

print(len([f for f in os.listdir(OUT) if f.endswith('.webp')]), 'images in', OUT)
