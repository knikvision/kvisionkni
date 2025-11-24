import React from 'react';
import { ImageMetadata } from '../types';

interface ResultDisplayProps {
  isLoading: boolean;
  resultUrl: string | null;
  error: string | null;
  onUpscale?: () => void;
  is4K?: boolean;
  metadata?: ImageMetadata | null;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({ 
  isLoading, 
  resultUrl, 
  error,
  onUpscale,
  is4K = false,
  metadata
}) => {
  if (error) {
    return (
      <div className="w-full h-80 md:h-[30rem] rounded-2xl border border-red-500/30 bg-red-500/10 flex items-center justify-center p-6 text-center">
        <div className="space-y-2">
           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 mx-auto text-red-400">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
          </svg>
          <h3 className="text-lg font-semibold text-red-200">Generation Failed</h3>
          <p className="text-sm text-red-300/80 max-w-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="w-full h-80 md:h-[30rem] rounded-2xl border border-zinc-700 bg-zinc-900 relative overflow-hidden flex flex-col items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 animate-shimmer" />
        <div className="relative z-10 flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-zinc-400 animate-pulse">
            {is4K ? 'Rendering 4K Details...' : 'Analyzing background & fusing lighting...'}
          </p>
        </div>
      </div>
    );
  }

  if (resultUrl) {
    return (
      <div className="flex flex-col gap-6">
        {/* Main Image Container */}
        <div className="w-full rounded-2xl overflow-hidden border border-zinc-700 shadow-2xl bg-zinc-950 relative group">
          <div className="relative">
            <img
              src={resultUrl}
              alt="Generated Result"
              className="w-full h-auto object-contain max-h-[80vh] mx-auto"
            />
             <a
              href={resultUrl}
              download={`gemini-blend-${is4K ? '4k' : 'result'}.png`}
              className="absolute bottom-4 right-4 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-medium shadow-lg transition-all opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              Download
            </a>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex items-center justify-between px-2">
           <div className="flex items-center gap-2">
             {is4K ? (
               <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-yellow-500 text-xs font-bold tracking-wide uppercase">
                 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                   <path fillRule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401Z" clipRule="evenodd" />
                 </svg>
                 4K Ultra HD
               </div>
             ) : (
                <div className="text-zinc-500 text-sm font-mono">1024x1024 (HD)</div>
             )}
           </div>

           {!is4K && onUpscale && (
             <button
               onClick={onUpscale}
               className="group relative inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-medium transition-all hover:shadow-[0_0_20px_-5px_rgba(255,255,255,0.2)] border border-white/10"
             >
               <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-10 transition-opacity" />
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-purple-400 group-hover:text-purple-300">
                 <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
               </svg>
               Upscale to 4K
             </button>
           )}
        </div>

        {/* Metadata Section */}
        {metadata && (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 space-y-3">
             <div className="flex items-center gap-2 text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                </svg>
                Image Analysis & Generation Metadata
             </div>
             
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                   <span className="block text-zinc-500 text-xs">Model</span>
                   <span className="text-zinc-300 font-mono">{metadata.model}</span>
                </div>
                <div>
                   <span className="block text-zinc-500 text-xs">Resolution</span>
                   <span className="text-zinc-300 font-mono">{metadata.resolution}</span>
                </div>
                <div>
                   <span className="block text-zinc-500 text-xs">Time</span>
                   <span className="text-zinc-300 font-mono">{(metadata.generationTime / 1000).toFixed(2)}s</span>
                </div>
             </div>

             <div className="pt-3 border-t border-zinc-800">
                <span className="block text-zinc-500 text-xs mb-1">Generated Background Prompt (From Analysis)</span>
                <p className="text-zinc-300 text-xs leading-relaxed font-mono bg-black/30 p-2 rounded border border-zinc-800/50 max-h-32 overflow-y-auto">
                   {metadata.prompt}
                </p>
             </div>
          </div>
        )}
      </div>
    );
  }

  // Empty state
  return (
    <div className="w-full h-64 md:h-[30rem] rounded-2xl border border-zinc-800 bg-zinc-900/30 flex items-center justify-center text-zinc-600">
      <div className="text-center space-y-3">
         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 mx-auto opacity-20">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
        </svg>
        <p className="font-medium">Result will appear here</p>
      </div>
    </div>
  );
};

export default ResultDisplay;
