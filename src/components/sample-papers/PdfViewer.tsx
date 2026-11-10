'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Download,
  Printer,
  RotateCw,
  ArrowLeft,
  FileText,
  Loader2,
  Sparkles
} from 'lucide-react';

interface PdfViewerProps {
  paper: {
    id: string;
    title: string;
    year: number;
    month?: string | null;
    paperPdfUrl: string;
    answerPdfUrl?: string | null;
    subject: {
      name: string;
      code: string;
    };
  };
}

export default function PdfViewer({ paper }: PdfViewerProps) {
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [rotation, setRotation] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, [paper.paperPdfUrl]);

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 25, 250));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 25, 50));
  };

  const handleFitToWidth = () => {
    setZoomLevel(125);
  };

  const handleFitToPage = () => {
    setZoomLevel(100);
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handlePrint = () => {
    if (iframeRef.current?.contentWindow) {
      try {
        iframeRef.current.contentWindow.print();
      } catch {
        window.print();
      }
    } else {
      window.print();
    }
  };

  // Build viewer URL directly streaming from API
  const viewerUrl = `${paper.paperPdfUrl}#toolbar=1&navpanes=1&scrollbar=1&zoom=${zoomLevel}`;

  return (
    <div
      ref={containerRef}
      className={`flex flex-col bg-[#09090D] text-white ${
        isFullscreen ? 'h-screen w-screen fixed inset-0 z-50' : 'h-[calc(100dvh-4rem)] w-full'
      }`}
    >
      {/* Top Controls Toolbar */}
      <div className="h-14 bg-[#0E0E14] border-b border-purple-500/20 px-2 sm:px-6 flex items-center justify-between shrink-0 shadow-lg">
        {/* Left: Back & Title */}
        <div className="flex items-center space-x-2 sm:space-x-3 truncate">
          <Link
            href={`/sample-papers/${paper.subject.code.toLowerCase()}`}
            className="btn-pop p-2 rounded-xl text-[#A3A3B5] hover:text-white hover:bg-white/5 transition-colors cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center"
            title="Back to Subject Papers"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>

          <div className="flex items-center space-x-1.5 sm:space-x-2 truncate">
            <span className="text-[10px] sm:text-xs font-extrabold px-2 py-0.5 rounded-lg bg-purple-500/15 text-purple-400 border border-purple-500/30 font-mono">
              {paper.subject.code}
            </span>
            <span className="text-xs font-bold text-white truncate max-w-[110px] xs:max-w-[160px] sm:max-w-md font-heading">
              {paper.title}
            </span>
          </div>
        </div>

        {/* Center: Zoom and Fit Controls */}
        <div className="flex items-center space-x-1 sm:space-x-1.5 bg-[#08080C] px-1.5 sm:px-2 py-1 rounded-xl border border-purple-500/20">
          <button
            type="button"
            onClick={handleZoomOut}
            className="btn-pop p-1.5 rounded-lg text-[#A3A3B5] hover:text-white transition-colors cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
            title="Zoom Out"
            aria-label="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>

          <span className="text-[11px] sm:text-xs font-mono font-medium text-white w-9 sm:w-12 text-center">
            {zoomLevel}%
          </span>

          <button
            type="button"
            onClick={handleZoomIn}
            className="btn-pop p-1.5 rounded-lg text-[#A3A3B5] hover:text-white transition-colors cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
            title="Zoom In"
            aria-label="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>

          <div className="hidden sm:block h-4 w-px bg-purple-500/20 mx-1" />

          <button
            type="button"
            onClick={handleFitToWidth}
            className="hidden sm:inline-flex btn-pop px-2 py-1 rounded-lg text-[11px] font-medium text-[#A3A3B5] hover:text-white transition-colors cursor-pointer"
          >
            Fit Width
          </button>

          <button
            type="button"
            onClick={handleRotate}
            className="btn-pop p-1.5 rounded-lg text-[#A3A3B5] hover:text-white transition-colors cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
            title="Rotate Clockwise"
            aria-label="Rotate Clockwise"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center space-x-1.5 sm:space-x-2">
          <button
            type="button"
            onClick={handlePrint}
            className="btn-pop hidden sm:inline-flex p-2 rounded-xl text-[#A3A3B5] hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            title="Print Document"
          >
            <Printer className="w-4 h-4" />
          </button>

          <a
            href={`/api/sample-papers/${paper.id}/download`}
            download
            className="btn-pop inline-flex items-center space-x-1 sm:space-x-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#8B5CF6] hover:bg-[#A855F7] text-white shadow-md shadow-purple-950/40 transition-all cursor-pointer min-h-[38px]"
            title="Download Original PDF"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Download</span>
          </a>

          <button
            type="button"
            onClick={toggleFullscreen}
            className="btn-pop p-2 rounded-xl text-[#A3A3B5] hover:text-white hover:bg-white/5 transition-colors cursor-pointer min-h-[38px] min-w-[38px] flex items-center justify-center"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            aria-label="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main PDF Rendering Area */}
      <div className="flex-1 relative bg-[#060608] overflow-hidden flex items-center justify-center">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#09090D]/90 z-10 space-x-2 text-xs text-purple-400">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Rendering official board question paper...</span>
          </div>
        )}

        {loadError ? (
          <div className="text-center p-8 space-y-3">
            <FileText className="w-10 h-10 text-purple-500 mx-auto" />
            <h4 className="text-sm font-semibold text-white">Browser Preview Not Supported</h4>
            <p className="text-xs text-[#A3A3B5] max-w-sm">
              Your browser may block embedded PDF rendering. You can download the authentic PDF file directly.
            </p>
            <a
              href={`/api/sample-papers/${paper.id}/download`}
              download
              className="btn-pop inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold bg-[#8B5CF6] text-white cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download PDF File</span>
            </a>
          </div>
        ) : (
          <iframe
            ref={iframeRef}
            src={viewerUrl}
            title={paper.title}
            className="w-full h-full border-none"
            onLoad={() => setIsLoading(false)}
            onError={() => {
              setIsLoading(false);
              setLoadError(true);
            }}
            style={{
              transform: `rotate(${rotation}deg)`,
              transition: 'transform 0.2s ease-in-out'
            }}
          />
        )}
      </div>
    </div>
  );
}
