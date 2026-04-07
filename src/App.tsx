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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                <Image className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">PhotoVault</h1>
                <p className="text-xs text-slate-500">Your photo library</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowUpload(!showUpload)}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-5 py-2.5 rounded-lg hover:shadow-lg hover:shadow-blue-500/30 transition-all font-medium text-sm"
              >
                <UploadIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Upload</span>
              </button>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 text-slate-700 hover:text-slate-900 hover:bg-slate-100 px-4 py-2.5 rounded-lg transition-all font-medium text-sm"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {showUpload && (
          <div className="mb-10 animate-in fade-in slide-in-from-top-4 duration-500">
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
