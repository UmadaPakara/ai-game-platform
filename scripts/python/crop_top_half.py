import os
from PIL import Image

def keep_top_half(input_path, output_path):
    img = Image.open(input_path).convert("RGBA")
    w, h = img.size
    
    # Crop the top half
    top_half = img.crop((0, 0, w, h // 2))
    top_half.save(output_path)
    print(f"Cropped {input_path} to keep top half.")

enemy_dir = r'c:\Users\hirom\ai-game-platform\public\characters\enemies'
files_to_crop = [
    'hobgoblin_attack_transparent.png',
    'goblin_lord_attack_transparent.png'
]

for fname in files_to_crop:
    path = os.path.join(enemy_dir, fname)
    if os.path.exists(path):
        keep_top_half(path, path)

