#!/usr/bin/env bash
# Render build — must use Python 3.12 (wheels). Python 3.14 breaks pydantic-core build.
set -euo pipefail

echo "==> Python version:"
python --version

PY_MAJOR=$(python -c "import sys; print(sys.version_info.major)")
PY_MINOR=$(python -c "import sys; print(sys.version_info.minor)")

if [ "$PY_MAJOR" != "3" ] || [ "$PY_MINOR" != "12" ]; then
  echo "ERROR: Python 3.12 is required. Render is using Python ${PY_MAJOR}.${PY_MINOR}."
  echo "Fix: set PYTHON_VERSION=3.12.11 in Render dashboard AND ensure backend/runtime.txt exists."
  exit 1
fi

echo "==> Upgrading pip tooling"
python -m pip install --upgrade pip setuptools wheel

echo "==> Installing dependencies (binary wheels only for pydantic-core)"
python -m pip install --only-binary=pydantic-core -r requirements.txt

echo "==> Training ML model"
python scripts/train_model.py

echo "==> Build successful"
