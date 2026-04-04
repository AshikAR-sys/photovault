import { useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface Photo {
  id: string;
  storage_path: string;
  filename: string;
  uploaded_at: string;
  width: number;
  height: number;
}

interface PhotoGalleryProps {
  onPhotoClick: (photo: Photo, url: string) => void;
  refreshTrigger: number;
}

export function PhotoGallery({ onPhotoClick, refreshTrigger }: PhotoGalleryProps) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [photoUrls, setPhotoUrls] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { user } = useAuth();

  const loadPhotos = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('photos')
        .select('*')
        .eq('user_id', user.id)
        .order('uploaded_at', { ascending: false });

      if (error) throw error;

      setPhotos(data || []);

      const urls: Record<string, string> = {};
      for (const photo of data || []) {
        const { data: urlData } = supabase.storage
          .from('photos')
          .getPublicUrl(photo.storage_path);
        urls[photo.id] = urlData.publicUrl;
      }
      setPhotoUrls(urls);
    } catch (error) {
      console.error('Error loading photos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPhotos();
  }, [user, refreshTrigger]);

  const handleDelete = async (e: React.MouseEvent, photo: Photo) => {
    e.stopPropagation();

    if (!confirm('Are you sure you want to delete this photo?')) return;

    setDeletingId(photo.id);
    try {
      const { error: storageError } = await supabase.storage
        .from('photos')
        .remove([photo.storage_path]);

      if (storageError) throw storageError;

      const { error: dbError } = await supabase
        .from('photos')
        .delete()
        .eq('id', photo.id);

      if (dbError) throw dbError;

      setPhotos(photos.filter(p => p.id !== photo.id));
    } catch (error) {
      console.error('Error deleting photo:', error);
      alert('Failed to delete photo');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {[...Array(12)].map((_, i) => (
          <div key={i} className="aspect-square bg-gray-200 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (photos.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-gray-400 text-6xl mb-4">📷</div>
        <h3 className="text-xl font-medium text-gray-700 mb-2">No photos yet</h3>
        <p className="text-gray-500">Upload your first photo to get started</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {photos.map((photo) => (
        <div
          key={photo.id}
          className="group relative aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:shadow-lg transition-all"
          onClick={() => onPhotoClick(photo, photoUrls[photo.id])}
        >
          <img
            src={photoUrls[photo.id]}
            alt={photo.filename}
            className="w-full h-full object-cover transition-transform group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all" />
          <button
            onClick={(e) => handleDelete(e, photo)}
            disabled={deletingId === photo.id}
            className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-600 transition-all disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
