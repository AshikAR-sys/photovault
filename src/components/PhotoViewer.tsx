import { X, Download, Calendar, Image as ImageIcon } from 'lucide-react';

interface Photo {
  id: string;
  storage_path: string;
  filename: string;
  uploaded_at: string;
  width: number;
  height: number;
  file_size?: number;
}

interface PhotoViewerProps {
  photo: Photo;
  photoUrl: string;
  onClose: () => void;
}

export function PhotoViewer({ photo, photoUrl, onClose }: PhotoViewerProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown';
    const mb = bytes / (1024 * 1024);
    if (mb < 1) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${mb.toFixed(1)} MB`;
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = photoUrl;
    link.download = photo.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white hover:bg-white/20 p-2 rounded-full transition-all z-10 hover:scale-110"
      >
        <X className="w-6 h-6" />
      </button>

      <div
        className="flex flex-col md:flex-row max-w-6xl w-full max-h-[90vh] bg-white rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-4 md:p-8">
          <img
            src={photoUrl}
            alt={photo.filename}
            className="max-w-full max-h-full object-contain rounded-lg"
          />
        </div>

        <div className="w-full md:w-96 bg-white p-8 overflow-y-auto">
          <h2 className="text-2xl font-bold text-slate-900 mb-8 break-words leading-tight">
            {photo.filename}
          </h2>

          <div className="space-y-6">
            <div className="flex items-start gap-4 pb-6 border-b border-slate-200">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Uploaded</p>
                <p className="text-sm text-slate-900 font-medium">{formatDate(photo.uploaded_at)}</p>
              </div>
            </div>

            <div className="flex items-start gap-4 pb-6 border-b border-slate-200">
              <div className="w-10 h-10 rounded-lg bg-cyan-100 flex items-center justify-center flex-shrink-0">
                <ImageIcon className="w-5 h-5 text-cyan-600" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Dimensions</p>
                <p className="text-sm text-slate-900 font-medium">
                  {photo.width} × {photo.height} pixels
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 pb-6">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                <ImageIcon className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">File Size</p>
                <p className="text-sm text-slate-900 font-medium">{formatFileSize(photo.file_size)}</p>
              </div>
            </div>
          </div>

          <button
            onClick={handleDownload}
            className="w-full mt-8 bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-3.5 px-4 rounded-lg font-semibold hover:shadow-lg hover:shadow-blue-500/30 transition-all flex items-center justify-center gap-2"
          >
            <Download className="w-5 h-5" />
            Download Photo
          </button>
        </div>
      </div>
    </div>
  );
}
