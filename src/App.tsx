import { useState } from 'react';
import { LogOut, Upload as UploadIcon, Image } from 'lucide-react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Auth } from './components/Auth';
import { PhotoUpload } from './components/PhotoUpload';
import { PhotoGallery } from './components/PhotoGallery';
import { PhotoViewer } from './components/PhotoViewer';
import { supabase } from './lib/supabase';

interface Photo {
  id: string;
  storage_path: string;
  filename: string;
  uploaded_at: string;
  width: number;
  height: number;
  file_size?: number;
}

function MainApp() {
  const { user, loading } = useAuth();
  const [showUpload, setShowUpload] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<{ photo: Photo; url: string } | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const handleUploadComplete = () => {
    setShowUpload(false);
    setRefreshTrigger(prev => prev + 1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                <Image className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">PhotoVault</h1>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowUpload(!showUpload)}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all font-medium"
              >
                <UploadIcon className="w-5 h-5" />
                Upload
              </button>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 text-gray-700 hover:text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-100 transition-all"
              >
                <LogOut className="w-5 h-5" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {showUpload && (
          <div className="mb-8">
            <PhotoUpload onUploadComplete={handleUploadComplete} />
          </div>
        )}

        <PhotoGallery
          onPhotoClick={(photo, url) => setSelectedPhoto({ photo, url })}
          refreshTrigger={refreshTrigger}
        />
      </main>

      {selectedPhoto && (
        <PhotoViewer
          photo={selectedPhoto.photo}
          photoUrl={selectedPhoto.url}
          onClose={() => setSelectedPhoto(null)}
        />
      )}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

export default App;
