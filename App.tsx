import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import ImageInput from './components/ImageInput';
import AnalysisPanel from './components/AnalysisPanel';
import { ImageFile, LoadingState, Language, AnalysisData } from './types';
import { analyzeFaceHealth } from './services/geminiService';
import { ScanFace, Play, ArrowRight } from 'lucide-react';

const App: React.FC = () => {
  const [faceImage, setFaceImage] = useState<ImageFile | null>(null);
  const [tongueImage, setTongueImage] = useState<ImageFile | null>(null);
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [loadingState, setLoadingState] = useState<LoadingState>(LoadingState.IDLE);
  const [language, setLanguage] = useState<Language>('zh');

  // Clear data if face image is removed, but DO NOT auto-analyze
  useEffect(() => {
    if (!faceImage) {
      setAnalysisData(null);
      setLoadingState(LoadingState.IDLE);
    }
  }, [faceImage]);

  const handleAnalyze = async () => {
    if (!faceImage) return;

    setLoadingState(LoadingState.ANALYZING);
    try {
      const data = await analyzeFaceHealth(
        faceImage.data, 
        faceImage.mimeType, 
        tongueImage?.data || null, 
        tongueImage?.mimeType || null,
        language
      );
      setAnalysisData(data);
      setLoadingState(LoadingState.SUCCESS);
    } catch (error) {
      console.error(error);
      setLoadingState(LoadingState.ERROR);
    }
  };

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    if (analysisData && faceImage) {
        handleAnalyze();
    }
  };

  const t = {
    start: language === 'zh' ? '开始诊断' : 'Bắt đầu chẩn đoán',
    faceLabel: language === 'zh' ? '面部扫描' : 'Quét Khuôn Mặt',
    tongueLabel: language === 'zh' ? '舌苔扫描' : 'Quét Lưỡi',
    mandatory: language === 'zh' ? '(必须)' : '(Bắt buộc)',
    optional: language === 'zh' ? '(可选)' : '(Tùy chọn)',
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-gray-100 font-sans selection:bg-blue-500/30">
      <Header language={language} setLanguage={handleLanguageChange} />
      
      <main className="flex flex-col">
        
        {/* TOP SECTION: Image Inputs & Action */}
        <div className="bg-[#121212] border-b border-[#333] py-10 px-4 md:px-8 shadow-xl z-10">
           <div className="max-w-7xl mx-auto flex flex-col xl:flex-row items-center justify-center gap-8 xl:gap-12">
             
             {/* Face Input */}
             <div className="flex flex-col items-center">
                <div className="mb-4 text-2xl text-gray-200 flex items-center gap-3 uppercase tracking-wide font-bold">
                    <ScanFace className="w-8 h-8 text-blue-400" />
                    <span>{t.faceLabel}</span> 
                    <span className="text-blue-500 text-lg">{t.mandatory}</span>
                </div>
                {/* 
                  Target Dimensions:
                  Previous: w-[300px] h-[380px] md:w-[420px] md:h-[520px]
                  Reduced by 30% height:
                  Mobile h: 380 * 0.7 ~= 266px
                  Desktop h: 520 * 0.7 ~= 364px
                */}
                <div className="w-[300px] h-[266px] md:w-[420px] md:h-[364px] rounded-2xl overflow-hidden shadow-2xl shadow-black/50 ring-1 ring-[#333] bg-[#1a1a1a]">
                  <ImageInput 
                    label={t.faceLabel}
                    icon={<ScanFace className="w-12 h-12 text-blue-400" />}
                    image={faceImage}
                    onImageSelect={setFaceImage}
                    onClear={() => setFaceImage(null)}
                    language={language}
                  />
                </div>
             </div>

             {/* Start Button Area */}
             <div className="flex flex-col items-center justify-center gap-3 z-20 my-4 xl:my-0 pt-10">
                <button 
                  onClick={handleAnalyze}
                  disabled={!faceImage || loadingState === LoadingState.ANALYZING}
                  className={`
                    group relative flex items-center justify-center gap-3 px-8 py-4 rounded-full font-bold text-lg transition-all shadow-xl
                    ${!faceImage 
                      ? 'bg-[#222] text-gray-600 cursor-not-allowed border border-[#333]' 
                      : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-500/20 hover:shadow-blue-500/40 hover:scale-105 active:scale-95'
                    }
                  `}
                >
                   {loadingState === LoadingState.ANALYZING ? (
                     <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                   ) : (
                     <Play className="w-6 h-6 fill-current" />
                   )}
                   <span>{t.start}</span>
                   {faceImage && loadingState !== LoadingState.ANALYZING && (
                     <ArrowRight className="w-5 h-5 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                   )}
                </button>
                {!faceImage && (
                  <p className="text-xs text-gray-500 font-medium">
                    {language === 'zh' ? '请先上传面部照片' : 'Vui lòng tải ảnh mặt trước'}
                  </p>
                )}
             </div>
             
             {/* Tongue Input */}
             <div className="flex flex-col items-center">
                <div className="mb-4 text-2xl text-gray-200 flex items-center gap-3 uppercase tracking-wide font-bold">
                    {/* Using ScanFace icon as requested, keeping pink color for distinction */}
                    <ScanFace className="w-8 h-8 text-pink-400" />
                    <span>{t.tongueLabel}</span>
                    <span className="text-pink-500 text-lg">{t.optional}</span>
                </div>
                <div className="w-[300px] h-[266px] md:w-[420px] md:h-[364px] rounded-2xl overflow-hidden shadow-2xl shadow-black/50 ring-1 ring-[#333] bg-[#1a1a1a]">
                  <ImageInput 
                    label={t.tongueLabel}
                    icon={<ScanFace className="w-12 h-12 text-pink-400" />}
                    image={tongueImage}
                    onImageSelect={setTongueImage}
                    onClear={() => setTongueImage(null)}
                    language={language}
                  />
                </div>
             </div>

           </div>
        </div>

        {/* BOTTOM SECTION: Reports */}
        <div className="flex-1 bg-[#0f0f0f] w-full max-w-7xl mx-auto p-4 md:p-8">
          <AnalysisPanel 
            loadingState={loadingState} 
            data={analysisData} 
            language={language}
          />
        </div>

      </main>
    </div>
  );
};

export default App;