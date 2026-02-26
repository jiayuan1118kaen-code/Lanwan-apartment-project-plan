import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Task } from '../services/gemini';
import { format, differenceInDays, parseISO } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { Calendar, Clock, ArrowRight, Search, Percent, Save } from 'lucide-react';

interface TaskLookupProps {
  tasks: Task[];
  onUpdateTask?: (taskId: string, updates: Partial<Task>) => void;
  selectedTaskId?: string;
  onSelectTask?: (taskId: string) => void;
}

export const TaskLookup: React.FC<TaskLookupProps> = ({ tasks, onUpdateTask, selectedTaskId, onSelectTask }) => {
  const [category, setCategory] = useState<string>('');
  const [subcategory, setSubcategory] = useState<string>('');
  const [taskId, setTaskId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Edit state
  const [editProgress, setEditProgress] = useState<number>(0);
  const [editStart, setEditStart] = useState<string>('');
  const [editEnd, setEditEnd] = useState<string>('');
  const [editActualStart, setEditActualStart] = useState<string>('');
  const [editActualEnd, setEditActualEnd] = useState<string>('');
  const [autoProgress, setAutoProgress] = useState<boolean>(true);

  const categories = useMemo(() => {
    return Array.from(new Set(tasks.map(t => t.category || '未分类')));
  }, [tasks]);

  const subcategories = useMemo(() => {
    if (!category) return [];
    return Array.from(new Set(tasks
      .filter(t => t.category === category)
      .map(t => t.subcategory || '未分类')
    ));
  }, [tasks, category]);

  const filteredTasks = useMemo(() => {
    if (!category || !subcategory) return [];
    return tasks.filter(t => t.category === category && t.subcategory === subcategory);
  }, [tasks, category, subcategory]);

  const selectedTask = useMemo(() => {
    return tasks.find(t => t.id === taskId);
  }, [tasks, taskId]);

  useEffect(() => {
    if (selectedTaskId) {
      const task = tasks.find(t => t.id === selectedTaskId);
      if (task) {
        setCategory(task.category || '');
        setSubcategory(task.subcategory || '');
        setTaskId(task.id);
      }
    } else {
      setTaskId('');
    }
  }, [selectedTaskId, tasks]);

  // Sync edit state when a new task is selected
  useEffect(() => {
    if (selectedTask) {
      setEditProgress(selectedTask.progress);
      setEditStart(selectedTask.start);
      setEditEnd(selectedTask.end);
      setEditActualStart(selectedTask.actualStart || '');
      setEditActualEnd(selectedTask.actualEnd || '');
    }
  }, [selectedTask]);

  // Auto-calculate progress
  useEffect(() => {
    if (autoProgress && editActualStart && editActualEnd) {
      const start = parseISO(editActualStart);
      const end = parseISO(editActualEnd);
      const today = new Date();
      
      if (today < start) {
        setEditProgress(0);
      } else if (today > end) {
        setEditProgress(100);
      } else {
        const totalDuration = differenceInDays(end, start);
        const elapsedDuration = differenceInDays(today, start);
        if (totalDuration > 0) {
          const progress = Math.round((elapsedDuration / totalDuration) * 100);
          setEditProgress(Math.min(100, Math.max(0, progress)));
        } else {
          setEditProgress(100); // If start and end are same day, it's 100% done
        }
      }
    } else if (autoProgress) {
      setEditProgress(0);
    }
  }, [autoProgress, editActualStart, editActualEnd]);

  const searchResults = useMemo(() => {
    if (!searchTerm.trim()) return [];
    return tasks.filter(t => 
      t.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [tasks, searchTerm]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCategory(e.target.value);
    setSubcategory('');
    setTaskId('');
    if (onSelectTask) onSelectTask('');
  };

  const handleSubcategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSubcategory(e.target.value);
    setTaskId('');
    if (onSelectTask) onSelectTask('');
  };

  const handleTaskChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newTaskId = e.target.value;
    setTaskId(newTaskId);
    if (onSelectTask) onSelectTask(newTaskId);
  };

  const handleSearchSelect = (task: Task) => {
    setCategory(task.category || '');
    setSubcategory(task.subcategory || '');
    setTaskId(task.id);
    setSearchTerm('');
    setShowSuggestions(false);
    if (onSelectTask) onSelectTask(task.id);
  };

  const handleSave = () => {
    if (selectedTask && onUpdateTask) {
      onUpdateTask(selectedTask.id, {
        progress: editProgress,
        start: editStart,
        end: editEnd,
        actualStart: editActualStart || undefined,
        actualEnd: editActualEnd || undefined
      });
    }
  };

  const hasChanges = selectedTask && (
    editProgress !== selectedTask.progress ||
    editStart !== selectedTask.start ||
    editEnd !== selectedTask.end ||
    editActualStart !== (selectedTask.actualStart || '') ||
    editActualEnd !== (selectedTask.actualEnd || '')
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-sm">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-4 gap-4">
        <h2 className="text-base font-bold text-gray-800 flex items-center gap-2 flex-shrink-0">
          <span className="w-1 h-4 bg-indigo-600 rounded-full"></span>
          任务管理与更新
        </h2>

        {/* Search Bar */}
        <div className="relative w-full lg:w-auto lg:flex-1" ref={searchRef}>
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              placeholder="搜索任务名称..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
          
          {/* Suggestions Dropdown */}
          {showSuggestions && searchTerm.trim() && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-xl shadow-lg z-50 max-h-60 overflow-y-auto">
              {searchResults.length > 0 ? (
                searchResults.map(task => (
                  <button
                    key={task.id}
                    onClick={() => handleSearchSelect(task)}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0"
                  >
                    <div className="text-sm font-medium text-gray-700">{task.name}</div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      {task.category} {task.subcategory ? `> ${task.subcategory}` : ''}
                    </div>
                  </button>
                ))
              ) : (
                <div className="px-4 py-3 text-sm text-gray-400 text-center">
                  未找到相关任务
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4 mb-4">
        <div className="grid grid-cols-2 gap-2 xl:col-span-2">
          {/* Category Select */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-500">一级分类</label>
            <div className="relative">
              <select 
                value={category}
                onChange={handleCategoryChange}
                className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 text-xs focus:ring-1 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all appearance-none"
              >
                <option value="">选择...</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
          </div>

          {/* Subcategory Select */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-500">二级分类</label>
            <div className="relative">
              <select 
                value={subcategory}
                onChange={handleSubcategoryChange}
                disabled={!category}
                className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 text-xs focus:ring-1 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed appearance-none"
              >
                <option value="">选择...</option>
                {subcategories.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
          </div>
        </div>

        {/* Task Select */}
        <div className="space-y-1 xl:col-span-3">
          <label className="text-xs font-medium text-gray-500">具体工作内容</label>
          <div className="relative">
            <select 
              value={taskId}
              onChange={handleTaskChange}
              disabled={!subcategory}
              className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 text-xs focus:ring-1 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed appearance-none"
            >
              <option value="">请选择工作内容...</option>
              {filteredTasks.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
            <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>
        </div>
      </div>

      {/* Details & Edit Display */}
      {selectedTask ? (
        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200 relative">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <div className="flex-1 min-w-0">
              <h3 className="text-xs font-bold text-gray-800 truncate" title={selectedTask.name}>{selectedTask.name}</h3>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider">{selectedTask.category} / {selectedTask.subcategory}</p>
            </div>
            {hasChanges && (
              <button 
                onClick={handleSave}
                className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-medium hover:bg-indigo-700 transition-colors shadow-sm w-full sm:w-auto flex-shrink-0"
              >
                <Save className="w-3 h-3" />
                保存
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
            
            {/* Left Column: Progress & Duration */}
            <div className="space-y-3">
              {/* Progress Update */}
              <div className="flex flex-col">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                    <Percent className="w-2.5 h-2.5" />
                    完成进度
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">自动</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={autoProgress} onChange={() => setAutoProgress(!autoProgress)} className="sr-only peer" />
                      <div className="w-7 h-4 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input 
                    type="range" min="0" max="100" step="5"
                    value={editProgress}
                    onChange={(e) => setEditProgress(parseInt(e.target.value))}
                    disabled={autoProgress}
                    className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <span className="text-lg font-bold text-indigo-700 w-12 text-right">{editProgress}%</span>
                </div>
              </div>

              {/* Duration Display */}
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-white border border-gray-200 rounded-md p-2 text-center">
                  <div className="text-[10px] text-gray-400">计划工期</div>
                  <div className="font-semibold text-base tracking-tight text-gray-700">
                    {editStart && editEnd ? Math.max(1, differenceInDays(parseISO(editEnd), parseISO(editStart)) + 1) : 0} 
                    <span className="text-xs font-normal ml-0.5">天</span>
                  </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-md p-2 text-center">
                  <div className="text-[10px] text-gray-400">实际工期</div>
                  <div className="font-semibold text-base tracking-tight text-emerald-700">
                    {editActualStart && editActualEnd ? Math.max(1, differenceInDays(parseISO(editActualEnd), parseISO(editActualStart)) + 1) : '-'} 
                    {editActualStart && editActualEnd && <span className="text-xs font-normal ml-0.5">天</span>}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Dates */}
            <div className="space-y-2">
              {/* Planned Dates */}
              <div className="bg-white p-2 rounded-md border border-gray-200">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-semibold text-gray-500 flex-shrink-0">计划</span>
                  <input 
                    type="date"
                    value={editStart}
                    onChange={(e) => setEditStart(e.target.value)}
                    className="w-full p-1 bg-white border-gray-200 rounded text-gray-800 font-medium text-xs focus:ring-1 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all min-w-[120px]"
                  />
                  <ArrowRight className="w-3 h-3 text-gray-300 flex-shrink-0" />
                  <input 
                    type="date"
                    value={editEnd}
                    onChange={(e) => setEditEnd(e.target.value)}
                    className="w-full p-1 bg-white border-gray-200 rounded text-gray-800 font-medium text-xs focus:ring-1 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all min-w-[120px]"
                  />
                </div>
              </div>

              {/* Actual Dates */}
              <div className="bg-white p-2 rounded-md border border-gray-200">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-semibold text-emerald-600 flex-shrink-0">实际</span>
                  <input 
                    type="date"
                    value={editActualStart}
                    onChange={(e) => setEditActualStart(e.target.value)}
                    className="w-full p-1 bg-white border-gray-200 rounded text-emerald-800 font-medium text-xs focus:ring-1 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all min-w-[120px]"
                  />
                  <ArrowRight className="w-3 h-3 text-gray-300 flex-shrink-0" />
                  <input 
                    type="date"
                    value={editActualEnd}
                    onChange={(e) => setEditActualEnd(e.target.value)}
                    className="w-full p-1 bg-white border-gray-200 rounded text-emerald-800 font-medium text-xs focus:ring-1 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all min-w-[120px]"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        ) : (
        <div className="bg-gray-50 rounded-xl p-8 border border-dashed border-gray-200 text-center">
          <p className="text-gray-400 text-sm">请选择完整的工作内容以查看或更新计划详情</p>
        </div>
      )}
    </div>
  );
};
