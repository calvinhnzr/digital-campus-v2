import os
import subprocess

input_dir = "data/dsm"
output_dir = "output/png_gdal"

if not os.path.exists(output_dir):
    os.makedirs(output_dir)

for filename in os.listdir(input_dir):
    if filename.endswith(".tif"):
        input_file = os.path.join(input_dir, filename)
        output_file = os.path.join(output_dir, filename.replace(".tif", ".png"))

        command = [
            "gdal_translate",
            "-of", "PNG",
            input_file,
            output_file
        ]

        try:
            subprocess.run(command, check=True, capture_output=True)
            print(f"Converted {input_file} to {output_file}")
        except subprocess.CalledProcessError as e:
            print(f"Error converting {input_file}: {e}")
            print(e.stderr.decode("utf-8"))