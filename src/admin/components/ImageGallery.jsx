import { Image as ImageIcon, Eye } from 'lucide-react';
import { useState } from 'react';
import ImageViewer from '../../common/components/ImageViewer';

const ImageGallery = ({ images }) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);
  if (!images || images.length === 0) return null;

  const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

  return (
    <>
      <div className="glass-card p-6 rounded-2xl border border-slate-700/50 shadow-xl bg-slate-900/60 backdrop-blur-xl">
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
              <div key={index} className="relative group">
                <div
                  className="relative overflow-hidden rounded-xl border border-white/10 group-hover:border-cyan-500/50 cursor-pointer shadow-lg shadow-black/20 group-hover:shadow-cyan-500/20 aspect-video bg-slate-800"
                  onClick={() => setSelectedImageIndex(index)}
                >
                  <img
                    src={imageUrl}
                    alt={`Ticket image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/40 flex items-center justify-center">
                    <Eye className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 drop-shadow-lg" />
                  </div>
                </div>
                <div className="mt-2 text-[10px] text-center text-slate-500 font-bold uppercase tracking-wider group-hover:text-cyan-400">
                  Image {index + 1}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Image Lightbox Modal - Full Screen with shared ImageViewer */}
      {selectedImageIndex !== null && (
        <ImageViewer
          images={images}
          initialIndex={selectedImageIndex}
          onClose={() => setSelectedImageIndex(null)}
        />
      )}
    </>
  );
};

export default ImageGallery;

