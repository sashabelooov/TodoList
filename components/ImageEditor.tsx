import React, { useState, useRef } from 'react';
import { Upload, Sparkles, RefreshCw, Download, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { editImageWithGemini } from '../services/geminiService';

export const ImageEditor: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("File size too large. Please check that the file is less than 5MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setGeneratedImage(null); // Reset previous generation
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!selectedImage || !prompt.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      // Extract mime type from data URL
      const mimeType = selectedImage.match(/data:([^;]+);/)?.[1] || 'image/png';
      
      const result = await editImageWithGemini(selectedImage, mimeType, prompt);
      
      if (result) {
        setGeneratedImage(result);
      } else {
        setError("The AI processed the request but did not return an image. Try a different prompt.");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred while communicating with the AI.");
    } finally {
      setIsLoading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="max-w-5xl mx-auto bg-gray-800 rounded-xl shadow-lg border border-gray-700 overflow-hidden">
      <div className="p-6 border-b border-gray-700 bg-gray-850">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Sparkles className="text-indigo-400" />
          AI Image Studio
        </h2>
        <p className="text-gray-400 mt-1">
          Upload an image and use natural language to edit it using Gemini 2.5 Flash.
        </p>
      </div>

      <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <div className="space-y-6">
          <div 
            className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all h-80 bg-gray-900/50 ${
              selectedImage ? 'border-indigo-500' : 'border-gray-600 hover:border-indigo-500 hover:bg-gray-800'
            }`}
            onClick={triggerFileInput}
          >
            {selectedImage ? (
              <div className="relative w-full h-full flex items-center justify-center">
                <img 
                  src={selectedImage} 
                  alt="Original" 
                  className="max-w-full max-h-full object-contain rounded shadow-sm"
                />
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded text-white font-medium backdrop-blur-sm">
                  Click to change image
                </div>
              </div>
            ) : (
              <div className="text-gray-500">
                <div className="w-16 h-16 bg-gray-800 text-indigo-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-700">
                  <Upload size={32} />
                </div>
                <p className="font-medium text-lg text-gray-300">Click to upload</p>
                <p className="text-sm mt-2 text-gray-500">JPG or PNG (max 5MB)</p>
              </div>
            )}
            <input 
              ref={fileInputRef}
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={handleFileChange}
            />
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-300">
              Editing Instruction
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="E.g., 'Add a vintage filter', 'Turn the cat into a robot', 'Make it look like a sketch'..."
              className="w-full p-3 bg-gray-900 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 min-h-[100px] resize-none placeholder-gray-600"
            />
            <button
              onClick={handleGenerate}
              disabled={!selectedImage || !prompt.trim() || isLoading}
              className={`w-full py-3 px-4 rounded-lg font-semibold text-white flex items-center justify-center gap-2 transition-all ${
                !selectedImage || !prompt.trim() || isLoading
                  ? 'bg-gray-700 cursor-not-allowed text-gray-500'
                  : 'bg-indigo-600 hover:bg-indigo-700 shadow-md hover:shadow-lg hover:shadow-indigo-900/20'
              }`}
            >
              {isLoading ? (
                <>
                  <RefreshCw className="animate-spin" /> Processing...
                </>
              ) : (
                <>
                  <Sparkles size={20} /> Edit with AI
                </>
              )}
            </button>
            {error && (
              <div className="p-3 bg-red-900/20 border border-red-900/50 text-red-300 text-sm rounded-lg flex items-start gap-2">
                <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                {error}
              </div>
            )}
          </div>
        </div>

        {/* Output Section */}
        <div className="flex flex-col h-full">
          <div className="flex-1 bg-gray-900 rounded-xl border border-gray-700 flex items-center justify-center min-h-[320px] lg:min-h-0 relative overflow-hidden">
            {generatedImage ? (
              <img 
                src={generatedImage} 
                alt="Generated" 
                className="max-w-full max-h-full object-contain"
              />
            ) : (
              <div className="text-center text-gray-600 p-8">
                <div className="w-16 h-16 mx-auto mb-4 opacity-20 text-gray-400">
                  <ImageIcon size={64} />
                </div>
                <p>Edited image will appear here</p>
              </div>
            )}
            
            {/* Overlay for "New" badge */}
            {generatedImage && (
              <div className="absolute top-4 right-4">
                 <span className="bg-green-600 text-white text-xs font-bold px-2 py-1 rounded shadow-lg">AI Generated</span>
              </div>
            )}
          </div>
          
          <div className="mt-4 flex justify-end">
            <button 
              disabled={!generatedImage}
              onClick={() => {
                if (generatedImage) {
                  const link = document.createElement('a');
                  link.href = generatedImage;
                  link.download = 'ai-edited-image.png';
                  link.click();
                }
              }}
              className={`px-4 py-2 rounded-lg border font-medium flex items-center gap-2 ${
                generatedImage 
                  ? 'border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white' 
                  : 'border-gray-700 text-gray-600 cursor-not-allowed'
              }`}
            >
              <Download size={18} /> Download
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};