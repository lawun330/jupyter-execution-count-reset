# Jupyter Execution Count Reset

This project rewrites `execution_count` values in a Jupyter notebook so they are sequential and consistent. It helps when notebooks were run out of order due to trial-and-error, kernel restarts, or selective cell execution.

## Example

| Error occurs | Debugging causes inconsistent cell numbers | Change them to consistent cell numbers |
|:---:|:---:|:---:|
| <img src="img/error_img.png" width="250"> | <img src="img/error_fixed_img.png" width="250"> | <img src="img/normal_img.png" width="250"> |

## Usage

### A. CLI

**Step 0**: Prerequisites are:
- Python
- [`nbformat`](https://pypi.org/project/nbformat/)
  ```console
  pip install nbformat
  ```

**Step 1**: Download `reorder_exe_count.py` and place it in the same directory as the target notebook (or pass a full path).

**Step 2**: Run the script using one of the following methods:

  - From the command line (terminal):
    ```console
    python reorder_exe_count.py <insert-your-notebook-name>.ipynb
    ```

  - From a Jupyter notebook cell:
    ```console
    !python reorder_exe_count.py <insert-your-notebook-name>.ipynb
    ```

**Note:** This Python script is not run on the deployed website.

### B. Website (GUI)

**Step 0**: There are no prerequisites.

**Step 1**: Go to [this website][vercel-url].

**Step 2**: Select one or more notebooks.

**Step 3**: Download the fixed files individually or all at once.

**Step 4**: Fixed files use the suffix `-fixed.ipynb`.

**Note**: Processing happens entirely in the browser. Closing the tab clears everything; no data is saved on the server.

## Local Development for Website (GUI)

Prerequisites:
- [Node.js](https://nodejs.org/)

1. Install dependencies and start the dev server:
   ```console
   npm install
   npm run dev
   ```
2. Open [http://localhost:3000](http://localhost:3000) in the browser.

## Deployment for Website (GUI)

- Vercel: [vercel-url]

[vercel-url]: https://jupyter-execution-count-reset.vercel.app