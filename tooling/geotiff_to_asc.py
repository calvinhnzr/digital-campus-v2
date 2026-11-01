import os
import subprocess

# Define the input and output directories
input_dir = "data/dsm"
output_dir = "output/asc"

# Create the output directory if it doesn't exist
if not os.path.exists(output_dir):
    os.makedirs(output_dir)

# Loop through each file in the input directory
for filename in os.listdir(input_dir):
    if filename.endswith(".tif"):
        # Create the full file paths
        input_file = os.path.join(input_dir, filename)
        output_file = os.path.join(output_dir, filename.replace(".tif", ".asc"))

        # Construct the gdal_translate command
        command = [
            "gdal_translate",
            "-of",
            "AAIGrid",
            input_file,
            output_file
        ]

        # Execute the command
        try:
            subprocess.run(command, check=True, capture_output=True)
            print(f"Successfully converted {input_file} to {output_file}")
        except subprocess.CalledProcessError as e:
            print(f"Error converting {input_file}: {e}")
            print(e.stderr.decode("utf-8"))