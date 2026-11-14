#!/usr/bin/env python3
"""توليد أيقونات مشغل أندرويد بكل الكثافات من أيقونة الويب 512px"""
from PIL import Image, ImageDraw
import os

SRC = "/home/z/my-project/public/icons/icon-512.png"
RES = "/home/z/my-project/android/app/src/main/res"

src = Image.open(SRC).convert("RGBA")

# قص مربع مركزي
s = min(src.size)
left = (src.width - s) // 2
top = (src.height - s) // 2
src = src.crop((left, top, left + s, top + s))

# 1) أيقونات قديمة (legacy): مربعة بحواف دائرية خفيفة
legacy = {48: "mdpi", 72: "hdpi", 96: "xhdpi", 144: "xxhdpi", 192: "xxxhdpi"}
for px, dpi in legacy.items():
    img = src.resize((px, px), Image.LANCZOS).convert("RGBA")
    # زوايا دائرية
    radius = int(px * 0.18)
    mask = Image.new("L", (px, px), 0)
    d = ImageDraw.Draw(mask)
    d.rounded_rectangle([0, 0, px, px], radius=radius, fill=255)
    out = Image.new("RGBA", (px, px), (0, 0, 0, 0))
    out.paste(img, (0, 0), mask)
    out.save(f"{RES}/mipmap-{dpi}/ic_launcher.png")

# 2) أيقونة دائرية legacy
for px, dpi in legacy.items():
    img = src.resize((px, px), Image.LANCZOS).convert("RGBA")
    mask = Image.new("L", (px, px), 0)
    d = ImageDraw.Draw(mask)
    d.ellipse([0, 0, px, px], fill=255)
    out = Image.new("RGBA", (px, px), (0, 0, 0, 0))
    out.paste(img, (0, 0), mask)
    out.save(f"{RES}/mipmap-{dpi}/ic_launcher_round.png")

# 3) طبقة الـ foreground للأيقونة التكيفية (المحتوى داخل 66% من المساحة الآمنة)
fg_sizes = {108: "mdpi", 162: "hdpi", 216: "xhdpi", 324: "xxhdpi", 432: "xxxhdpi"}
for px, dpi in fg_sizes.items():
    canvas = Image.new("RGBA", (px, px), (0, 0, 0, 0))
    inner = int(px * 0.62)
    icon = src.resize((inner, inner), Image.LANCZOS)
    off = (px - inner) // 2
    canvas.paste(icon, (off, off), icon)
    canvas.save(f"{RES}/mipmap-{dpi}/ic_launcher_foreground.png")

print("icons generated OK")
for dpi in ["mdpi", "hdpi", "xhdpi", "xxhdpi", "xxxhdpi"]:
    files = sorted(os.listdir(f"{RES}/mipmap-{dpi}"))
    print(dpi, files)
