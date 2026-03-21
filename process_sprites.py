import os
import math
from collections import deque
from PIL import Image

input_path = r'C:\Users\hirom\.gemini\antigravity\brain\e077cd53-03b0-4dbd-88c5-abd61c7c099e\media__1774095149779.png'
base_output_dir = r'C:\Users\hirom\Desktop\布団ちゃん'
frames_dir = os.path.join(base_output_dir, 'final_sprites_separated')
os.makedirs(frames_dir, exist_ok=True)

img = Image.open(input_path).convert("RGBA")
width, height = img.size

# 1. Background Removal
target_r, target_g, target_b = 138, 202, 239
threshold = 50
datas = img.load()
for y in range(height):
    for x in range(width):
        r, g, b, a = datas[x, y]
        dist = math.sqrt((r - target_r)**2 + (g - target_g)**2 + (b - target_b)**2)
        if dist < threshold:
            datas[x, y] = (0, 0, 0, 0)

# 2. Connected Component Labeling (Blob Detection)
visited = set()
blobs = []

for y in range(0, height, 5): # Step to speed up initial search
    for x in range(0, width, 5):
        if (x, y) not in visited and datas[x, y][3] > 0:
            # Start BFS for a new blob
            blob_pixels = []
            queue = deque([(x, y)])
            visited.add((x, y))
            
            while queue:
                curr_x, curr_y = queue.popleft()
                blob_pixels.append((curr_x, curr_y))
                
                # Check 8-neighbors
                for dx in [-1, 0, 1]:
                    for dy in [-1, 0, 1]:
                        nx, ny = curr_x + dx, curr_y + dy
                        if 0 <= nx < width and 0 <= ny < height:
                            if (nx, ny) not in visited and datas[nx, ny][3] > 0:
                                visited.add((nx, ny))
                                queue.append((nx, ny))
            
            # Keep blobs that are substantial (prevent noise)
            if len(blob_pixels) > 500:
                blobs.append(blob_pixels)

print(f"Detected {len(blobs)} blobs.")

# 3. Sort blobs by Grid Order (Row then Col)
# Find average Y for each blob to group by row
blob_centers = []
for b in blobs:
    sum_x = sum(p[0] for p in b)
    sum_y = sum(p[1] for p in b)
    blob_centers.append((sum_x / len(b), sum_y / len(b), b))

# Sort by Y first
blob_centers.sort(key=lambda x: x[1])

# Now group into rows (assuming 4 rows)
sorted_blobs = []
for i in range(0, len(blob_centers), 3):
    row = blob_centers[i:i+3]
    # Sort row by X
    row.sort(key=lambda x: x[0])
    sorted_blobs.extend(row)

# 4. Standardize and Align
standard_w, standard_h = 300, 300
pivot_x, pivot_y = 150, 280
aligned_frames = []

for i, (cx, cy, b_pixels) in enumerate(sorted_blobs):
    # Find bounding box for this blob
    min_x = min(p[0] for p in b_pixels)
    max_x = max(p[0] for p in b_pixels)
    min_y = min(p[1] for p in b_pixels)
    max_y = max(p[1] for p in b_pixels)
    
    char_w = max_x - min_x + 1
    char_h = max_y - min_y + 1
    
    # Create char image
    char_img = Image.new("RGBA", (char_w, char_h), (0,0,0,0))
    char_pixels = char_img.load()
    for px, py in b_pixels:
        char_pixels[px - min_x, py - min_y] = datas[px, py]
        
    # Standard Canvas
    final_frame = Image.new("RGBA", (standard_w, standard_h), (0,0,0,0))
    paste_x = pivot_x - (char_w // 2)
    paste_y = pivot_y - char_h
    
    final_frame.paste(char_img, (paste_x, paste_y), char_img)
    aligned_frames.append(final_frame)
    
    final_frame.save(os.path.join(frames_dir, f'futon_frame_{i:02d}.png'))

# 5. Output
total_frames = len(aligned_frames)
if total_frames > 0:
    spritesheet_w = standard_w * total_frames
    horizontal_strip = Image.new("RGBA", (spritesheet_w, standard_h), (0,0,0,0))
    for i, frame in enumerate(aligned_frames):
        horizontal_strip.paste(frame, (i * standard_w, 0))
    horizontal_strip.save(os.path.join(base_output_dir, 'futon_spritesheet_horizontal.png'))
    
    gif_path = os.path.join(base_output_dir, 'futon_animation_v2_smooth.gif')
    aligned_frames[0].save(
        gif_path, save_all=True, append_images=aligned_images[1:] if 'aligned_images' in locals() else aligned_frames[1:], 
        duration=80, loop=0, disposal=2, transparency=0
    )
    print("Done. Professional reconstruction finished.")
else:
    print("No blobs detected!")
