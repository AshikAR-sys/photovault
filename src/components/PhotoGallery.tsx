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
          <div
            key={i}
            className="aspect-square bg-gradient-to-br from-slate-200 to-slate-300 rounded-xl animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (photos.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-slate-200 to-slate-300 rounded-2xl mb-6">
          <div className="text-3xl">📷</div>
        </div>
        <h3 className="text-2xl font-bold text-slate-900 mb-2">No photos yet</h3>
        <p className="text-slate-600 text-lg">Upload your first photo to get started</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {photos.map((photo, idx) => (
        <div
          key={photo.id}
          className="group relative aspect-square bg-slate-200 rounded-xl overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 animate-in fade-in"
          style={{ animationDelay: `${idx * 50}ms` }}
          onClick={() => onPhotoClick(photo, photoUrls[photo.id])}
        >
          <img
            src={photoUrls[photo.id]}
            alt={photo.filename}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <button
            onClick={(e) => handleDelete(e, photo)}
            disabled={deletingId === photo.id}
            className="absolute top-3 right-3 bg-red-500/90 backdrop-blur-sm text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-600 transition-all duration-300 disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
