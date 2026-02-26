import React, { useMemo } from 'react';
import { format, differenceInDays, startOfWeek, endOfWeek, eachDayOfInterval, isToday, parseISO, isWeekend } from 'date-fns';
import { motion } from 'motion/react';
import { Task } from '../services/gemini';

interface GanttChartProps {
  tasks: Task[];
}

export const GanttChart: React.FC<GanttChartProps> = ({ tasks }) => {
  const { startDate, endDate, allDates } = useMemo(() => {
    if (tasks.length === 0) return { startDate: new Date(), endDate: new Date(), totalDays: 0, allDates: [] };

    const startDates = tasks.map(t => parseISO(t.start));
    const endDates = tasks.map(t => parseISO(t.end));
    
    const minDate = startOfWeek(new Date(Math.min(...startDates.map(d => d.getTime()))));
    const maxDate = endOfWeek(new Date(Math.max(...endDates.map(d => d.getTime()))));
    
    const dates = eachDayOfInterval({ start: minDate, end: maxDate });

    return { startDate: minDate, endDate: maxDate, totalDays: dates.length, allDates: dates };
  }, [tasks]);

  if (tasks.length === 0) return <div className="text-center p-10 text-gray-500">暂无任务</div>;

  const CELL_WIDTH = 32; // px
  const HEADER_HEIGHT = 40;

  return (
    <div className="overflow-hidden border border-gray-200 rounded-xl shadow-sm bg-white flex flex-col h-[600px]">
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar (Task List) */}
        <div className="w-[400px] flex-shrink-0 border-r border-gray-200 bg-white overflow-y-auto flex flex-col z-20 shadow-[4px_0_12px_-4px_rgba(0,0,0,0.1)]">
          <div className="sticky top-0 bg-gray-50 border-b border-gray-200 h-[40px] flex items-center px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider z-10">
            <div className="w-24 flex-shrink-0">分类</div>
            <div className="w-24 flex-shrink-0">子分类</div>
            <div className="flex-1">任务名称</div>
            <div className="w-16 text-right">工期</div>
          </div>
          <div className="divide-y divide-gray-100">
            {tasks.map((task) => {
              const taskStart = parseISO(task.start);
              const taskEnd = parseISO(task.end);
              const durationDays = differenceInDays(taskEnd, taskStart) + 1;

              return (
                <div key={task.id} className="flex items-center px-4 py-3 hover:bg-gray-50 transition-colors h-12 text-sm">
                  <div className="w-24 flex-shrink-0 truncate text-gray-500 text-xs pr-2" title={task.category}>{task.category}</div>
                  <div className="w-24 flex-shrink-0 truncate text-gray-400 text-xs pr-2" title={task.subcategory}>{task.subcategory}</div>
                  <div className="flex-1 truncate font-medium text-gray-700 pr-2" title={task.name}>{task.name}</div>
                  <div className="w-16 text-right text-gray-400 text-xs">{durationDays}d</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Content (Gantt Chart) */}
        <div className="flex-1 overflow-auto bg-white relative">
          <div className="min-w-max">
            {/* Header Row */}
            <div className="sticky top-0 z-10 flex border-b border-gray-200 bg-white h-[40px]">
              {allDates.map((date) => {
                const isWknd = isWeekend(date);
                return (
                  <div 
                    key={date.toISOString()} 
                    className={`flex-shrink-0 border-r border-gray-100 flex flex-col items-center justify-center text-[10px] ${isToday(date) ? 'bg-indigo-50 text-indigo-600 font-bold' : isWknd ? 'bg-gray-50 text-gray-400' : 'text-gray-500'}`}
                    style={{ width: CELL_WIDTH }}
                  >
                    <span>{format(date, 'd')}</span>
                    <span className="opacity-60">{format(date, 'EEEEE')}</span>
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
                    className={`flex-shrink-0 border-r border-gray-100 h-full ${isToday(date) ? 'bg-indigo-50/30' : isWeekend(date) ? 'bg-gray-50/50' : ''}`}
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
                  <div key={task.id} className="h-12 relative flex items-center border-b border-transparent">
                    <motion.div
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: durationDays * CELL_WIDTH - 6 }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                      className={`absolute h-5 rounded-full shadow-sm text-[10px] text-white flex items-center px-2 whitespace-nowrap overflow-hidden z-0
                        ${task.progress === 100 ? 'bg-emerald-500' : task.progress > 0 ? 'bg-indigo-500' : 'bg-slate-400'}
                        hover:ring-2 hover:ring-offset-1 hover:ring-indigo-400 cursor-pointer transition-all
                      `}
                      style={{
                        left: offsetDays * CELL_WIDTH + 3,
                      }}
                      title={`${task.name}: ${task.start} - ${task.end}`}
                    >
                      {durationDays * CELL_WIDTH > 30 && <span>{task.progress}%</span>}
                    </motion.div>
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
