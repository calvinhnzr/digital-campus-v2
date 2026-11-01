import os
import rasterio
import numpy as np
from rasterio.enums import Resampling

input_dir = "data/dsm"
output_dir = "output/png"

if not os.path.exists(output_dir):
    os.makedirs(output_dir)

for filename in os.listdir(input_dir):
    if filename.endswith(".tif"):
        input_file = os.path.join(input_dir, filename)
        output_file = os.path.join(output_dir, filename.replace(".tif", ".png"))

        with rasterio.open(input_file) as src:
            data = src.read(
                out_shape=(src.count, src.height, src.width),
                resampling=Resampling.bilinear
            )

            # Normalize to 0-255 and convert to uint8
            data_min = np.nanmin(data)
            data_max = np.nanmax(data)
            if data_max > data_min:
                data_norm = (data - data_min) / (data_max - data_min)
            else:
                data_norm = np.zeros_like(data)
            data_uint8 = (255 * data_norm).astype(np.uint8)

        with rasterio.open(
            output_file,
            'w',
            driver='PNG',
            height=data.shape[1],
            width=data.shape[2],
            count=src.count,
            dtype='uint8'
        ) as dst:
            dst.write(data_uint8)
        print(f"Converted {input_file} to {output_file}")