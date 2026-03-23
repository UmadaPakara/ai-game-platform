import os
from PIL import Image
from collections import deque

def remove_small_blobs(img_path, output_path, min_blob_area=1000):
    img = Image.open(img_path).convert("RGBA")
    width, height = img.size
    datas = img.load()
    
    visited = set()
    blobs = []
    
    # 1. Find blobs
    for y in range(height):
        for x in range(width):
            if (x, y) not in visited and datas[x, y][3] > 0:
                blob_pixels = []
                queue = deque([(x, y)])
                visited.add((x, y))
                
                while queue:
                    curr_x, curr_y = queue.popleft()
                    blob_pixels.append((curr_x, curr_y))
                    
                    for dx in [-1, 0, 1]:
                        for dy in [-1, 0, 1]:
                            if dx == 0 and dy == 0: continue
                            nx, ny = curr_x + dx, curr_y + dy
                            if 0 <= nx < width and 0 <= ny < height:
                                if (nx, ny) not in visited and datas[nx, ny][3] > 0:
                                    visited.add((nx, ny))
                                    queue.append((nx, ny))
                
                blobs.append(blob_pixels)

    print(f"File: {os.path.basename(img_path)}")
    print(f"Total blobs: {len(blobs)}")
    
    # 2. Erase small blobs
    removed_count = 0
    for b in blobs:
        if len(b) < min_blob_area:
            removed_count += 1
            for px, py in b:
                datas[px, py] = (0, 0, 0, 0)
                
    print(f"Removed {removed_count} small blobs (likely text/noise).")
    
    img.save(output_path)

files = [
    r'c:\Users\hirom\ai-game-platform\public\characters\enemies\goblin_attack_transparent.png',
    r'c:\Users\hirom\ai-game-platform\public\characters\enemies\hobgoblin_attack_transparent.png',
    r'c:\Users\hirom\ai-game-platform\public\characters\enemies\goblin_lord_attack_transparent.png'
]

for f in files:
    remove_small_blobs(f, f, min_blob_area=3000)
    
