import React from 'react';
import { ChecklistGrid } from './components/ChecklistGrid';
import { ClipboardCheck } from 'lucide-react';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-100 font-sans flex flex-col">
      {/* Navigation Bar */}
      <nav className="bg-[#0a0a0a] border-b border-neutral-800 sticky top-0 z-50">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center gap-2 text-blue-400">
                <ClipboardCheck className="h-8 w-8" />
                <span className="font-bold text-xl tracking-tight text-white">CheckList</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 max-w-full w-full px-0 sm:px-6 lg:px-8 py-6 overflow-hidden flex flex-col">
        <div className="h-full flex flex-col">
           {/* Grid Component handles its own internal layout now */}
            <ChecklistGrid />
        </div>
      </main>
    </div>
  );
};

export default App;