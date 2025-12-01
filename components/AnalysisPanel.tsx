import React from 'react';
import { Loader2, AlertCircle, Activity, HeartPulse } from 'lucide-react';
import { LoadingState, Language, AnalysisData } from '../types';

interface AnalysisPanelProps {
  loadingState: LoadingState;
  data: AnalysisData | null;
  language: Language;
}

const AnalysisPanel: React.FC<AnalysisPanelProps> = ({ loadingState, data, language }) => {
  const t = {
    analyzingTitle: language === 'zh' ? 'AI 正在深入分析...' : 'AI đang phân tích...',
    analyzingDesc: language === 'zh' ? '结合面诊与舌诊数据...' : 'Kết hợp dữ liệu khuôn mặt và lưỡi...',
    errorTitle: language === 'zh' ? '分析失败' : 'Lỗi phân tích',
    diagnosisTitle: language === 'zh' ? '身体健康诊断' : 'Chẩn đoán sức khỏe',
    therapyTitle: language === 'zh' ? '理疗建议方案' : 'Phác đồ điều trị',
    score: language === 'zh' ? '健康评分' : 'Điểm sức khỏe',
    waiting: language === 'zh' ? '等待数据...' : 'Đang chờ dữ liệu...',
  };

  const isAnalyzing = loadingState === LoadingState.ANALYZING;
  const isError = loadingState === LoadingState.ERROR;

  // Header Content Logic
  const renderHeader = () => {
    if (data) {
      return (
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 w-full">
           <div>
             <h2 className="text-2xl md:text-3xl font-bold text-gray-100 mb-2">{data.conclusion}</h2>
             <p className="text-sm text-gray-400 uppercase tracking-wider">AI-TCM Holistic Diagnosis</p>
          </div>
          <div className="flex items-center gap-4 bg-[#141414] px-6 py-4 rounded-xl border border-[#333] shadow-inner">
             <span className="text-gray-400 font-medium uppercase text-sm">{t.score}</span>
             <div className="h-8 w-px bg-[#333]" />
             <span className={`text-4xl font-bold ${data.score > 80 ? 'text-green-400' : data.score > 60 ? 'text-yellow-400' : 'text-red-400'}`}>
               {data.score}
             </span>
          </div>
        </div>
      );
    }

    if (isAnalyzing) {
       return (
         <div className="flex items-center gap-4">
            <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
            <div>
              <h2 className="text-xl font-medium text-gray-200">{t.analyzingTitle}</h2>
              <p className="text-gray-500 text-sm animate-pulse">{t.analyzingDesc}</p>
            </div>
         </div>
       );
    }

    if (isError) {
      return (
        <div className="flex items-center gap-4 text-red-400">
           <AlertCircle className="w-8 h-8" />
           <h2 className="text-xl font-medium">{t.errorTitle}</h2>
        </div>
      );
    }

    // Default Idle -> Return null (Hide header block)
    return null;
  };

  const headerContent = renderHeader();

  return (
    <div className="flex flex-col gap-8 w-full min-h-[600px]">
      
      {/* Header Area - Conditionally Rendered */}
      {headerContent && (
        <div className="p-6 md:p-8 bg-[#1e1e1e] rounded-2xl border border-[#333] shadow-lg min-h-[120px] flex items-center transition-all duration-300 animate-in fade-in slide-in-from-top-4">
          {headerContent}
        </div>
      )}

      {/* Split Content Area - Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1">
        
        {/* Left: Diagnosis */}
        <div className={`flex flex-col bg-[#1e1e1e] rounded-2xl border border-[#333] shadow-lg overflow-hidden transition-all duration-500 ${!data ? 'opacity-70 border-dashed' : ''}`}>
          <div className="p-6 border-b border-[#333] bg-[#252525]/50 flex items-center gap-3">
             <div className="p-2 bg-blue-500/10 rounded-lg">
               <Activity className="w-6 h-6 text-blue-400" />
             </div>
             <h3 className="text-xl font-bold text-gray-100">{t.diagnosisTitle}</h3>
          </div>
          <div className="p-6 md:p-8 flex-1 relative">
            {data ? (
              <div className="prose prose-invert prose-lg max-w-none prose-p:text-gray-300 prose-headings:text-gray-100 leading-relaxed whitespace-pre-wrap animate-in fade-in duration-700">
                {data.diagnosis}
              </div>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-600">
                 {isAnalyzing ? (
                   <Loader2 className="w-8 h-8 animate-spin mb-2 opacity-50" />
                 ) : (
                   <Activity className="w-12 h-12 mb-3 opacity-20" />
                 )}
                 <p className="text-sm font-medium uppercase tracking-widest opacity-50">{t.waiting}</p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Therapy */}
        <div className={`flex flex-col bg-[#1e1e1e] rounded-2xl border border-[#333] shadow-lg overflow-hidden transition-all duration-500 ${!data ? 'opacity-70 border-dashed' : ''}`}>
           <div className="p-6 border-b border-[#333] bg-[#252525]/50 flex items-center gap-3">
             <div className="p-2 bg-emerald-500/10 rounded-lg">
               <HeartPulse className="w-6 h-6 text-emerald-400" />
             </div>
             <h3 className="text-xl font-bold text-gray-100">{t.therapyTitle}</h3>
          </div>
          <div className="p-6 md:p-8 bg-[#1a1a1a] flex-1 relative">
            {data ? (
              <div className="prose prose-invert prose-lg max-w-none prose-p:text-gray-300 prose-headings:text-gray-100 leading-relaxed whitespace-pre-wrap animate-in fade-in duration-700">
                 {data.therapy}
              </div>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-600">
                 {isAnalyzing ? (
                   <Loader2 className="w-8 h-8 animate-spin mb-2 opacity-50" />
                 ) : (
                   <HeartPulse className="w-12 h-12 mb-3 opacity-20" />
                 )}
                 <p className="text-sm font-medium uppercase tracking-widest opacity-50">{t.waiting}</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default AnalysisPanel;