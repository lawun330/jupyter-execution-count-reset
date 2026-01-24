"""
Utility script to rewrite all execution counts in a Jupyter notebook.

Example:
    [1]: ...
    [4]: ...
    
    will become
    
    [1]: ...
    [2]: ...

Usage:
- python reorder_exe_count.py <notebook-name>.ipynb   (from a command line)
- !python reorder_exe_count.py <notebook-name>.ipynb  (from a Jupyter cell)
"""


import nbformat
import sys
from pathlib import Path


def rewrite_execution_count(notebook_path: Path):
    """Rewrite execution_count values sequentially for all code cells."""
    nb = nbformat.read(notebook_path, as_version=4)

    count = 1
    for cell in nb.cells:
        if cell.cell_type == "code":
            cell.execution_count = count
            count += 1

    nbformat.write(nb, notebook_path)


def main():
    """Parse arguments, validate the notebook path, and rewrite execution counts."""
    if len(sys.argv) != 2:
        print("Usage: python rewrite_exec_count.py <notebook.ipynb>")
        sys.exit(1)

    notebook_path = Path(sys.argv[1])

    if not notebook_path.exists():
        print(f"File not found: {notebook_path}")
        sys.exit(1)

    rewrite_execution_count(notebook_path)
    print("execution_count rewritten successfully.")


if __name__ == "__main__":
    main()