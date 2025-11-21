import React, { useState, useRef } from 'react';
import { ChecklistItem, DayStatus } from '../types';
import { Check, X, Plus, Calendar, Edit2, ChevronLeft, ChevronRight } from 'lucide-react';

const DAYS_IN_MONTH = 31;
const DAYS_ARRAY = Array.from({ length: DAYS_IN_MONTH }, (_, i) => i + 1);
const MONTHS = [
  "January", "February", "March", "April", "May", "June", 
  "July", "August", "September", "October", "November", "December"
];

// Flat initial data with empty history
const INITIAL_ITEMS: ChecklistItem[] = [
  { id: 'i1', title: 'Vitamin D Intake', history: {} },
  { id: 'i2', title: 'Morning Workout', history: {} },
  { id: 'i3', title: 'Weight Check', history: {} },
  { id: 'i4', title: 'Mood Tracking', history: {} },
  { id: 'i5', title: 'Reading (30 mins)', history: {} },
  { id: 'i6', title: 'Meditation', history: {} },
  { id: 'i7', title: 'Coding Practice', history: {} },
];

export const ChecklistGrid: React.FC = () => {
  const [items, setItems] = useState<ChecklistItem[]>(INITIAL_ITEMS);
  const [newItemName, setNewItemName] = useState('');
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const inputRef = useRef<HTMLInputElement>(null);

  const getMonthYearKey = (date: Date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  };

  const getDateKey = (date: Date, day: number) => {
    return `${getMonthYearKey(date)}-${String(day).padStart(2, '0')}`;
  };

  const isCurrentDay = (day: number) => {
    const today = new Date();
    return today.getDate() === day &&
           today.getMonth() === currentDate.getMonth() &&
           today.getFullYear() === currentDate.getFullYear();
  };

  const toggleDay = (itemId: string, day: number) => {
    const dateKey = getDateKey(currentDate, day);
    
    setItems(prev => prev.map(item => {
      if (item.id !== itemId) return item;
      
      const currentStatus = item.history[dateKey];
      let newStatus: DayStatus;

      // Cycle: null -> 'done' -> 'missed' -> null
      if (currentStatus === 'done') newStatus = 'missed';
      else if (currentStatus === 'missed') newStatus = null;
      else newStatus = 'done';

      const newHistory = { ...item.history };
      if (newStatus === null) {
        delete newHistory[dateKey];
      } else {
        newHistory[dateKey] = newStatus;
      }

      return { ...item, history: newHistory };
    }));
  };

  const calculatePercentage = (item: ChecklistItem) => {
    let doneCount = 0;
    for (let day = 1; day <= 31; day++) {
      const key = getDateKey(currentDate, day);
      if (item.history[key] === 'done') {
        doneCount++;
      }
    }
    return Math.round((doneCount / 31) * 100);
  };

  const handleAddItem = () => {
    if (!newItemName.trim()) return;
    setItems(prev => [
      ...prev, 
      {
        id: Math.random().toString(36).substr(2, 9),
        title: newItemName.trim(),
        history: {}
      }
    ]);
    setNewItemName('');
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddItem();
    }
  };

  const deleteItem = (itemId: string) => {
    setItems(prev => prev.filter(i => i.id !== itemId));
  };

  const focusInput = () => {
    inputRef.current?.focus();
  };

  const startEditing = (item: ChecklistItem) => {
    setEditingId(item.id);
    setEditTitle(item.title);
  };

  const saveEdit = () => {
    if (!editingId) return;
    if (editTitle.trim()) {
        setItems(prev => prev.map(i => i.id === editingId ? { ...i, title: editTitle.trim() } : i));
    }
    setEditingId(null);
    setEditTitle('');
  };

  const cancelEdit = () => {
      setEditingId(null);
      setEditTitle('');
  };

  const handleEditKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') saveEdit();
      if (e.key === 'Escape') cancelEdit();
  };

  const changeMonth = (offset: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + offset);
    setCurrentDate(newDate);
  };

  const setSpecificMonth = (monthIndex: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(monthIndex);
    setCurrentDate(newDate);
  }

  return (
    <div className="flex flex-col h-full bg-[#0a0a0a] text-gray-200">
      {/* HEADER SECTION - Outside Table */}
      <div className="flex-none pb-4 bg-[#0a0a0a] flex flex-col gap-4">
        
        {/* 12 Months Navigation */}
        <div className="flex flex-wrap gap-1 items-center justify-start pb-2 border-b border-neutral-800/50">
          {MONTHS.map((month, index) => {
            const isSelected = currentDate.getMonth() === index;
            return (
              <button
                key={month}
                onClick={() => setSpecificMonth(index)}
                className={`px-3 py-1.5 text-xs sm:text-sm rounded-md transition-colors font-medium ${
                  isSelected 
                    ? 'bg-neutral-800 text-blue-400' 
                    : 'text-gray-400 hover:text-gray-100 hover:bg-neutral-900'
                }`}
              >
                {month}
              </button>
            );
          })}
        </div>

        {/* Month Control & Add Task Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-neutral-900 rounded-lg p-1 border border-neutral-800">
              <button onClick={() => changeMonth(-1)} className="p-1 hover:bg-neutral-800 rounded text-gray-400 hover:text-white transition-colors">
                <ChevronLeft size={20} />
              </button>
              <div className="flex items-center gap-2 px-2 min-w-[140px] justify-center font-bold text-lg text-gray-100">
                <Calendar className="text-blue-400" size={18} />
                <span>{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
              </div>
              <button onClick={() => changeMonth(1)} className="p-1 hover:bg-neutral-800 rounded text-gray-400 hover:text-white transition-colors">
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
          
          <button 
            onClick={focusInput}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-lg"
          >
            <Plus size={16} />
            Add Task
          </button>
        </div>
      </div>

      {/* TABLE SECTION - Inside Border */}
      <div className="flex-1 overflow-auto custom-scrollbar bg-[#0a0a0a] relative border border-neutral-800 rounded-lg shadow-xl">
        <div className="min-w-max pb-10">
          
          {/* Grid Header */}
          <div className="flex sticky top-0 z-20 bg-[#0a0a0a]">
            <div className="sticky left-0 z-30 w-80 flex-shrink-0 p-3 font-bold text-gray-400 bg-[#0a0a0a] flex items-end border-b border-neutral-800">
              Tasks
            </div>
            {DAYS_ARRAY.map(day => {
              const isTodayCell = isCurrentDay(day);
              return (
                <div 
                  key={day} 
                  className={`w-10 flex-shrink-0 flex flex-col items-center justify-end py-2 relative border-b border-neutral-800 ${isTodayCell ? 'bg-[#111417]' : 'bg-[#0a0a0a]'}`}
                >
                  {isTodayCell && (
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -mt-1.5">
                       {/* Green Triangle Pointer - Bolder */}
                       <svg width="16" height="10" viewBox="0 0 16 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                         <path d="M8 10L0 0H16L8 10Z" fill="#22c55e"/>
                       </svg>
                    </div>
                  )}
                  <span className={`text-xs font-medium ${isTodayCell ? 'text-green-500 font-bold' : 'text-gray-400'}`}>
                    {day}
                  </span>
                </div>
              );
            })}
            {/* Percentage Column Header */}
            <div className="sticky right-0 z-20 w-20 flex-shrink-0 flex flex-col items-center justify-end bg-[#0a0a0a] p-2 font-bold text-blue-400 border-b border-neutral-800 border-l border-neutral-800">
              Score
            </div>
          </div>

          {/* Grid Body */}
          <div className="divide-y divide-neutral-800">
            {items.map((item) => {
              const percentage = calculatePercentage(item);
              return (
                <div key={item.id} className="flex hover:bg-neutral-900/50 transition-colors group">
                  {/* Item Name Cell */}
                  <div className="sticky left-0 z-10 w-80 flex-shrink-0 p-3 border-r border-neutral-800 bg-[#0a0a0a] text-sm text-gray-300 flex justify-between items-center shadow-[2px_0_5px_-2px_rgba(0,0,0,0.3)] h-12">
                     {editingId === item.id ? (
                        <input 
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            onBlur={saveEdit}
                            onKeyDown={handleEditKeyDown}
                            autoFocus
                            className="w-full bg-neutral-900 text-white border border-blue-500 rounded px-2 py-1 focus:outline-none text-sm"
                        />
                     ) : (
                        <>
                            <span className="truncate pr-2 font-medium flex-1 h-full flex items-center cursor-default">{item.title}</span>
                            <div className="flex items-center gap-1">
                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        startEditing(item);
                                    }}
                                    className="text-yellow-400 hover:text-yellow-300 transition-colors p-1"
                                    title="Rename task"
                                >
                                    <Edit2 size={14} />
                                </button>
                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        deleteItem(item.id);
                                    }}
                                    className="text-red-400 hover:text-red-300 transition-colors p-1"
                                    title="Delete task"
                                >
                                    <X size={14} strokeWidth={3} />
                                </button>
                            </div>
                        </>
                     )}
                  </div>

                  {/* Day Cells */}
                  {DAYS_ARRAY.map(day => {
                    const dateKey = getDateKey(currentDate, day);
                    const status = item.history[dateKey];
                    const isTodayCell = isCurrentDay(day);
                    return (
                      <div 
                        key={day} 
                        className={`w-10 flex-shrink-0 border-r border-neutral-800 flex items-center justify-center relative ${isTodayCell ? 'bg-[#111417]' : ''}`}
                      >
                        <button
                          onClick={() => toggleDay(item.id, day)}
                          className={`w-full h-full flex items-center justify-center transition-all duration-200 focus:outline-none hover:bg-neutral-800/30`}
                        >
                          {status === 'done' && (
                            <Check size={18} className="text-green-500" strokeWidth={3} />
                          )}
                          {status === 'missed' && (
                            <X size={18} className="text-red-500" strokeWidth={3} />
                          )}
                          {!status && <div className="w-1.5 h-1.5 rounded-full bg-neutral-800 opacity-0 group-hover:opacity-50 transition-opacity" />}
                        </button>
                      </div>
                    );
                  })}

                  {/* Percentage Cell */}
                  <div className="sticky right-0 z-10 w-20 flex-shrink-0 border-l border-neutral-800 bg-[#0a0a0a] flex items-center justify-center font-bold text-sm shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.3)]">
                    <span className={`${percentage === 100 ? 'text-green-500' : percentage > 0 ? 'text-blue-400' : 'text-gray-700'}`}>
                      {percentage}%
                    </span>
                  </div>
                </div>
              );
            })}

            {/* Add Task Input Row */}
            <div className="flex bg-[#0a0a0a] group">
              <div className="sticky left-0 z-10 w-80 flex-shrink-0 p-3 border-r border-neutral-800 bg-[#0a0a0a] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.3)] h-12 flex items-center">
                <div className="relative w-full">
                  <input
                    ref={inputRef}
                    type="text"
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Add a new task..."
                    className="w-full bg-neutral-900 border border-neutral-700 text-white text-sm rounded px-3 py-1.5 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 placeholder-gray-600 transition-all"
                  />
                  {newItemName && (
                    <button
                      onClick={handleAddItem}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-green-400 hover:text-green-300"
                    >
                      <Plus size={16} />
                    </button>
                  )}
                </div>
              </div>
              {/* Placeholder cells for alignment */}
              {DAYS_ARRAY.map(day => {
                 const isTodayCell = isCurrentDay(day);
                 return (
                    <div key={day} className={`w-10 flex-shrink-0 border-r border-neutral-800 ${isTodayCell ? 'bg-[#111417]' : 'bg-neutral-900/10'}`}></div>
                 )
              })}
              <div className="sticky right-0 w-20 flex-shrink-0 border-l border-neutral-800 bg-[#0a0a0a]"></div>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
};