#!/usr/bin/env bash
# Render build script (optional — render.yaml buildCommand is primary)
set -euo pipefail

echo "==> Installing dependencies"
pip install --upgrade pip
pip install -r requirements.txt

echo "==> Training ML model"
python scripts/train_model.py

echo "==> Build complete"
