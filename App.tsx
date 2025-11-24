import React, { useState, useEffect } from 'react';
import UploadZone from './components/UploadZone';
import ResultDisplay from './components/ResultDisplay';
import { UploadedImage, GenerationState } from './types';
import { generateCompositeImage } from './services/geminiService';

const App: React.FC = () => {
  const [personImage, setPersonImage] = useState<UploadedImage | null>(null);
  const [backgroundImage, setBackgroundImage] = useState<UploadedImage | null>(null);
  
  const [hasApiKey, setHasApiKey] = useState(false);
  const [isCheckingKey, setIsCheckingKey] = useState(true);
  
  const [is4K, setIs4K] = useState(false);

  const [generationState, setGenerationState] = useState<GenerationState>({
    isLoading: false,
    error: null,
    resultImageUrl: null,
    metadata: null,
  });

  useEffect(() => {
    const checkKey = async () => {
      try {
        if (window.aistudio && window.aistudio.hasSelectedApiKey) {
          const hasKey = await window.aistudio.hasSelectedApiKey();
          setHasApiKey(hasKey);
        } else {
          // Fallback if not in the specific AI Studio environment
          setHasApiKey(true);
        }
      } catch (e) {
        console.error("Error checking API key status:", e);
        setHasApiKey(false);
      } finally {
        setIsCheckingKey(false);
      }
    };
    checkKey();
  }, []);

  const handleSelectKey = async () => {
    try {
      if (window.aistudio && window.aistudio.openSelectKey) {
        await window.aistudio.openSelectKey();
        setHasApiKey(true);
      }
    } catch (e) {
      console.error("Error selecting API key:", e);
    }
  };

  const handleGenerate = async () => {
    if (!personImage || !backgroundImage) return;

    setGenerationState({
      isLoading: true,
      error: null,
      resultImageUrl: null,
      metadata: null,
    });
    setIs4K(false);

    try {
      const result = await generateCompositeImage(personImage, backgroundImage, '1K');
      setGenerationState({
        isLoading: false,
        error: null,
        resultImageUrl: result.image,
        metadata: result.metadata,
      });
    } catch (error: any) {
      handleGenerationError(error);
    }
  };

  const handleUpscale = async () => {
    if (!personImage || !backgroundImage) return;

    setGenerationState(prev => ({
      ...prev,
      isLoading: true,
      error: null,
    }));
    
    setIs4K(true); 

    try {
      const result = await generateCompositeImage(personImage, backgroundImage, '4K');
      setGenerationState({
        isLoading: false,
        error: null,
        resultImageUrl: result.image,
        metadata: result.metadata,
      });
    } catch (error: any) {
      setIs4K(false);
      handleGenerationError(error);
    }
  };

  const handleGenerationError = (error: any) => {
    const errorMessage = error.message || "An unexpected error occurred";
    
    if (errorMessage.includes("Requested entity was not found") || errorMessage.includes("403") || errorMessage.includes("permission")) {
      setHasApiKey(false);
      setGenerationState({
        isLoading: false,
        error: "Permission denied. Please re-select your API Key.",
        resultImageUrl: null,
        metadata: null,
      });
      return;
    }

    setGenerationState({
      isLoading: false,
      error: errorMessage,
      resultImageUrl: null,
      metadata: null,
    });
  };

  if (isCheckingKey) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        <div className="animate-pulse">Checking configuration...</div>
      </div>
    );
  }

  if (!hasApiKey) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center mb-6 shadow-[0_0_30px_-10px_rgba(37,99,235,0.5)]">
           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8 text-white">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21.75 8.25Z" />
          </svg>
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4">
          Authentication Required
        </h1>
        <p className="text-zinc-400 max-w-lg text-lg mb-8 leading-relaxed">
          The <strong>gemini-3-pro-image-preview</strong> model requires a Google Cloud Project with billing enabled. Please select your API key to continue.
        </p>
        
        <button 
          onClick={handleSelectKey}
          className="px-8 py-4 bg-white text-black rounded-xl font-bold text-lg hover:scale-105 hover:shadow-xl transition-all duration-300"
        >
          Select API Key
        </button>
        
        <div className="mt-8">
          <a 
            href="https://ai.google.dev/gemini-api/docs/billing" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-zinc-500 hover:text-zinc-300 text-sm font-medium underline underline-offset-4 transition-colors"
          >
            Read about billing requirements
          </a>
        </div>
      </div>
    );
  }

  const isReadyToGenerate = personImage !== null && backgroundImage !== null && !generationState.isLoading;

  return (
    <div className="min-h-screen bg-black text-white selection:bg-blue-500/30">
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-black/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
             <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center">
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-white">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" />
              </svg>
             </div>
             <span className="font-bold text-lg tracking-tight">Gemini Blend</span>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={handleSelectKey}
              className="text-xs text-zinc-400 hover:text-white transition-colors"
            >
              Change Key
            </button>
            <div className="text-xs font-mono text-zinc-500 bg-zinc-900 px-2 py-1 rounded">
              gemini-3-pro-image-preview
            </div>
          </div>
        </div>
      </header>

      <main className="pt-24 pb-12 px-4 md:px-6 max-w-7xl mx-auto space-y-12">
        
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-br from-white via-zinc-300 to-zinc-500 bg-clip-text text-transparent">
            AI Background Swap
          </h1>
          <p className="text-zinc-400 text-lg">
            Seamlessly relocate your subject. Gemini analyzes the background image first, then reconstructs the scene for perfect lighting integration.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-12 relative">
           <div className="hidden md:flex absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-zinc-900 border border-zinc-700 rounded-full items-center justify-center">
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-zinc-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
           </div>

           <UploadZone
             label="Subject Image"
             subLabel="Drag & drop the person here"
             image={personImage}
             onImageUpload={(img) => { setPersonImage(img); setIs4K(false); }}
             onRemove={() => { setPersonImage(null); setIs4K(false); }}
             disabled={generationState.isLoading}
           />
           <UploadZone
             label="Background Reference"
             subLabel="Drag & drop for style & lighting"
             image={backgroundImage}
             onImageUpload={(img) => { setBackgroundImage(img); setIs4K(false); }}
             onRemove={() => { setBackgroundImage(null); setIs4K(false); }}
             disabled={generationState.isLoading}
           />
        </div>

        <div className="flex justify-center">
          <button
            onClick={handleGenerate}
            disabled={!isReadyToGenerate}
            className={`
              relative px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 transform
              flex items-center gap-3
              ${
                isReadyToGenerate
                  ? 'bg-white text-black hover:scale-105 hover:shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)]'
                  : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
              }
            `}
          >
            {generationState.isLoading ? (
              <>
                <span>Processing</span>
                <span className="flex space-x-1">
                  <span className="w-1.5 h-1.5 bg-zinc-600 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="w-1.5 h-1.5 bg-zinc-600 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="w-1.5 h-1.5 bg-zinc-600 rounded-full animate-bounce"></span>
                </span>
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path fillRule="evenodd" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" clipRule="evenodd" />
                </svg>
                <span>Generate Composite</span>
              </>
            )}
          </button>
        </div>

        <div className="space-y-4">
           <div className="flex items-center justify-between">
             <h2 className="text-xl font-semibold text-zinc-300">Result</h2>
           </div>
           
           <ResultDisplay
             isLoading={generationState.isLoading}
             resultUrl={generationState.resultImageUrl}
             error={generationState.error}
             onUpscale={handleUpscale}
             is4K={is4K}
             metadata={generationState.metadata}
           />
        </div>

      </main>
    </div>
  );
};

export default App;
