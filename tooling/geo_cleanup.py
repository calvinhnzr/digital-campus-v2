import rasterio
import numpy as np
from scipy.ndimage import median_filter
import matplotlib.pyplot as plt

# Load the DSM GeoTIFF
input_path = "/tooling/data/dom1_kacheln/dom1_32_398_5652_1_nw_2021.tif"
with rasterio.open(input_path) as src:
    dsm = src.read(1)
    profile = src.profile

# Apply a median filter to remove high-frequency features like trees and buildings
# The size can be tuned based on resolution and structure size (e.g., 7x7 window)
dtm = median_filter(dsm, size=7)

# Visual comparison of DSM vs cleaned DTM
fig, ax = plt.subplots(1, 2, figsize=(14, 6))
ax[0].imshow(dsm, cmap='terrain')
ax[0].set_title('Original DSM')
ax[0].axis('off')

ax[1].imshow(dtm, cmap='terrain')
ax[1].set_title('Filtered DTM (Median Filter)')
ax[1].axis('off')

plt.tight_layout()
plt.show()
