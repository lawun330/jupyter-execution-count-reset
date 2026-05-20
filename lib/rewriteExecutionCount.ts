export type Notebook = {
  cells: Array<{
    cell_type: string;
    execution_count?: number | null;
    outputs?: Array<{ execution_count?: number | null }>;
  }>;
};

export function rewriteExecutionCount(nb: Notebook): Notebook {
  let count = 1;
  for (const cell of nb.cells) {
    if (cell.cell_type !== "code") continue;
    cell.execution_count = count;
    for (const output of cell.outputs ?? []) {
      if ("execution_count" in output) {
        output.execution_count = count;
      }
    }
    count += 1;
  }
  return nb;
}