"use client";

import { useEffect, useRef, useState } from "react";
import { rewriteExecutionCount } from "@/lib/rewriteExecutionCount";
import { authorHandle, githubRepoUrl } from "@/lib/site";

type FixedNotebook = {
  id: string;
  sourceName: string;
  downloadName: string;
  url: string;
};

function fixedFileName(originalName: string): string {
  const stem = originalName.replace(/\.ipynb$/i, "");
  return `${stem}-fixed.ipynb`;
}

function sourceKey(name: string): string {
  return name.toLowerCase();
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
  const activeSourceNamesRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    activeSourceNamesRef.current = new Set(
      notebooks.map((nb) => sourceKey(nb.sourceName)),
    );
  }, [notebooks]);

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

  function removeNotebook(id: string) {
    setNotebooks((prev) => {
      const removed = prev.find((nb) => nb.id === id);
      if (removed) {
        URL.revokeObjectURL(removed.url);
        activeSourceNamesRef.current.delete(sourceKey(removed.sourceName));
      }
      return prev.filter((nb) => nb.id !== id);
    });
    setDownloadedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    setDownloadAllUsed(false);
  }

  async function onFiles(fileList: FileList | null, input: HTMLInputElement) {
    setError(null);
    if (!fileList?.length) return;

    const added: FixedNotebook[] = [];
    const errors: string[] = [];
    const seen = new Set(activeSourceNamesRef.current);

    for (const file of Array.from(fileList)) {
      if (!file.name.toLowerCase().endsWith(".ipynb")) {
        errors.push(`${file.name}: not a .ipynb file`);
        continue;
      }

      const key = sourceKey(file.name);
      if (seen.has(key)) {
        errors.push(`${file.name} is already uploaded. Remove it from the list to upload again.`);
        continue;
      }

      try {
        const nb = JSON.parse(await file.text());
        const fixed = rewriteExecutionCount(nb);
        const blob = new Blob([JSON.stringify(fixed, null, 1)], {
          type: "application/json",
        });
        const downloadName = fixedFileName(file.name);
        seen.add(key);
        activeSourceNamesRef.current.add(key);
        added.push({
          id: crypto.randomUUID(),
          sourceName: file.name,
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
    <>
      <aside className="repo-star" aria-label="Support this project">
        <p className="repo-star-text">
          If this tool helped you, consider starring the repo on GitHub.
        </p>
        <a
          className="repo-star-btn"
          href={githubRepoUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          ★ Star
        </a>
      </aside>

      <main className="main">
      <h1 className="title">Jupyter Notebook Execution Count Reset</h1>

      <div className="intro">
        <p className="description">
          This free online tool fixes out-of-order <code>In [n]</code> execution counts in Jupyter{" "}
          <code>.ipynb</code> notebooks without re-running any cells. Download the fixed files with a <code>-fixed.ipynb</code> suffix.
        </p>
        <ul className="intro-notes">
          <li>You keep your existing outputs and you do not need to run the cells again.</li>
          <li>This helps when the notebook already took hours to run, and rerunning everything is not practical.</li>
          <li>Everything runs in your browser and your notebooks are not uploaded or saved on a server.</li>
        </ul>
      </div>

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
              className={`download-btn download-btn--all${downloadAllUsed ? " download-btn--used" : ""}`}
              onClick={onDownloadAll}
            >
              {downloadAllUsed ? "Redownload all" : "Download all"}
            </button>
          </div>

          <ul className="download-list">
            {notebooks.map((nb) => (
              <li key={nb.id} className="download-item">
                <div className="download-row">
                  <button
                    type="button"
                    className={`download-btn${downloadedIds.has(nb.id) ? " download-btn--used" : ""}`}
                    onClick={() => onSingleDownload(nb)}
                  >
                    {buttonLabel(downloadedIds.has(nb.id), nb.downloadName)}
                  </button>
                  <button
                    type="button"
                    className="download-remove"
                    aria-label={`Remove ${nb.downloadName}`}
                    onClick={() => removeNotebook(nb.id)}
                  >
                    <span aria-hidden="true">×</span>
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </main>

      <footer className="site-footer">
        <p className="site-footer-text">
          © {new Date().getFullYear()}{" "}
          <a
            className="site-footer-link"
            href={`https://github.com/${authorHandle}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {authorHandle}
          </a>
          {" · "}
          <a
            className="site-footer-link"
            href={githubRepoUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            Source on GitHub
          </a>
          {" · MIT License"}
        </p>
      </footer>
    </>
  );
}