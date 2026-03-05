import os
from PIL import Image


def process_images_proportional(input_folder, output_folder, target_width=1920, quality=85):
    if not os.path.exists(output_folder):
        os.makedirs(output_folder)

    for filename in os.listdir(input_folder):
        if filename.lower().endswith(".png"):
            img_path = os.path.join(input_folder, filename)

            with Image.open(img_path) as img:
                # 1. Convert to RGB (remove transparency for JPEG)
                if img.mode in ("RGBA", "P"):
                    img = img.convert("RGB")

                # 2. Calculate aspect ratio to maintain proportions
                w_percent = (target_width / float(img.size[0]))
                h_size = int((float(img.size[1]) * float(w_percent)))

                # 3. Resize with LANCZOS
                img_resized = img.resize(
                    (target_width, h_size), Image.Resampling.LANCZOS)

                # 4. Save as JPEG
                new_filename = os.path.splitext(filename)[0] + ".jpg"
                save_path = os.path.join(output_folder, new_filename)

                img_resized.save(save_path, "JPEG",
                                 quality=quality, optimize=True)

            print(
                f"Processed: {filename} -> {new_filename} ({target_width}x{h_size})")


# Configuration
input_dir = './raw_img'
output_dir = './docs/img'

process_images_proportional(input_dir, output_dir)
