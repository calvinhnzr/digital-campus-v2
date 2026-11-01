"""
npx @gltf-transform/cli draco campus.glb campus_draco.glb
npx 3d-tiles-tools b3dmToGlb -i model.b3dm -o model.glb



glb_to_drc.py
-------------
Batch-wrapper around the official Google Draco CLI tools:

  draco_transcoder  – adds Draco mesh compression to GLB/GLTF assets.
                      Output stays .glb/.gltf with geometry compressed inline.
                      (The standard glTF-compatible path; supported by three.js,
                      Babylon.js, model-viewer, etc.)

  draco_encoder     – encodes a standalone mesh to the raw .drc binary format.
                      Accepts OBJ / PLY / STL input (not GLB/GLTF directly).

This script only uses draco_transcoder, which is the correct tool when the
source is a GLB or GLTF file.

Build the Draco CLI tools
--------------------------
    git clone https://github.com/google/draco.git
    cd draco && mkdir build && cd build
    cmake .. -DDRACO_TRANSCODER_SUPPORTED=ON
    make -j$(nproc)
    # Binaries are in  draco/build/
    #   draco_transcoder
    #   draco_encoder
    #   draco_decoder

Usage
-----
    # Single file  → compressed .glb written next to the original
    python glb_to_drc.py model.glb

    # Whole directory (recursive)
    python glb_to_drc.py frontend/public/models/ --output frontend/public/models_drc/

    # Custom encoder path + quantization / compression settings
    python glb_to_drc.py model.glb \\
        --transcoder /path/to/draco_transcoder \\
        --level 10 \\
        --qp 12 --qt 10 --qn 8 --qc 8 --qg 8

draco_transcoder flags used
----------------------------
    -i   input file
    -o   output file
    -cl  compression level  0 (fastest) … 10 (smallest)  [default 7]
    -qp  position quantization bits                       [default 11]
    -qt  tex-coord quantization bits                      [default 10]
    -qn  normal quantization bits                         [default 8]
    -qc  color quantization bits                          [default 8]
    -qg  generic attribute quantization bits              [default 8]

Full flag reference: run  draco_transcoder  with no arguments.
"""

import argparse
import shutil
import subprocess
import sys
from pathlib import Path


# ---------------------------------------------------------------------------
# Locate the draco_transcoder binary
# ---------------------------------------------------------------------------

_DEFAULT_BINARY = "draco_transcoder"  # resolved from PATH by default


def _find_binary(user_path: str | None) -> str:
    """Return the path to draco_transcoder, or abort with a helpful message."""
    candidate = user_path or _DEFAULT_BINARY
    resolved = shutil.which(candidate)
    if resolved:
        return resolved
    if user_path:
        # User supplied an explicit path – check it directly
        p = Path(user_path)
        if p.is_file() and p.stat().st_mode & 0o111:
            return str(p)
    sys.exit(
        f"Could not find '{candidate}'.\n"
        "Build the Draco CLI tools and either:\n"
        "  • add the build directory to your PATH, or\n"
        "  • pass --transcoder /path/to/draco_transcoder"
    )


# ---------------------------------------------------------------------------
# Core conversion
# ---------------------------------------------------------------------------

def transcode_file(
    binary: str,
    src: Path,
    dst: Path,
    compression_level: int,
    qp: int,
    qt: int,
    qn: int,
    qc: int,
    qg: int,
) -> bool:
    """
    Call draco_transcoder on a single file.
    Returns True on success, False on failure.
    """
    cmd = [
        binary,
        "-i", str(src),
        "-o", str(dst),
        "-cl", str(compression_level),
        "-qp", str(qp),
        "-qt", str(qt),
        "-qn", str(qn),
        "-qc", str(qc),
        "-qg", str(qg),
    ]

    print(f"  {' '.join(cmd)}")

    result = subprocess.run(cmd, capture_output=True, text=True)

    if result.returncode != 0:
        print(f"  ERROR (exit {result.returncode})")
        if result.stdout:
            print(result.stdout.rstrip())
        if result.stderr:
            print(result.stderr.rstrip())
        return False

    if result.stdout:
        print(f"  {result.stdout.rstrip()}")

    src_size = src.stat().st_size
    dst_size = dst.stat().st_size
    ratio    = dst_size / src_size * 100 if src_size else 0
    print(f"  {src.name}  →  {dst.name}  "
          f"({src_size:,} B  →  {dst_size:,} B, {ratio:.1f}%)")
    return True


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def main() -> None:
    parser = argparse.ArgumentParser(
        description=(
            "Batch-compress GLB/GLTF files with Draco using the official "
            "draco_transcoder CLI tool."
        ),
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,
    )

    parser.add_argument(
        "input",
        type=Path,
        help="Path to a .glb/.gltf file, or a directory to process recursively.",
    )
    parser.add_argument(
        "--output", "-o",
        type=Path,
        default=None,
        help=(
            "Output directory. "
            "Defaults to the same directory as each input file. "
            "Compressed files are written as <stem>_draco.glb (or .gltf)."
        ),
    )
    parser.add_argument(
        "--transcoder",
        default=None,
        metavar="PATH",
        help="Explicit path to the draco_transcoder binary.",
    )

    # Draco encoding parameters
    parser.add_argument("--level", "-cl", type=int, default=7,
                        choices=range(0, 11), metavar="0-10",
                        help="Compression level (0=fastest, 10=smallest).")
    parser.add_argument("--qp", type=int, default=11, metavar="BITS",
                        help="Position quantization bits.")
    parser.add_argument("--qt", type=int, default=10, metavar="BITS",
                        help="Texture-coordinate quantization bits.")
    parser.add_argument("--qn", type=int, default=8, metavar="BITS",
                        help="Normal quantization bits.")
    parser.add_argument("--qc", type=int, default=8, metavar="BITS",
                        help="Color quantization bits.")
    parser.add_argument("--qg", type=int, default=8, metavar="BITS",
                        help="Generic attribute quantization bits.")

    args = parser.parse_args()

    binary   = _find_binary(args.transcoder)
    src_root = args.input.resolve()

    # Collect source files
    if src_root.is_dir():
        sources = (
            list(src_root.rglob("*.glb")) +
            list(src_root.rglob("*.gltf"))
        )
        if not sources:
            sys.exit(f"No .glb/.gltf files found under {src_root}")
    elif src_root.is_file():
        if src_root.suffix.lower() not in {".glb", ".gltf"}:
            sys.exit(f"Unsupported file type: {src_root.suffix}")
        sources = [src_root]
    else:
        sys.exit(f"Input path does not exist: {src_root}")

    ok_count  = 0
    err_count = 0

    for src_file in sources:
        print(f"\nProcessing  {src_file}")

        # Determine output path
        if args.output:
            if src_root.is_dir():
                rel     = src_file.relative_to(src_root)
                out_dir = (args.output / rel).parent
            else:
                out_dir = args.output
        else:
            out_dir = src_file.parent

        out_dir.mkdir(parents=True, exist_ok=True)

        out_name = f"{src_file.stem}_draco{src_file.suffix}"
        dst_file = out_dir / out_name

        success = transcode_file(
            binary=binary,
            src=src_file,
            dst=dst_file,
            compression_level=args.level,
            qp=args.qp,
            qt=args.qt,
            qn=args.qn,
            qc=args.qc,
            qg=args.qg,
        )

        if success:
            ok_count += 1
        else:
            err_count += 1

    print(f"\nDone.  {ok_count} succeeded, {err_count} failed.")


if __name__ == "__main__":
    main()
