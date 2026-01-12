import { Clock, Image as ImageIcon, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';

const Timeline = ({ timeline, currentUserName }) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);
  const [selectedImageList, setSelectedImageList] = useState([]);

  if (!timeline || timeline.length === 0) return null;

  const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

  const openImageGallery = (images, startIndex = 0) => {
    setSelectedImageList(images);
    setSelectedImageIndex(startIndex);
  };

  const closeImageGallery = () => {
    setSelectedImageIndex(null);
    setSelectedImageList([]);
  };

  // Keyboard navigation for image gallery
  useEffect(() => {
    if (selectedImageIndex === null) return;

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft' && selectedImageIndex > 0) {
        setSelectedImageIndex(selectedImageIndex - 1);
      } else if (e.key === 'ArrowRight' && selectedImageIndex < selectedImageList.length - 1) {
        setSelectedImageIndex(selectedImageIndex + 1);
      } else if (e.key === 'Escape') {
        closeImageGallery();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedImageIndex, selectedImageList.length]);

  return (
    <>
      <div className="glass-card p-6 rounded-2xl border border-slate-700/50 shadow-xl bg-slate-900/60 backdrop-blur-xl">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/5">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
            <Clock className="w-5 h-5 text-amber-500" />
          </div>
          <h3 className="text-xl font-bold text-white">Timeline ({timeline.length})</h3>
        </div>
        <div className="space-y-6">
          {timeline.map((item, index) => {
            const isAdmin = currentUserName === item.addedBy || item.addedBy === 'Admin';
            const images = item.images || [];
            return (
              <div
                key={index}
                className={`relative pl-8 pb-4 border-l-2 last:border-0 last:pb-0 ${isAdmin
                    ? 'border-violet-500/20'
                    : 'border-slate-700/50'
                  }`}
              >
                <div className={`absolute -left-[9px] top-0 w-[18px] h-[18px] rounded-full border-[3px] shadow-lg ${isAdmin
                    ? 'bg-slate-900 border-violet-500 shadow-violet-500/20'
                    : 'bg-slate-900 border-slate-500 shadow-slate-500/20'
                  }`}></div>
                <div className={`p-5 rounded-xl border transition-all hover:bg-slate-800/40 ${isAdmin
                    ? 'bg-violet-500/5 border-violet-500/10 hover:border-violet-500/20'
                    : 'bg-slate-800/20 border-white/5 hover:border-white/10'
                  }`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={`font-bold text-sm ${isAdmin ? 'text-white' : 'text-slate-200'
                          }`}
                      >
                        {item.addedBy}
                      </span>
                      {isAdmin && (
                        <span className="px-2 py-0.5 bg-violet-500/20 text-violet-300 border border-violet-500/20 rounded text-[10px] font-bold uppercase tracking-wider">
                          Admin
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-medium">
                      <Clock className={`w-3 h-3 ${isAdmin ? 'text-violet-400' : 'text-slate-500'
                        }`} />
                      <span
                        className={
                          isAdmin ? 'text-violet-300/70' : 'text-slate-500'
                        }
                      >
                        {new Date(item.addedAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                      </span>
                    </div>
                  </div>
                  <p
                    className={`text-sm leading-relaxed mb-3 ${isAdmin ? 'text-slate-300' : 'text-slate-400'
                      }`}
                  >
                    {item.note}
                  </p>

                  {/* Images */}
                  {images.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-white/5">
                      <div className="flex items-center gap-2 mb-3">
                        <ImageIcon className="w-4 h-4 text-slate-500" />
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Attached Images ({images.length})</span>
                      </div>
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                        {images.map((image, imgIndex) => {
                          const imageUrl = image.startsWith('http')
                            ? image
                            : `${baseUrl}${image}`;
                          return (
                            <div
                              key={imgIndex}
                              className="relative group cursor-pointer aspect-square"
                              onClick={() => openImageGallery(images, imgIndex)}
                            >
                              <img
                                src={imageUrl}
                                alt={`Attachment ${imgIndex + 1}`}
                                className="w-full h-full object-cover rounded-lg border border-white/10 hover:border-violet-500/50 transition-all"
                              />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all rounded-lg flex items-center justify-center">
                                <ImageIcon className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity transform scale-90 group-hover:scale-100" />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Full-screen image gallery modal */}
      {selectedImageIndex !== null && selectedImageList.length > 0 && (
        <div
          className="fixed inset-0 bg-black/95 z-[9999] flex items-center justify-center p-4 backdrop-blur-xl"
          onClick={closeImageGallery}
        >
          <div className="relative w-full h-full flex items-center justify-center">
            <button
              onClick={closeImageGallery}
              className="absolute top-4 right-4 z-10 w-12 h-12 flex items-center justify-center bg-white/10 hover:bg-white/20 text-white rounded-full transition-all backdrop-blur-sm"
              aria-label="Close"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Previous Image Button */}
            {selectedImageList.length > 1 && selectedImageIndex > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedImageIndex(selectedImageIndex - 1);
                }}
                className="absolute left-4 z-10 w-12 h-12 flex items-center justify-center bg-white/10 hover:bg-white/20 text-white rounded-full transition-all backdrop-blur-sm"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}

            {/* Next Image Button */}
            {selectedImageList.length > 1 && selectedImageIndex < selectedImageList.length - 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedImageIndex(selectedImageIndex + 1);
                }}
                className="absolute right-4 z-10 w-12 h-12 flex items-center justify-center bg-white/10 hover:bg-white/20 text-white rounded-full transition-all backdrop-blur-sm"
                aria-label="Next image"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}

            {/* Image Counter */}
            {selectedImageList.length > 1 && (
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white text-sm font-medium border border-white/10">
                {selectedImageIndex + 1} / {selectedImageList.length}
              </div>
            )}

            <img
              src={selectedImageList[selectedImageIndex].startsWith('http')
                ? selectedImageList[selectedImageIndex]
                : `${baseUrl}${selectedImageList[selectedImageIndex]}`}
              alt={`Full size ${selectedImageIndex + 1}`}
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default Timeline;

