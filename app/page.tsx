"use client";

import { useEffect, useRef, useState } from "react";
import { rewriteExecutionCount } from "@/lib/rewriteExecutionCount";

type FixedNotebook = {
  id: string;
  downloadName: string;
  url: string;
};

function fixedFileName(originalName: string): string {
  const stem = originalName.replace(/\.ipynb$/i, "");
  return `${stem}-fixed.ipynb`;
}

function triggerDownload(nb: FixedNotebook) {
  const a = document.createElement("a");
  a.href = nb.url;
  a.download = nb.downloadName;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

export default function Home() {
  const [error, setError] = useState<string | null>(null);
  const [notebooks, setNotebooks] = useState<FixedNotebook[]>([]);
  const [downloadedIds, setDownloadedIds] = useState<Set<string>>(() => new Set());
  const [downloadAllUsed, setDownloadAllUsed] = useState(false);
  const notebooksRef = useRef(notebooks);
  notebooksRef.current = notebooks;

  useEffect(() => {
    return () => {
      for (const nb of notebooksRef.current) URL.revokeObjectURL(nb.url);
    };
  }, []);

  function markDownloaded(id: string) {
    setDownloadedIds((prev) => new Set(prev).add(id));
  }

  function onSingleDownload(nb: FixedNotebook) {
    triggerDownload(nb);
    markDownloaded(nb.id);
  }

  function onDownloadAll() {
    notebooks.forEach((nb, i) => {
      setTimeout(() => triggerDownload(nb), i * 250);
    });
    setDownloadedIds(new Set(notebooks.map((nb) => nb.id)));
    setDownloadAllUsed(true);
  }

  async function onFiles(fileList: FileList | null, input: HTMLInputElement) {
    setError(null);
    if (!fileList?.length) return;

    const added: FixedNotebook[] = [];
    const errors: string[] = [];
    for (const file of Array.from(fileList)) {
      if (!file.name.toLowerCase().endsWith(".ipynb")) {
        errors.push(`${file.name}: not a .ipynb file`);
        continue;
      }

      try {
        const nb = JSON.parse(await file.text());
        const fixed = rewriteExecutionCount(nb);
        const blob = new Blob([JSON.stringify(fixed, null, 1)], {
          type: "application/json",
        });
        const downloadName = fixedFileName(file.name);
        added.push({
          id: crypto.randomUUID(),
          downloadName,
          url: URL.createObjectURL(blob),
        });
      } catch {
        errors.push(`${file.name}: invalid notebook JSON`);
      }
    }

    if (added.length) {
      setNotebooks((prev) => [...prev, ...added]);
    }
    if (errors.length) {
      setError(errors.join(" "));
    }

    input.value = "";
  }

  function buttonLabel(downloaded: boolean, name: string) {
    return `${downloaded ? "Redownload" : "Download"} ${name}`;
  }

  return (
    <main className="main">
      <h1 className="title">Jupyter Execution Count Reset</h1>
      <p className="description">Upload one or more Jupyter notebooks.</p>

      <label className="upload-label">
        <input
          className="upload-input"
          type="file"
          accept=".ipynb"
          multiple
          onChange={(e) => onFiles(e.target.files, e.target)}
        />
        Choose .ipynb file(s)
      </label>

      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}

      {notebooks.length > 0 && (
        <div className="download-actions">
          <div className="download-all-wrap">
            <button
              type="button"
              className="download-btn download-btn--all"
              onClick={onDownloadAll}
            >
              {downloadAllUsed ? "Redownload all" : "Download all"}
            </button>
          </div>

          <ul className="download-list">
            {notebooks.map((nb) => (
              <li key={nb.id} className="download-item">
                <button
                  type="button"
                  className="download-btn"
                  onClick={() => onSingleDownload(nb)}
                >
                  {buttonLabel(downloadedIds.has(nb.id), nb.downloadName)}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </main>
  );
}