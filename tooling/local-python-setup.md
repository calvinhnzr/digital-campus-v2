

1. Navigate to your tooling folder:

```bash
cd /tooling
```
2. Create a virtual environment (named .venv):
```bash
python3 -m venv .venv
```

3. Activate the virtual environment:
```bash
# For macOS/Linux
source .venv/bin/activate
```

```bash
# For Windows
.venv\Scripts\activate
```

4. Install your packages (e.g., rasterio, numpy, matplotlib, scipy):
```bash
pip install rasterio numpy matplotlib scipy
```

5. Run your scripts as usual (while the venv is activated):
```bash
python geotiff_to_png.py
```
6. Deactivate the environment when done:
```bash
deactivate
```

7. You can add a requirements.txt file in your tooling folder to track dependencies:
```bash
pip install -r requirements.txt
```