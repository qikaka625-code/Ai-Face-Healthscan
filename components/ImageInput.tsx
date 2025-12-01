import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Camera, Upload, X, Smartphone } from 'lucide-react';
import { ImageFile, Language } from '../types';

interface ImageInputProps {
  label: string;
  icon?: React.ReactNode;
  image: ImageFile | null;
  onImageSelect: (file: ImageFile) => void;
  onClear: () => void;
  language: Language;
}

const ImageInput: React.FC<ImageInputProps> = ({ label, icon, image, onImageSelect, onClear, language }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraReady, setCameraReady] = useState(false);

  const t = {
    startCamera: language === 'zh' ? '拍照' : 'Chụp ảnh',
    uploadPhoto: language === 'zh' ? '上传' : 'Tải lên',
    errorCamera: language === 'zh' ? '无法访问摄像头' : 'Lỗi camera',
  };

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) processFile(file);
  };

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      const base64Data = base64String.split(',')[1];
      onImageSelect({ data: base64Data, mimeType: file.type });
    };
    reader.readAsDataURL(file);
  };

  const startCamera = async () => {
    try {
      setCameraReady(false);
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' } // Removed strict aspect ratio to allow natural camera feel
      });
      setStream(mediaStream);
      setIsCameraActive(true);
    } catch (err) {
      console.error(err);
      alert(t.errorCamera);
    }
  };

  useEffect(() => {
    if (isCameraActive && videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [isCameraActive, stream]);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCameraActive(false);
    setCameraReady(false);
  }, [stream]);

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current && cameraReady) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (video.videoWidth === 0) return;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.save();
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        ctx.restore();
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        onImageSelect({ data: dataUrl.split(',')[1], mimeType: 'image/jpeg' });
        stopCamera();
      }
    }
  };

  const triggerUpload = () => fileInputRef.current?.click();

  // 1. Camera View
  if (isCameraActive) {
    return (
      <div className="relative w-full h-full bg-black flex flex-col items-center justify-center">
        <video 
          ref={videoRef} 
          autoPlay playsInline muted
          onCanPlay={() => setCameraReady(true)}
          className="w-full h-full object-contain transform scale-x-[-1]" 
        />
        <canvas ref={canvasRef} className="hidden" />
        <div className="absolute bottom-4 left-0 right-0 flex justify-center items-center gap-6 z-10">
          <button onClick={stopCamera} className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm">
            <X className="w-5 h-5" />
          </button>
          <button 
            onClick={capturePhoto} 
            disabled={!cameraReady}
            className={`w-12 h-12 rounded-full border-4 border-white flex items-center justify-center transition-opacity ${cameraReady ? 'cursor-pointer hover:bg-white/10' : 'opacity-50'}`}
          >
            <div className="w-8 h-8 bg-white rounded-full" />
          </button>
        </div>
      </div>
    );
  }

  // 2. Image Preview
  if (image) {
    return (
      <div className="relative w-full h-full group bg-[#000] p-2 flex items-center justify-center">
        <img 
          src={`data:${image.mimeType};base64,${image.data}`} 
          alt={label} 
          className="w-full h-full object-contain"
        />
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
          <button 
            onClick={onClear} 
            className="p-2 bg-red-500/90 text-white rounded-full hover:bg-red-600 transition-colors transform hover:scale-110"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  // 3. Empty State
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-[#1a1a1a] hover:bg-[#222] transition-colors p-4 text-center group">
      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
      
      <div className="mb-4 p-4 bg-[#252525] rounded-full text-gray-500 group-hover:text-blue-400 transition-colors">
        {icon || <Smartphone className="w-8 h-8" />}
      </div>
      
      <div className="flex flex-col gap-2 w-full max-w-[160px]">
        <button 
          onClick={startCamera} 
          className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-lg flex items-center justify-center gap-2 transition-colors"
        >
          <Camera className="w-4 h-4" />
          {t.startCamera}
        </button>
        <button 
          onClick={triggerUpload} 
          className="flex-1 py-2.5 bg-[#333] hover:bg-[#444] text-gray-200 text-xs font-medium rounded-lg flex items-center justify-center gap-2 transition-colors"
        >
          <Upload className="w-4 h-4" />
          {t.uploadPhoto}
        </button>
      </div>
    </div>
  );
};

export default ImageInput;