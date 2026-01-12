import { Image as ImageIcon, Eye, X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

const ImageGallery = ({ images }) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const imageRef = useRef(null);
  const containerRef = useRef(null);

  if (!images || images.length === 0) return null;

  const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

  // Reset zoom when image changes
  useEffect(() => {
    if (selectedImageIndex !== null) {
      setZoom(1);
      setPosition({ x: 0, y: 0 });
    }
  }, [selectedImageIndex]);

  // Keyboard navigation and zoom
  useEffect(() => {
    if (selectedImageIndex === null) return;

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft' && selectedImageIndex > 0) {
        setSelectedImageIndex(selectedImageIndex - 1);
      } else if (e.key === 'ArrowRight' && selectedImageIndex < images.length - 1) {
        setSelectedImageIndex(selectedImageIndex + 1);
      } else if (e.key === 'Escape') {
        setSelectedImageIndex(null);
      } else if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        setZoom(prev => Math.min(prev + 0.25, 5));
      } else if (e.key === '-') {
        e.preventDefault();
        setZoom(prev => Math.max(prev - 0.25, 0.5));
      } else if (e.key === '0') {
        e.preventDefault();
        setZoom(1);
        setPosition({ x: 0, y: 0 });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedImageIndex, images.length]);

  // Mouse wheel zoom
  useEffect(() => {
    if (selectedImageIndex === null) return;

    const handleWheel = (e) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        setZoom(prev => Math.max(0.5, Math.min(5, prev + delta)));
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [selectedImageIndex]);

  // Touch pinch zoom
  useEffect(() => {
    if (selectedImageIndex === null || !imageRef.current) return;

    let initialDistance = 0;
    let initialZoom = 1;

    const handleTouchStart = (e) => {
      if (e.touches.length === 2) {
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        initialDistance = Math.hypot(
          touch2.clientX - touch1.clientX,
          touch2.clientY - touch1.clientY
        );
        initialZoom = zoom;
      }
    };

    const handleTouchMove = (e) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        const currentDistance = Math.hypot(
          touch2.clientX - touch1.clientX,
          touch2.clientY - touch1.clientY
        );
        const scale = currentDistance / initialDistance;
        setZoom(Math.max(0.5, Math.min(5, initialZoom * scale)));
      }
    };

    const imageElement = imageRef.current;
    imageElement.addEventListener('touchstart', handleTouchStart);
    imageElement.addEventListener('touchmove', handleTouchMove, { passive: false });

    return () => {
      imageElement.removeEventListener('touchstart', handleTouchStart);
      imageElement.removeEventListener('touchmove', handleTouchMove);
    };
  }, [selectedImageIndex, zoom]);

  // Mouse drag when zoomed
  const handleMouseDown = (e) => {
    if (zoom > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging && zoom > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.5, 5));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.5, 0.5));
  };

  const handleResetZoom = () => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleImageClick = (e) => {
    if (zoom === 1) {
      setZoom(2);
    } else {
      setZoom(1);
      setPosition({ x: 0, y: 0 });
    }
  };

  return (
    <>
      <div className="glass-card p-6 rounded-2xl border border-slate-700/50 shadow-xl bg-slate-900/60 backdrop-blur-xl animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center ring-1 ring-cyan-500/20">
            <ImageIcon className="w-5 h-5 text-cyan-400" />
          </div>
          <h3 className="text-xl font-bold text-white tracking-tight">Images <span className="text-slate-500 font-medium text-lg ml-1">({images.length})</span></h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {images.map((image, index) => {
            const imageUrl = image.startsWith('http')
              ? image
              : `${baseUrl}${image}`;
            return (
              <div key={index} className="relative group animate-scale-in" style={{ animationDelay: `${index * 0.05}s` }}>
                <div
                  className="relative overflow-hidden rounded-xl border border-white/10 group-hover:border-cyan-500/50 transition-all cursor-pointer shadow-lg shadow-black/20 group-hover:shadow-cyan-500/20 aspect-video bg-slate-800"
                  onClick={() => setSelectedImageIndex(index)}
                >
                  <img
                    src={imageUrl}
                    alt={`Ticket image ${index + 1}`}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/40 transition-all flex items-center justify-center">
                    <Eye className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-50 group-hover:scale-100 drop-shadow-lg" />
                  </div>
                </div>
                <div className="mt-2 text-[10px] text-center text-slate-500 font-bold uppercase tracking-wider group-hover:text-cyan-400 transition-colors">
                  Image {index + 1}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Image Lightbox Modal - Full Screen with Zoom */}
      {selectedImageIndex !== null && createPortal(
        <div
          className="fixed inset-0 bg-black/95 z-[9999] flex items-center justify-center p-4"
          onClick={() => {
            if (zoom === 1) {
              setSelectedImageIndex(null);
            }
          }}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <div
            ref={containerRef}
            className="relative w-full h-full flex items-center justify-center"
          >
            {/* Close Button */}
            <button
              onClick={() => {
                setSelectedImageIndex(null);
                setZoom(1);
                setPosition({ x: 0, y: 0 });
              }}
              className="absolute top-4 right-4 z-20 w-12 h-12 flex items-center justify-center bg-white/10 hover:bg-white/20 text-white rounded-full transition-all backdrop-blur-sm"
              aria-label="Close"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Zoom Controls */}
            <div className="absolute top-4 left-4 z-20 flex flex-col gap-2 bg-white/10 backdrop-blur-sm rounded-lg p-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleZoomIn();
                }}
                className="w-10 h-10 flex items-center justify-center text-white hover:bg-white/20 rounded transition-all"
                aria-label="Zoom in"
                title="Zoom in (Ctrl + Scroll or +)"
              >
                <ZoomIn className="w-5 h-5" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleZoomOut();
                }}
                className="w-10 h-10 flex items-center justify-center text-white hover:bg-white/20 rounded transition-all"
                aria-label="Zoom out"
                title="Zoom out (Ctrl + Scroll or -)"
              >
                <ZoomOut className="w-5 h-5" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleResetZoom();
                }}
                className="w-10 h-10 flex items-center justify-center text-white hover:bg-white/20 rounded transition-all"
                aria-label="Reset zoom"
                title="Reset zoom (0)"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
              {zoom > 1 && (
                <div className="px-2 py-1 text-xs text-white font-medium text-center border-t border-white/20 mt-1">
                  {Math.round(zoom * 100)}%
                </div>
              )}
            </div>

            {/* Previous Image Button */}
            {images.length > 1 && selectedImageIndex > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedImageIndex(selectedImageIndex - 1);
                }}
                className="absolute left-4 z-20 w-12 h-12 flex items-center justify-center bg-white/10 hover:bg-white/20 text-white rounded-full transition-all backdrop-blur-sm"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}

            {/* Next Image Button */}
            {images.length > 1 && selectedImageIndex < images.length - 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedImageIndex(selectedImageIndex + 1);
                }}
                className="absolute right-4 z-20 w-12 h-12 flex items-center justify-center bg-white/10 hover:bg-white/20 text-white rounded-full transition-all backdrop-blur-sm"
                aria-label="Next image"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}

            {/* Image Counter */}
            {images.length > 1 && (
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white text-sm font-medium">
                {selectedImageIndex + 1} / {images.length}
              </div>
            )}

            {/* Zoom Instructions */}
            {zoom === 1 && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg text-white text-xs text-center">
                Click image to zoom • Use Ctrl + Scroll or +/- keys • Drag when zoomed
              </div>
            )}

            {/* Image with zoom and drag support */}
            <div
              className="relative"
              style={{
                transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
                transition: isDragging ? 'none' : 'transform 0.2s ease-out',
                cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in'
              }}
              onMouseDown={handleMouseDown}
            >
              <img
                ref={imageRef}
                src={images[selectedImageIndex].startsWith('http')
                  ? images[selectedImageIndex]
                  : `${baseUrl}${images[selectedImageIndex]}`}
                alt={`Full size ${selectedImageIndex + 1}`}
                className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg shadow-2xl select-none"
                onClick={(e) => {
                  e.stopPropagation();
                  handleImageClick(e);
                }}
                draggable={false}
              />
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default ImageGallery;

