import { useState, useRef } from 'react';
import { Upload, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface PhotoUploadProps {
  onUploadComplete: () => void;
}

export function PhotoUpload({ onUploadComplete }: PhotoUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files).filter(file =>
      file.type.startsWith('image/')
    );
    if (files.length > 0) {
      uploadFiles(files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).filter(file =>
      file.type.startsWith('image/')
    );
    if (files.length > 0) {
      uploadFiles(files);
    }
  };

  const uploadFiles = async (files: File[]) => {
    if (!user) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('photos')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const img = new Image();
        img.src = URL.createObjectURL(file);
        await new Promise((resolve) => {
          img.onload = resolve;
        });

        const { error: dbError } = await supabase.from('photos').insert({
          user_id: user.id,
          storage_path: fileName,
          filename: file.name,
          file_size: file.size,
          content_type: file.type,
          width: img.width,
          height: img.height,
        });

        if (dbError) throw dbError;

        setUploadProgress(((i + 1) / files.length) * 100);
      }

      onUploadComplete();
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload photos');
    } finally {
      setUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="relative">
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        id="file-upload"
      />

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 ${
          isDragging
            ? 'border-blue-500 bg-blue-50 shadow-lg shadow-blue-500/20'
            : 'border-slate-300 bg-gradient-to-br from-white to-slate-50 hover:border-slate-400 hover:shadow-md'
        } ${uploading ? 'pointer-events-none opacity-60' : ''}`}
      >
        <div className="flex justify-center mb-4">
          <div className={`p-3 rounded-full transition-all ${
            isDragging
              ? 'bg-blue-100'
              : 'bg-slate-100'
          }`}>
            <Upload className={`w-8 h-8 ${
              isDragging
                ? 'text-blue-500'
                : 'text-slate-400'
            }`} />
          </div>
        </div>

        <p className="text-lg font-bold text-slate-900 mb-2">
          {uploading ? 'Uploading photos...' : 'Drop photos here or click to upload'}
        </p>
        <p className="text-sm text-slate-600 mb-6">
          JPG, PNG, GIF and other image formats supported
        </p>

        {uploading && (
          <div className="mt-6 space-y-3">
            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p className="text-sm font-semibold text-slate-700">{Math.round(uploadProgress)}% uploaded</p>
          </div>
        )}

        {!uploading && (
          <label
            htmlFor="file-upload"
            className="inline-block bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-blue-500/30 cursor-pointer transition-all hover:scale-105 active:scale-95"
          >
            Select Photos
          </label>
        )}
      </div>
    </div>
  );
}
