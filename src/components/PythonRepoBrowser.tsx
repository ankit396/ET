import React, { useState, useEffect } from 'react';
import { RepoFile } from '../types/retail';
import { Folder, FileCode, Copy, Check, Download, Search, Terminal, GitBranch, ExternalLink } from 'lucide-react';
import JSZip from 'jszip';

interface PythonRepoBrowserProps {
  files: RepoFile[];
}

export const PythonRepoBrowser: React.FC<PythonRepoBrowserProps> = ({ files }) => {
  const [selectedFilePath, setSelectedFilePath] = useState<string>('README.md');
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);

  // Default to README if loaded
  useEffect(() => {
    if (files.length > 0 && !files.some((f) => f.path === selectedFilePath)) {
      const readme = files.find((f) => f.path.toLowerCase().includes('readme'));
      setSelectedFilePath(readme ? readme.path : files[0].path);
    }
  }, [files]);

  const selectedFile = files.find((f) => f.path === selectedFilePath) || files[0];

  const handleCopyCode = () => {
    if (!selectedFile) return;
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadZip = async () => {
    setIsDownloading(true);
    try {
      const zip = new JSZip();
      const rootFolder = zip.folder('retail-promo-planner-python');

      files.forEach((file) => {
        rootFolder?.file(file.path, file.content);
      });

      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'retail-promo-planner-python-repo.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download error:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  const filteredFiles = files.filter((f) =>
    f.path.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header & Quick Action Banner */}
      <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-bold text-slate-100">
              Host-Ready Python Repository Codebase (Problem Statement 3)
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Complete, modular Python package built with Google GenAI SDK, Pydantic, Scipy, and Pytest. Ready to host in Git.
          </p>
        </div>

        <button
          onClick={handleDownloadZip}
          disabled={isDownloading || files.length === 0}
          className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/25 transition-all flex items-center gap-2 disabled:opacity-50 flex-shrink-0"
        >
          <Download className="w-4 h-4" />
          {isDownloading ? 'Building ZIP Archive...' : 'Download Full Repo (.ZIP)'}
        </button>
      </div>

      {/* Terminal Command Quickstart Box */}
      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
          <Terminal className="w-4 h-4 text-emerald-400" />
          Git Repo Command Quickstart
        </div>
        <div className="bg-slate-900 p-3 rounded-lg text-xs font-mono text-emerald-400 flex items-center justify-between overflow-x-auto">
          <code>
            git clone https://github.com/your-org/retail-promo-planner.git && pip install -r requirements.txt && python -m promo_planner.main --config examples/sample_retail_data.json
          </code>
        </div>
      </div>

      {/* IDE Explorer Grid */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[550px]">
        {/* Left Sidebar File Tree */}
        <div className="md:col-span-4 bg-slate-950 p-4 border-r border-slate-800 space-y-3 flex flex-col">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Filter repo files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex-1 overflow-y-auto space-y-1">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-2 py-1 flex items-center gap-1.5">
              <Folder className="w-3.5 h-3.5 text-indigo-400" />
              Repository Root (python_repo/)
            </div>

            {filteredFiles.map((file) => {
              const isSelected = file.path === selectedFilePath;
              return (
                <button
                  key={file.path}
                  onClick={() => setSelectedFilePath(file.path)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-mono transition-colors flex items-center justify-between ${
                    isSelected
                      ? 'bg-indigo-600/20 text-indigo-300 font-semibold border border-indigo-500/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                  }`}
                >
                  <span className="truncate flex items-center gap-2">
                    <FileCode className={`w-3.5 h-3.5 ${isSelected ? 'text-indigo-400' : 'text-slate-500'}`} />
                    {file.path}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Code Viewer */}
        <div className="md:col-span-8 bg-slate-900 flex flex-col">
          {selectedFile ? (
            <>
              {/* File Header Bar */}
              <div className="p-3 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
                <span className="text-xs font-mono text-indigo-300 font-semibold flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-indigo-400" />
                  {selectedFile.path}
                </span>

                <button
                  onClick={handleCopyCode}
                  className="px-3 py-1 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all flex items-center gap-1.5"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Code</span>
                    </>
                  )}
                </button>
              </div>

              {/* Code Content */}
              <div className="p-4 flex-1 overflow-auto bg-slate-950/40 text-xs font-mono text-slate-300 leading-relaxed max-h-[500px]">
                <pre>
                  <code>{selectedFile.content}</code>
                </pre>
              </div>
            </>
          ) : (
            <div className="p-8 text-center text-slate-500 text-xs">No file selected.</div>
          )}
        </div>
      </div>
    </div>
  );
};
