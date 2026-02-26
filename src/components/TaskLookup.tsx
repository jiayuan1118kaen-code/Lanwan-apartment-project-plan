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
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <span className="w-1 h-5 bg-indigo-600 rounded-full"></span>
          任务管理与更新
        </h2>

        {/* Search Bar */}
        <div className="relative w-full md:w-96" ref={searchRef}>
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
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Category Select */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-600">一级工作分类</label>
          <div className="relative">
            <select 
              value={category}
              onChange={handleCategoryChange}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all appearance-none"
            >
              <option value="">请选择分类...</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>
        </div>

        {/* Subcategory Select */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-600">二级分类</label>
          <div className="relative">
            <select 
              value={subcategory}
              onChange={handleSubcategoryChange}
              disabled={!category}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed appearance-none"
            >
              <option value="">请选择二级分类...</option>
              {subcategories.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>
        </div>

        {/* Task Select */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-600">具体工作内容</label>
          <div className="relative">
            <select 
              value={taskId}
              onChange={handleTaskChange}
              disabled={!subcategory}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed appearance-none"
            >
              <option value="">请选择工作内容...</option>
              {filteredTasks.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>
        </div>
      </div>

      {/* Details & Edit Display */}
      {selectedTask ? (
        <div className="bg-gradient-to-br from-indigo-50 to-white rounded-xl p-6 border border-indigo-100 shadow-sm relative">
          
          {hasChanges && (
            <div className="absolute top-4 right-4">
              <button 
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm"
              >
                <Save className="w-4 h-4" />
                保存修改
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Progress Update */}
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                <Percent className="w-3 h-3" />
                完成进度
              </span>
              <div className="flex flex-col gap-2 mt-1">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-indigo-900">{editProgress}%</span>
                  <span className="text-xs text-gray-500">拖动更新</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  step="5"
                  value={editProgress}
                  onChange={(e) => setEditProgress(parseInt(e.target.value))}
                  className="w-full h-2 bg-indigo-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>
            </div>

            {/* Duration Display */}
            <div className="flex flex-col justify-center">
              <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                计划工期
              </span>
              <div className="flex items-center gap-3 text-indigo-900 mt-1">
                <span className="font-semibold text-2xl tracking-tight">
                  {editStart && editEnd ? Math.max(1, differenceInDays(parseISO(editEnd), parseISO(editStart)) + 1) : 0} 
                  <span className="text-base font-normal text-indigo-600 ml-1">天</span>
                </span>
              </div>
            </div>
            
            <div className="hidden lg:block"></div> {/* Spacer */}

            {/* Start Date Update */}
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                计划开始时间
              </span>
              <input 
                type="date"
                value={editStart}
                onChange={(e) => setEditStart(e.target.value)}
                className="mt-1 w-full p-2.5 bg-white border border-indigo-200 rounded-lg text-indigo-900 font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all shadow-sm"
              />
            </div>
            
            {/* End Date Update */}
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                <ArrowRight className="w-3 h-3" />
                计划结束时间
              </span>
              <input 
                type="date"
                value={editEnd}
                onChange={(e) => setEditEnd(e.target.value)}
                className="mt-1 w-full p-2.5 bg-white border border-indigo-200 rounded-lg text-indigo-900 font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all shadow-sm"
              />
            </div>

            <div className="hidden lg:block"></div> {/* Spacer */}

            {/* Actual Start Date Update */}
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-emerald-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                实际开始时间
              </span>
              <input 
                type="date"
                value={editActualStart}
                onChange={(e) => setEditActualStart(e.target.value)}
                className="mt-1 w-full p-2.5 bg-white border border-emerald-200 rounded-lg text-emerald-900 font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all shadow-sm"
              />
            </div>
            
            {/* Actual End Date Update */}
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-emerald-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                <ArrowRight className="w-3 h-3" />
                实际结束时间
              </span>
              <input 
                type="date"
                value={editActualEnd}
                onChange={(e) => setEditActualEnd(e.target.value)}
                className="mt-1 w-full p-2.5 bg-white border border-emerald-200 rounded-lg text-emerald-900 font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all shadow-sm"
              />
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
