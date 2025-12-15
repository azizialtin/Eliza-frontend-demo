"use client"

// PDF Viewer Tab Component
// Displays the original PDF document with navigation
// Uses react-pdf for single-page rendering to prevent continuous scroll

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Loader2,
  FileText,
  Bookmark,
  RotateCw,
} from "lucide-react"
import { Document, Page, pdfjs } from "react-pdf"
import pdfWorkerSrc from "pdfjs-dist/build/pdf.worker.min.mjs?url"

// Import styles for react-pdf
import "react-pdf/dist/Page/AnnotationLayer.css"
import "react-pdf/dist/Page/TextLayer.css"

// Configure worker to use bundled asset (avoids CORS on unpkg)
pdfjs.GlobalWorkerOptions.workerSrc = pdfWorkerSrc

interface PDFViewerTabProps {
  pdfUrl: string
  isSourceLoading?: boolean
  currentPage?: number
  onPageChange?: (page: number) => void
  className?: string
}

export const PDFViewerTab: React.FC<PDFViewerTabProps> = ({
  pdfUrl,
  isSourceLoading = false,
  currentPage = 1,
  onPageChange,
  className,
}) => {
  const [page, setPage] = useState(currentPage)
  const [zoom, setZoom] = useState(100)
  const [isLoading, setIsLoading] = useState(true)
  const [totalPages, setTotalPages] = useState(0)
  const [bookmarks, setBookmarks] = useState<number[]>([])
  const [rotation, setRotation] = useState(0)
  const [loadError, setLoadError] = useState<string | null>(null)

  // Update page when prop changes
  useEffect(() => {
    setPage(currentPage)
  }, [currentPage])

  // Reset loading state when the PDF source changes
  useEffect(() => {
    if (pdfUrl) {
      setIsLoading(true)
      setLoadError(null)
    }
  }, [pdfUrl])

  // Handle page navigation
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && (totalPages === 0 || newPage <= totalPages)) {
      setPage(newPage)
      if (onPageChange) {
        onPageChange(newPage)
      }
    }
  }

  // Handle zoom
  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 25, 200))
  }

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 25, 50))
  }

  const handleResetZoom = () => {
    setZoom(100)
  }

  // Handle fullscreen
  const handleFullscreen = () => {
    const element = document.getElementById("pdf-viewer-container")
    if (element) {
      if (document.fullscreenElement) {
        document.exitFullscreen()
      } else {
        element.requestFullscreen()
      }
    }
  }

  const toggleBookmark = () => {
    setBookmarks((prev) =>
      prev.includes(page) ? prev.filter((p) => p !== page) : [...prev, page].sort((a, b) => a - b),
    )
  }

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360)
  }

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setTotalPages(numPages)
    setIsLoading(false)
    setLoadError(null)
  }

  function onDocumentLoadError(error: Error) {
    console.error('Error loading PDF:', error)
    setLoadError("Failed to load PDF document. It may be blocked or invalid.")
    setIsLoading(false)
  }

  return (
    <div
      className={cn("pdf-viewer-tab flex flex-col h-full bg-gray-50/50", className)}
    >
      {/* Toolbar */}
      <div className="pdf-toolbar bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm z-10 sticky top-0">
        {/* Left: Navigation */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handlePageChange(page - 1)}
            disabled={page <= 1}
            className="h-8 w-8 rounded-full hover:bg-gray-100 text-gray-600"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          <div className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-md">
            <input
              type="number"
              value={page}
              onChange={(e) => handlePageChange(Number.parseInt(e.target.value) || 1)}
              className="w-12 bg-transparent text-center text-sm font-medium text-gray-900 focus:outline-none"
              min={1}
              max={totalPages || undefined}
            />
            {totalPages > 0 && <span className="text-sm text-gray-500 font-medium">/ {totalPages}</span>}
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => handlePageChange(page + 1)}
            disabled={totalPages > 0 && page >= totalPages}
            className="h-8 w-8 rounded-full hover:bg-gray-100 text-gray-600"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Center: Zoom Controls */}
        <div className="flex items-center gap-1 bg-gray-100/50 p-1 rounded-lg border border-gray-200/50">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleZoomOut}
            disabled={zoom <= 50}
            className="h-7 w-7 rounded-md hover:bg-white hover:shadow-sm text-gray-600"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </Button>

          <button
            onClick={handleResetZoom}
            className="px-3 text-xs font-medium text-gray-600 hover:text-gray-900 min-w-[3rem]"
          >
            {zoom}%
          </button>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleZoomIn}
            disabled={zoom >= 200}
            className="h-7 w-7 rounded-md hover:bg-white hover:shadow-sm text-gray-600"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </Button>
        </div>

        {/* Right: Tools */}
        <div className="flex items-center gap-2">
          <Button
            variant={bookmarks.includes(page) ? "secondary" : "ghost"}
            size="icon"
            onClick={toggleBookmark}
            className={cn(
              "h-8 w-8 rounded-full transition-colors",
              bookmarks.includes(page)
                ? "bg-yellow-100 text-yellow-600 hover:bg-yellow-200"
                : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
            )}
            title="Bookmark page"
          >
            <Bookmark className={cn("w-4 h-4", bookmarks.includes(page) && "fill-current")} />
          </Button>

          <div className="w-px h-4 bg-gray-200 mx-1" />

          <Button
            variant="ghost"
            size="icon"
            onClick={handleRotate}
            className="h-8 w-8 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-900"
            title="Rotate"
          >
            <RotateCw className="w-4 h-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleFullscreen}
            className="h-8 w-8 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-900"
            title="Fullscreen"
          >
            <Maximize2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Bookmarks Bar */}
      {bookmarks.length > 0 && (
        <div className="bg-white border-b border-gray-100 px-4 py-2 flex items-center gap-2 overflow-x-auto">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Bookmarks:</span>
          <div className="flex items-center gap-2">
            {bookmarks.map((bookmark) => (
              <button
                key={bookmark}
                onClick={() => handlePageChange(bookmark)}
                className={cn(
                  "px-2 py-0.5 rounded text-xs font-medium transition-colors border",
                  bookmark === page
                    ? "bg-eliza-purple/10 text-eliza-purple border-eliza-purple/20"
                    : "bg-gray-50 text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-100"
                )}
              >
                Page {bookmark}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* PDF Viewer Container */}
      <div
        id="pdf-viewer-container"
        className="pdf-viewer-container flex-1 overflow-auto bg-gray-100/50 relative p-4 md:p-8 flex justify-center"
      >
        {!pdfUrl ? (
          isSourceLoading ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <Loader2 className="w-8 h-8 animate-spin mb-2 text-eliza-purple" />
              <p className="text-sm font-medium">Loading document...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full max-w-md mx-auto text-center p-8">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
                <FileText className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Document Selected</h3>
              <p className="text-sm text-gray-500">
                Select a document from the course materials to view it here.
              </p>
            </div>
          )
        ) : (
          <>
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-20">
                <div className="flex flex-col items-center">
                  <Loader2 className="w-8 h-8 animate-spin text-eliza-purple mb-2" />
                  <p className="text-sm font-medium text-gray-600">Rendering PDF...</p>
                </div>
              </div>
            )}

            {loadError && !isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white z-30">
                <div className="text-center max-w-sm p-6">
                  <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-6 h-6 text-red-500" />
                  </div>
                  <h3 className="text-base font-semibold text-gray-900 mb-2">Failed to load PDF</h3>
                  <p className="text-sm text-gray-500 mb-4">{loadError}</p>
                  <div className="flex gap-2 justify-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setIsLoading(true)
                        setLoadError(null)
                      }}
                    >
                      Retry
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => window.open(pdfUrl, "_blank", "noopener")}
                    >
                      Open External
                    </Button>
                  </div>
                </div>
              </div>
            )}

            <div
              className="relative shadow-xl transition-transform duration-200 ease-out origin-top bg-white"
              style={{
                transform: `rotate(${rotation}deg)`,
                width: 'fit-content',
                height: 'fit-content'
              }}
            >
              <Document
                file={pdfUrl}
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={onDocumentLoadError}
                loading={null}
                className="flex justify-center"
              >
                <Page
                  pageNumber={page}
                  scale={zoom / 100}
                  className="shadow-lg"
                  renderTextLayer={true}
                  renderAnnotationLayer={false}
                />
              </Document>
            </div>
          </>
        )}
      </div>

      {/* Footer Status Bar */}
      <div className="bg-white border-t border-gray-200 px-4 py-2 flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-4">
          <span>{zoom}% Zoom</span>
          <span>{rotation}° Rotation</span>
          {totalPages > 0 && <span>Page {page} of {totalPages}</span>}
        </div>
        <div className="flex items-center gap-1">
          <span>Use arrow keys to navigate</span>
        </div>
      </div>
    </div>
  )
}
