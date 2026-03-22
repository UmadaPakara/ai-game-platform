import os
from PIL import Image

def process_and_animate(input_filename, enemy_name, enemy_dir, desktop_dir):
    input_path = os.path.join(enemy_dir, input_filename)
    if not os.path.exists(input_path):
        print(f"File not found: {input_path}")
        return

    # Load the already transparent image
    img = Image.open(input_path).convert("RGBA")
    width, height = img.size
    
    # 2 frames
    frame_w = width // 2
    
    # Directories for frames
    frames_proj_dir = os.path.join(enemy_dir, f"{enemy_name}_attack_frames")
    frames_desk_dir = os.path.join(desktop_dir, f"{enemy_name}_attack_frames")
    os.makedirs(frames_proj_dir, exist_ok=True)
    os.makedirs(frames_desk_dir, exist_ok=True)
    
    frames = []
    
    for i in range(2):
        frame = img.crop((i * frame_w, 0, (i + 1) * frame_w, height))
        frames.append(frame)
        
        # Save frame to project
        frame.save(os.path.join(frames_proj_dir, f'frame_{i}.png'))
        # Save frame to desktop
        frame.save(os.path.join(frames_desk_dir, f'frame_{i}.png'))
        
    # Generate GIF
    gif_name = f"{enemy_name}_attack.gif"
    proj_gif = os.path.join(enemy_dir, gif_name)
    desk_gif = os.path.join(desktop_dir, gif_name)
    
    if frames:
        frames[0].save(
            proj_gif,
            save_all=True,
            append_images=frames[1:],
            duration=200, # 200ms per frame to clearly see the attack
            loop=0,
            disposal=2
        )
        frames[0].save(
            desk_gif,
            save_all=True,
            append_images=frames[1:],
            duration=200,
            loop=0,
            disposal=2
        )
        print(f"Successfully processed, split, and animated: {enemy_name}")

enemy_dir = r'c:\Users\hirom\ai-game-platform\public\characters\enemies'
desktop_dir = r'C:\Users\hirom\Desktop\布団ちゃん'

enemies_to_process = [
    ('goblin_attack_transparent.png', 'goblin'),
    ('hobgoblin_attack_transparent.png', 'hobgoblin'),
    ('goblin_lord_attack_transparent.png', 'goblin_lord')
]

for filename, ename in enemies_to_process:
    process_and_animate(filename, ename, enemy_dir, desktop_dir)
