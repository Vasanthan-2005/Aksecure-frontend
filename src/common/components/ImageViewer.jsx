import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

const ImageViewer = ({ images, initialIndex = 0, onClose }) => {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const [zoom, setZoom] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const imageRef = useRef(null);
    const containerRef = useRef(null);

    if (!images || images.length === 0) return null;

    const baseUrl = import.meta.env.VITE_API_URL?.replace(/\/api\/?$/, '') || 'http://localhost:5000';

    const getImageUrl = (image) => {
        if (typeof image === 'string') {
            return image.startsWith('http') ? image : `${baseUrl}${image.startsWith('/') ? '' : '/'}${image}`;
        }
        return image.url || '';
    };

    // Reset zoom when image changes
    useEffect(() => {
        setZoom(1);
        setPosition({ x: 0, y: 0 });
    }, [currentIndex]);

    // Keyboard navigation and zoom
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'ArrowLeft' && currentIndex > 0) {
                setCurrentIndex(currentIndex - 1);
            } else if (e.key === 'ArrowRight' && currentIndex < images.length - 1) {
                setCurrentIndex(currentIndex + 1);
            } else if (e.key === 'Escape') {
                onClose();
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
    }, [currentIndex, images.length, onClose]);

    // Mouse wheel zoom
    useEffect(() => {
        const handleWheel = (e) => {
            if (e.ctrlKey || e.metaKey) {
                e.preventDefault();
                const delta = e.deltaY > 0 ? -0.1 : 0.1;
                setZoom(prev => Math.max(0.5, Math.min(5, prev + delta)));
            }
        };

        window.addEventListener('wheel', handleWheel, { passive: false });
        return () => window.removeEventListener('wheel', handleWheel);
    }, []);

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

    return createPortal(
        <div
            className="fixed inset-0 bg-slate-950/95 z-[9999] flex items-center justify-center p-4 md:p-8 backdrop-blur-sm animate-fade-in"
            onClick={() => {
                if (zoom === 1) onClose();
            }}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
        >
            <div
                ref={containerRef}
                className="relative w-full h-full flex items-center justify-center animate-scale-in"
            >
                {/* Close Button / Exit */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onClose();
                    }}
                    className="absolute top-4 right-4 z-20 flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-full transition-all backdrop-blur-md border border-red-500/20 shadow-lg shadow-red-500/5 group"
                    aria-label="Exit full screen"
                >
                    <span className="text-xs font-bold uppercase tracking-wider group-hover:pr-1 transition-all">Exit</span>
                    <X className="w-5 h-5" />
                </button>

                {/* Zoom Controls */}
                <div className="absolute top-4 left-4 z-20 flex flex-col gap-2 bg-white/5 backdrop-blur-sm rounded-2xl p-2 border border-white/10 shadow-2xl">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleZoomIn();
                        }}
                        className="w-10 h-10 flex items-center justify-center text-white hover:bg-white/10 rounded-xl transition-all"
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
                        className="w-10 h-10 flex items-center justify-center text-white hover:bg-white/10 rounded-xl transition-all"
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
                        className="w-10 h-10 flex items-center justify-center text-white hover:bg-white/10 rounded-xl transition-all"
                        aria-label="Reset zoom"
                        title="Reset zoom (0)"
                    >
                        <RotateCcw className="w-5 h-5" />
                    </button>
                    {zoom > 1 && (
                        <div className="px-2 py-1 text-[10px] text-white font-bold text-center border-t border-white/10 mt-1">
                            {Math.round(zoom * 100)}%
                        </div>
                    )}
                </div>

                {/* Navigation Buttons */}
                {images.length > 1 && (
                    <>
                        {currentIndex > 0 && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setCurrentIndex(currentIndex - 1);
                                }}
                                className="absolute left-4 z-20 w-12 h-12 flex items-center justify-center bg-white/5 hover:bg-white/10 text-white rounded-full transition-all backdrop-blur-sm border border-white/10 shadow-2xl"
                                aria-label="Previous image"
                            >
                                <ChevronLeft className="w-6 h-6" />
                            </button>
                        )}
                        {currentIndex < images.length - 1 && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setCurrentIndex(currentIndex + 1);
                                }}
                                className="absolute right-4 z-20 w-12 h-12 flex items-center justify-center bg-white/5 hover:bg-white/10 text-white rounded-full transition-all backdrop-blur-sm border border-white/10 shadow-2xl"
                                aria-label="Next image"
                            >
                                <ChevronRight className="w-6 h-6" />
                            </button>
                        )}
                    </>
                )}

                {/* Image Counter */}
                {images.length > 1 && (
                    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20 px-4 py-2 bg-white/5 backdrop-blur-sm rounded-full text-white text-xs font-bold border border-white/10 shadow-2xl">
                        {currentIndex + 1} / {images.length}
                    </div>
                )}

                {/* Zoom Instructions */}
                {zoom === 1 && (
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20 px-6 py-3 bg-white/5 backdrop-blur-md rounded-2xl text-white/50 text-[10px] font-bold uppercase tracking-[0.2em] text-center border border-white/5 shadow-2xl pointer-events-none">
                        Click to zoom • Ctrl + Scroll to zoom • Drag when zoomed
                    </div>
                )}

                {/* Image Container */}
                <div
                    className="relative"
                    style={{
                        transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
                        transition: isDragging ? 'none' : 'transform 0.2s cubic-bezier(0.2, 0, 0, 1)',
                        cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in'
                    }}
                    onMouseDown={handleMouseDown}
                >
                    <img
                        ref={imageRef}
                        src={getImageUrl(images[currentIndex])}
                        alt={`Full size view ${currentIndex + 1}`}
                        className="max-w-[90vw] max-h-[90vh] object-contain rounded-2xl shadow-[0_0_80px_rgba(0,0,0,0.8)] select-none border border-white/5"
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
    );
};

export default ImageViewer;
