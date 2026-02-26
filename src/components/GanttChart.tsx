import React, { useState, useMemo, useRef, useEffect } from 'react';
import { format, differenceInDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, parseISO, isWeekend } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { motion } from 'motion/react';
import Select from 'react-select';
import { Task } from '../services/gemini';
import { Calendar as CalendarIcon, LayoutDashboard } from 'lucide-react';

interface GanttChartProps {
  tasks: Task[];
  onTaskClick?: (taskId: string) => void;
  selectedTaskId?: string;
}

export const GanttChart: React.FC<GanttChartProps> = ({ tasks, onTaskClick, selectedTaskId }) => {
  const rightScrollRef = useRef<HTMLDivElement>(null);
  const leftScrollRef = useRef<HTMLDivElement>(null);
  const isSyncingLeft = useRef(false);
  const isSyncingRight = useRef(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showSidebar, setShowSidebar] = useState(true);

  const [selectedMilestoneNames, setSelectedMilestoneNames] = useState<string[]>([
    '非居改保认定书',
    '全套施工图',
    '样板间评审',
    '施工许可证',
    '空气检测及报告',
    '联合验收',
    '开业'
  ]);

  const keyMilestones = useMemo(() => {
    return tasks
      .filter(task => selectedMilestoneNames.includes(task.name))
      .sort((a, b) => parseISO(a.start).getTime() - parseISO(b.start).getTime());
  }, [tasks, selectedMilestoneNames]);

  const taskOptions = useMemo(() => {
    return tasks.map(task => ({ value: task.name, label: task.name }));
  }, [tasks]);

  const { startDate, endDate, allDates } = useMemo(() => {
    if (tasks.length === 0) return { startDate: new Date(), endDate: new Date(), totalDays: 0, allDates: [] };

    const startDates = tasks.flatMap(t => [parseISO(t.start), t.actualStart ? parseISO(t.actualStart) : null].filter(Boolean) as Date[]);
    const endDates = tasks.flatMap(t => [parseISO(t.end), t.actualEnd ? parseISO(t.actualEnd) : null].filter(Boolean) as Date[]);
    
    const minDate = startOfWeek(new Date(Math.min(...startDates.map(d => d.getTime()))));
    const maxDate = endOfWeek(new Date(Math.max(...endDates.map(d => d.getTime()))));
    
    const dates = eachDayOfInterval({ start: minDate, end: maxDate });

    return { startDate: minDate, endDate: maxDate, totalDays: dates.length, allDates: dates };
  }, [tasks]);

  const CELL_WIDTH = 40; // Increased width for M/d format

  const scrollToDate = (targetDate: Date) => {
    if (!rightScrollRef.current) return;
    
    const offsetDays = differenceInDays(targetDate, startDate);
    
    if (offsetDays < 0 || offsetDays >= allDates.length) return;

    const containerWidth = rightScrollRef.current.clientWidth;
    const scrollLeft = (offsetDays * CELL_WIDTH) - (containerWidth / 2) + (CELL_WIDTH / 2);

    rightScrollRef.current.scrollTo({
      left: Math.max(0, scrollLeft),
      behavior: 'smooth'
    });
  };

  // Scroll to selected date on mount or when it changes (if within range)
  useEffect(() => {
    scrollToDate(selectedDate);
  }, [selectedDate, startDate, allDates.length]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = parseISO(e.target.value);
    setSelectedDate(newDate);
  };

  const handleLeftScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (isSyncingLeft.current) {
      isSyncingLeft.current = false;
      return;
    }
    isSyncingRight.current = true;
    if (rightScrollRef.current) {
      rightScrollRef.current.scrollTop = e.currentTarget.scrollTop;
    }
  };

  const handleRightScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (isSyncingRight.current) {
      isSyncingRight.current = false;
      return;
    }
    isSyncingLeft.current = true;
    if (leftScrollRef.current) {
      leftScrollRef.current.scrollTop = e.currentTarget.scrollTop;
    }
  };

  if (tasks.length === 0) return <div className="text-center p-10 text-gray-500">暂无任务</div>;

  return (
    <div className="flex flex-col h-[500px] md:h-[600px] border border-gray-200 rounded-xl shadow-sm bg-white overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-4 py-2 border-b border-gray-200 bg-gray-50/50 gap-2">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowSidebar(!showSidebar)}
            className="p-1.5 hover:bg-gray-200 rounded-md transition-colors text-gray-600 md:hidden"
            title={showSidebar ? "隐藏列表" : "显示列表"}
          >
            <LayoutDashboard className="w-4 h-4" />
          </button>
          <div className="text-[10px] sm:text-sm text-gray-500">
            项目周期: {format(startDate, 'yyyy/M/d', { locale: zhCN })} - {format(endDate, 'yyyy/M/d', { locale: zhCN })}
          </div>
        </div>
        
        <div className="relative w-full sm:w-auto">
          <input 
            type="date" 
            value={format(selectedDate, 'yyyy-MM-dd')}
            onChange={handleDateChange}
            className="w-full sm:w-auto bg-white border border-gray-300 hover:border-indigo-500 text-gray-700 rounded-lg text-xs font-medium transition-colors shadow-sm px-3 py-1.5 cursor-pointer"
          />
        </div>
      </div>

      {/* Key Milestones */}
      <div className="px-4 py-3 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-semibold text-gray-700">重要节点</h3>
          <div className="w-full max-w-xs text-xs">
            <Select
              isMulti
              options={taskOptions}
              value={selectedMilestoneNames.map(name => ({ value: name, label: name }))}
              onChange={(selectedOptions) => {
                setSelectedMilestoneNames(selectedOptions.map(option => option.value));
              }}
              placeholder="选择要展示的节点..."
              styles={{
                control: (base) => ({ ...base, minHeight: '30px', height: '30px' }),
                valueContainer: (base) => ({ ...base, height: '30px', padding: '0 6px' }),
                input: (base) => ({ ...base, margin: '0px' }),
                indicatorSeparator: () => ({ display: 'none' }),
                indicatorsContainer: (base) => ({ ...base, height: '30px' }),
              }}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-x-4 gap-y-2 text-[10px]">
          {keyMilestones.map(task => (
            <div key={task.id} className="bg-violet-50 p-1.5 rounded-md border border-violet-200">
              <p className="font-bold text-violet-800 truncate" title={task.name}>{task.name}</p>
              <p className="text-violet-500">
                <span className="font-medium">始:</span> {task.start ? format(parseISO(task.start), 'M/d') : '-'}
                <span className="mx-1">|</span>
                <span className="font-medium">终:</span> {task.end ? format(parseISO(task.end), 'M/d') : '-'}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Left Sidebar (Task List) */}
        <div className={`
          ${showSidebar ? 'w-[180px] sm:w-[460px]' : 'w-0'} 
          transition-all duration-300 ease-in-out
          flex-shrink-0 border-r border-gray-200 bg-white flex flex-col z-20 shadow-[4px_0_12px_-4px_rgba(0,0,0,0.1)] overflow-hidden
        `}>
          <div className="bg-gray-50 border-b border-gray-200 h-[40px] flex items-center px-2 sm:px-4 text-[9px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider flex-shrink-0">
            <div className="w-10 sm:w-20 flex-shrink-0">分类</div>
            <div className="hidden sm:block w-24 flex-shrink-0">子分类</div>
            <div className="flex-1">任务名称</div>
            <div className="w-8 sm:w-16 text-right">计划</div>
            <div className="hidden sm:block w-16 text-right">实际</div>
          </div>
          <div 
            className="flex-1 overflow-y-auto divide-y divide-gray-100"
            ref={leftScrollRef}
            onScroll={handleLeftScroll}
          >
            {tasks.map((task) => {
              const taskStart = parseISO(task.start);
              const taskEnd = parseISO(task.end);
              const durationDays = differenceInDays(taskEnd, taskStart) + 1;
              
              let actualDurationText = '-';
              if (task.actualStart && task.actualEnd) {
                actualDurationText = `${differenceInDays(parseISO(task.actualEnd), parseISO(task.actualStart)) + 1}天`;
              }

              return (
                <div 
                  key={task.id} 
                  className={`flex items-center px-2 sm:px-4 py-3 hover:bg-gray-50 transition-colors h-16 text-[9px] sm:text-sm border-b border-gray-100 cursor-pointer ${selectedTaskId === task.id ? 'bg-indigo-50/50' : ''}`}
                  onClick={() => onTaskClick?.(task.id)}
                >
                  <div className="w-10 sm:w-20 flex-shrink-0 truncate text-gray-500 pr-1 sm:pr-2" title={task.category}>{task.category}</div>
                  <div className="hidden sm:block w-24 flex-shrink-0 truncate text-gray-400 text-xs pr-2" title={task.subcategory}>{task.subcategory}</div>
                  <div className="flex-1 truncate text-gray-500 pr-1 sm:pr-2 font-medium" title={task.name}>{task.name}</div>
                  <div className="w-8 sm:w-16 text-right text-gray-400">{durationDays}d</div>
                  <div className="hidden sm:block w-16 text-right text-emerald-500 text-xs">{actualDurationText}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Content (Gantt Chart) */}
        <div 
          ref={rightScrollRef}
          onScroll={handleRightScroll}
          className="flex-1 overflow-auto bg-white relative"
        >
          <div className="min-w-max">
            {/* Header Row */}
            <div className="sticky top-0 z-10 flex border-b border-gray-200 bg-white h-[40px]">
              {allDates.map((date) => {
                const isWknd = isWeekend(date);
                const isSelected = isSameDay(date, selectedDate);
                return (
                  <div 
                    key={date.toISOString()} 
                    className={`flex-shrink-0 border-r border-gray-100 flex flex-col items-center justify-center text-[10px] 
                      ${isSelected ? 'bg-blue-100 text-blue-700 font-bold' : isWknd ? 'bg-gray-50 text-gray-400' : 'text-gray-500'}
                    `}
                    style={{ width: CELL_WIDTH }}
                  >
                    <span>{format(date, 'M/d')}</span>
                  </div>
                );
              })}
            </div>

            {/* Task Rows */}
            <div className="relative">
              {/* Background Grid */}
              <div className="absolute inset-0 flex pointer-events-none h-full">
                {allDates.map((date) => (
                  <div 
                    key={date.toISOString()} 
                    className={`flex-shrink-0 border-r border-gray-100 h-full 
                      ${isSameDay(date, selectedDate) ? 'bg-blue-100/30 ring-1 ring-blue-200/50 z-0' : isWeekend(date) ? 'bg-gray-50/50' : ''}
                    `}
                    style={{ width: CELL_WIDTH }}
                  />
                ))}
              </div>

              {/* Bars */}
              {tasks.map((task) => {
                const taskStart = parseISO(task.start);
                const taskEnd = parseISO(task.end);
                const offsetDays = differenceInDays(taskStart, startDate);
                const durationDays = differenceInDays(taskEnd, taskStart) + 1;

                return (
                  <div 
                    key={task.id} 
                    className={`h-16 relative flex flex-col justify-center border-b border-gray-100 z-10 group hover:bg-gray-50/50 transition-colors cursor-pointer ${selectedTaskId === task.id ? 'bg-indigo-50/30' : ''}`}
                    onClick={() => onTaskClick?.(task.id)}
                  >
                    {/* Planned Bar */}
                    <motion.div
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: durationDays * CELL_WIDTH - 6 }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                      className="absolute top-2 h-3.5 rounded-full text-[9px] flex items-center px-2 whitespace-nowrap overflow-hidden bg-gray-100 border border-gray-300 text-gray-500"
                      style={{ left: offsetDays * CELL_WIDTH + 3 }}
                      title={`计划: ${task.start} - ${task.end}`}
                    >
                      {durationDays * CELL_WIDTH > 30 && <span>计划</span>}
                    </motion.div>

                    {/* Actual Bar */}
                    {task.actualStart && (
                      <motion.div
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ 
                          opacity: 1, 
                          width: (task.actualEnd ? differenceInDays(parseISO(task.actualEnd), parseISO(task.actualStart)) + 1 : 1) * CELL_WIDTH - 6 
                        }}
                        transition={{ duration: 0.4, ease: "easeOut", delay: 0.1 }}
                        className={`absolute bottom-2 h-5 rounded-full shadow-sm text-[10px] text-white flex items-center px-2 whitespace-nowrap overflow-hidden
                          ${task.progress === 100 ? 'bg-emerald-500' : task.progress > 0 ? 'bg-indigo-500' : 'bg-slate-400'}
                          hover:ring-2 hover:ring-offset-1 hover:ring-indigo-400 cursor-pointer transition-all
                        `}
                        style={{ left: differenceInDays(parseISO(task.actualStart), startDate) * CELL_WIDTH + 3 }}
                        title={`实际: ${task.actualStart} - ${task.actualEnd || '进行中'}`}
                      >
                        {((task.actualEnd ? differenceInDays(parseISO(task.actualEnd), parseISO(task.actualStart)) + 1 : 1) * CELL_WIDTH > 30) && <span>{task.progress}%</span>}
                      </motion.div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
