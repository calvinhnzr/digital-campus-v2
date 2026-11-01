# Digital Campus 2.0

An interactive 3D map of the TH Köln Campus Gummersbach in the browser. Rooms, staircases, lifts and points of interest can be searched, filtered and selected floor by floor on top of a detailed 3D model of the campus.

The application is organised in three layers:

- **Visualisation layer:** the static 3D scene with buildings, terrain, vegetation and lighting.
- **Floor plan layer:** rooms, staircases, lifts and points of interest as flat shapes per floor, extruded at runtime and rendered on top of the scene.
- **User information layer:** search, filters, floor selection and an info card for the selected room.

## Stack

- [React](https://react.dev/) and [Vite](https://vite.dev/)
- [Three.js](https://threejs.org/) with the WebGPU renderer and TSL, via [React Three Fiber](https://r3f.docs.pmnd.rs/)
- glTF/GLB models exported from [Blender](https://www.blender.org/), compressed with [Draco](https://google.github.io/draco/)
- Python tooling with GDAL and rasterio for the elevation data

## Repository layout

| Folder | Content |
|---|---|
| `frontend/` | the web application |
| `tooling/` | scripts for preparing elevation data and compressing models |

## Not included

This repository contains source code only. To run the application, the following assets are needed in addition:

- **3D models** (`*.glb`) under `frontend/public/` (campus, floor plans, terrain, vegetation, props and points of interest)
- **Textures** under `frontend/public/textures/`
- **Room data** in `frontend/src/db/db.json`, following the structure in `frontend/room-schema.json`
- **Elevation data** for the tooling under `tooling/data/dtm/` and `tooling/data/dsm/`: DGM1 and DOM1 tiles (1 km, GeoTIFF) of North Rhine-Westphalia, available as open data from [OpenGeodata.NRW](https://www.opengeodata.nrw.de/produkte/geobasis/hm/) (tiles `32_398–400_5652–5654`)

## Getting started

```bash
cd frontend
npm ci
npm run dev
```

`npm run build` creates a production build in `frontend/dist/`. An optional `VITE_PATH` in `frontend/.env` sets the base path, e.g. `VITE_PATH="/campus"`.

For the tooling, see [tooling/local-python-setup.md](tooling/local-python-setup.md):

```bash
cd tooling
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

| Script | Purpose |
|---|---|
| `geotiff_to_asc.py` | converts GeoTIFF tiles to ASCII grids with `gdal_translate` |
| `geotiff_to_png.py`, `geotiff_to_png_gdal.py` | converts GeoTIFF tiles to PNG height maps |
| `geo_cleanup.py` | compares a surface model with a median-filtered version |
| `glb_to_drc.py` | batch Draco compression of GLB/glTF files |

## Data credits

Elevation data: © Geobasis NRW, [Datenlizenz Deutschland – Zero – Version 2.0](https://www.govdata.de/dl-de/zero-2-0).

## License

The source code is released under the [MIT License](LICENSE). The license does not cover the 3D models, textures and room data listed above, which are not part of this repository.
