import os
from PIL import Image

"""
スプライト画像を加工し、アニメーション（GIF）や個別のフレームを生成するスクリプトです。
ゲームで使用する敵キャラ画像の一括編集を自動化します。
"""

def process_and_animate(input_filename, enemy_name, enemy_dir, desktop_dir):
    input_path = os.path.join(enemy_dir, input_filename)
    if not os.path.exists(input_path):
        print(f"File not found: {input_path}")
        return

    # 背景透過済みの画像を読み込み
    img = Image.open(input_path).convert("RGBA")
    width, height = img.size
    
    # 2フレーム構成（左右に並んでいると想定）
    frame_w = width // 2
    
    # フレーム保存用ディレクトリ（プロジェクト内とデスクトップの両方に出力）
    frames_proj_dir = os.path.join(enemy_dir, f"{enemy_name}_attack_frames")
    frames_desk_dir = os.path.join(desktop_dir, f"{enemy_name}_attack_frames")
    os.makedirs(frames_proj_dir, exist_ok=True)
    os.makedirs(frames_desk_dir, exist_ok=True)
    
    frames = []
    
    # 画像を分割して保存
    for i in range(2):
        frame = img.crop((i * frame_w, 0, (i + 1) * frame_w, height))
        frames.append(frame)
        
        # 個別フレームとして保存
        frame.save(os.path.join(frames_proj_dir, f'frame_{i}.png'))
        frame.save(os.path.join(frames_desk_dir, f'frame_{i}.png'))
        
    # アニメーションGIFの生成
    gif_name = f"{enemy_name}_attack.gif"
    proj_gif = os.path.join(enemy_dir, gif_name)
    desk_gif = os.path.join(desktop_dir, gif_name)
    
    if frames:
        # プロジェクトフォルダへ出力
        frames[0].save(
            proj_gif,
            save_all=True,
            append_images=frames[1:],
            duration=200, # フレームあたりの再生時間（ミリ秒）
            loop=0,
            disposal=2
        )
        # デスクトップフォルダへも同期出力
        frames[0].save(
            desk_gif,
            save_all=True,
            append_images=frames[1:],
            duration=200,
            loop=0,
            disposal=2
        )
        print(f"Successfully processed, split, and animated: {enemy_name}")

# パス設定（環境に合わせて調整）
enemy_dir = r'c:\Users\hirom\ai-game-platform\public\characters\enemies'
desktop_dir = r'C:\Users\hirom\Desktop\布団ちゃん'

# 処理対象のファイルリスト
enemies_to_process = [
    ('goblin_attack_transparent.png', 'goblin'),
    ('hobgoblin_attack_transparent.png', 'hobgoblin'),
    ('goblin_lord_attack_transparent.png', 'goblin_lord')
]

for filename, ename in enemies_to_process:
    process_and_animate(filename, ename, enemy_dir, desktop_dir)
