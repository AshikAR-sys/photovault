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
      className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-full transition-all z-10"
      >
        <X className="w-6 h-6" />
      </button>

      <div
        className="flex flex-col md:flex-row max-w-7xl w-full max-h-[90vh] bg-white rounded-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex-1 flex items-center justify-center bg-gray-100 p-4 md:p-8">
          <img
            src={photoUrl}
            alt={photo.filename}
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
          />
        </div>

        <div className="w-full md:w-80 bg-white p-6 overflow-y-auto">
          <h2 className="text-xl font-bold text-gray-900 mb-6 break-words">
            {photo.filename}
          </h2>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-700">Uploaded</p>
                <p className="text-sm text-gray-600">{formatDate(photo.uploaded_at)}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <ImageIcon className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-700">Dimensions</p>
                <p className="text-sm text-gray-600">
                  {photo.width} × {photo.height} px
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <ImageIcon className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-700">Size</p>
                <p className="text-sm text-gray-600">{formatFileSize(photo.file_size)}</p>
              </div>
            </div>
          </div>

          <button
            onClick={handleDownload}
            className="w-full mt-6 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
          >
            <Download className="w-5 h-5" />
            Download
          </button>
        </div>
      </div>
    </div>
  );
}
