/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { TaskLookup } from './components/TaskLookup';
import { GanttChart } from './components/GanttChart';
import { ProjectPlan, Task } from './services/gemini';
import { LayoutDashboard, Calendar, CheckCircle2, Download, Upload, FileDown } from 'lucide-react';
import { DEMO_PROJECT_PLAN } from './data/demoData';
import { addDays, differenceInDays, parseISO, format } from 'date-fns';
import * as XLSX from 'xlsx';

export default function App() {
  const [plan, setPlan] = useState<ProjectPlan>(DEMO_PROJECT_PLAN);
  const [selectedTaskId, setSelectedTaskId] = useState<string>('');
  const [importModal, setImportModal] = useState<{ show: boolean; tasks: Task[] }>({ show: false, tasks: [] });

  const handleUpdateTask = (taskId: string, updates: Partial<Task>) => {
    setPlan(prev => {
      const newTasks = [...prev.tasks];
      const taskIndex = newTasks.findIndex(t => t.id === taskId);
      if (taskIndex === -1) return prev;
      
      const oldTask = newTasks[taskIndex];
      const updatedTask = { ...oldTask, ...updates };
      newTasks[taskIndex] = updatedTask;

      // Cascade logic for dependencies (FS: Finish-to-Start)
      if (updates.start || updates.end) {
        const taskMap = new Map<string, Task>(newTasks.map(t => [t.id, t]));
        const dependentsMap = new Map<string, string[]>();
        
        newTasks.forEach(t => {
          if (t.dependencies) {
            t.dependencies.forEach(depId => {
              if (!dependentsMap.has(depId)) dependentsMap.set(depId, []);
              dependentsMap.get(depId)!.push(t.id);
            });
          }
        });

        const queue = [taskId];
        while (queue.length > 0) {
          const currentId = queue.shift()!;
          const dependents = dependentsMap.get(currentId) || [];
          
          for (const depId of dependents) {
            const depTask = taskMap.get(depId)!;
            let maxDependencyEnd: Date | null = null;
            
            for (const reqId of depTask.dependencies || []) {
              const reqTask = taskMap.get(reqId);
              if (reqTask) {
                const reqEnd = parseISO(reqTask.end);
                if (!maxDependencyEnd || reqEnd > maxDependencyEnd) {
                  maxDependencyEnd = reqEnd;
                }
              }
            }

            if (maxDependencyEnd) {
              const expectedStart = addDays(maxDependencyEnd, 1);
              const currentStart = parseISO(depTask.start);
              
              if (format(expectedStart, 'yyyy-MM-dd') !== depTask.start) {
                const duration = differenceInDays(parseISO(depTask.end), currentStart);
                const newStart = format(expectedStart, 'yyyy-MM-dd');
                const newEnd = format(addDays(expectedStart, duration), 'yyyy-MM-dd');
                
                taskMap.set(depId, {
                  ...depTask,
                  start: newStart,
                  end: newEnd
                });
                
                queue.push(depId);
              }
            }
          }
        }
        return { ...prev, tasks: Array.from(taskMap.values()) };
      }

      return { ...prev, tasks: newTasks };
    });
  };

  const handleExportExcel = () => {
    const exportData = plan.tasks.map(task => ({
      '任务ID': task.id,
      '一级分类': task.category || '',
      '二级分类': task.subcategory || '',
      '任务名称': task.name,
      '计划开始时间': task.start,
      '计划结束时间': task.end,
      '计划工期(天)': differenceInDays(parseISO(task.end), parseISO(task.start)) + 1,
      '实际开始时间': task.actualStart || '',
      '实际结束时间': task.actualEnd || '',
      '实际工期(天)': (task.actualStart && task.actualEnd) ? differenceInDays(parseISO(task.actualEnd), parseISO(task.actualStart)) + 1 : '',
      '完成进度(%)': task.progress,
      '前置任务ID': task.dependencies?.join(',') || ''
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "项目计划与进度");
    XLSX.writeFile(wb, `${plan.projectName}_进度表_${format(new Date(), 'yyyyMMdd')}.xlsx`);
  };

  const handleDownloadTemplate = () => {
    const templateData = [
      {
        '任务ID': 'T-001',
        '一级分类': '示例分类',
        '二级分类': '示例二级分类',
        '任务名称': '示例任务名称',
        '计划开始时间': format(new Date(), 'yyyy-MM-dd'),
        '计划结束时间': format(addDays(new Date(), 7), 'yyyy-MM-dd'),
        '实际开始时间': '',
        '实际结束时间': '',
        '完成进度(%)': 0,
        '前置任务ID': ''
      }
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    // Set column widths for better readability
    ws['!cols'] = [
      { wch: 10 }, { wch: 15 }, { wch: 15 }, { wch: 25 }, 
      { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, 
      { wch: 12 }, { wch: 15 }
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "导入模板");
    XLSX.writeFile(wb, `项目计划导入模板.xlsx`);
  };

  const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws) as any[];

        const importedTasks: Task[] = data.map(row => {
          // Basic validation and mapping
          const start = row['计划开始时间'] || format(new Date(), 'yyyy-MM-dd');
          const end = row['计划结束时间'] || format(new Date(), 'yyyy-MM-dd');
          
          // Handle Excel date numbers if present
          const formatDate = (val: any) => {
            if (!val) return '';
            if (typeof val === 'number') {
               // Excel dates are days since 1900-01-01
               const date = new Date((val - (25567 + 2)) * 86400 * 1000);
               return format(date, 'yyyy-MM-dd');
            }
            return String(val).trim();
          };

          return {
            id: String(row['任务ID'] || `T-${Math.random().toString(36).substr(2, 6)}`),
            category: row['一级分类'] || '未分类',
            subcategory: row['二级分类'] || '',
            name: String(row['任务名称'] || '未命名任务'),
            start: formatDate(start),
            end: formatDate(end),
            actualStart: row['实际开始时间'] ? formatDate(row['实际开始时间']) : undefined,
            actualEnd: row['实际结束时间'] ? formatDate(row['实际结束时间']) : undefined,
            progress: Number(row['完成进度(%)']) || 0,
            dependencies: row['前置任务ID'] ? String(row['前置任务ID']).split(',').map(s => s.trim()).filter(Boolean) : undefined
          };
        });

        if (importedTasks.length > 0) {
          setImportModal({ show: true, tasks: importedTasks });
        } else {
          alert('导入失败：未找到有效数据。');
        }
      } catch (error) {
        console.error("Error importing Excel:", error);
        alert('导入失败，请检查文件格式是否正确。');
      }
    };
    reader.readAsBinaryString(file);
    // Reset input so the same file can be selected again
    e.target.value = '';
  };

  const confirmImport = (isReplace: boolean) => {
    const importedTasks = importModal.tasks;
    if (isReplace) {
      setPlan(prev => ({ ...prev, tasks: importedTasks }));
    } else {
      setPlan(prev => {
        const newTasks = [...prev.tasks];
        importedTasks.forEach(importedTask => {
          const existingIndex = newTasks.findIndex(t => t.name === importedTask.name);
          if (existingIndex !== -1) {
            // Replace existing task with the same name, but preserve the original ID
            newTasks[existingIndex] = { ...importedTask, id: newTasks[existingIndex].id };
          } else {
            newTasks.push(importedTask);
          }
        });
        return { ...prev, tasks: newTasks };
      });
    }
    setImportModal({ show: false, tasks: [] });
    alert('导入成功！');
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <LayoutDashboard className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-gray-900">蓝湾公寓计划管理系统</h1>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-2 mr-4 border-r border-gray-200 pr-4">
              <button 
                onClick={handleDownloadTemplate}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:text-indigo-600 transition-colors cursor-pointer shadow-sm font-medium"
              >
                <FileDown className="w-4 h-4" />
                下载模板
              </button>
              <label className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:text-indigo-600 transition-colors cursor-pointer shadow-sm font-medium">
                <Upload className="w-4 h-4" />
                导入计划
                <input 
                  type="file" 
                  accept=".xlsx, .xls" 
                  className="hidden" 
                  onChange={handleImportExcel}
                />
              </label>
              <button 
                onClick={handleExportExcel}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:text-indigo-600 transition-colors cursor-pointer shadow-sm font-medium"
              >
                <Download className="w-4 h-4" />
                导出进度
              </button>
            </div>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              {new Date().toLocaleDateString('zh-CN')}
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        <TaskLookup 
          tasks={plan.tasks} 
          onUpdateTask={handleUpdateTask} 
          selectedTaskId={selectedTaskId}
          onSelectTask={setSelectedTaskId}
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{plan.projectName}</h2>
              <p className="text-gray-500">全景计划进度表</p>
            </div>
            <div className="flex gap-2">
              <div className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-sm font-medium border border-emerald-100 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                {plan.tasks.length} 个任务
              </div>
            </div>
          </div>

          <GanttChart 
            tasks={plan.tasks} 
            onTaskClick={setSelectedTaskId}
            selectedTaskId={selectedTaskId}
          />
        </motion.div>
      </main>

      {/* Import Confirmation Modal */}
      {importModal.show && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-6"
          >
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-gray-900">导入确认</h3>
              <p className="text-gray-500 text-sm">
                检测到 {importModal.tasks.length} 个任务，请选择导入方式：
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <button 
                onClick={() => confirmImport(true)}
                className="flex flex-col items-start p-4 border-2 border-gray-100 rounded-xl hover:border-indigo-500 hover:bg-indigo-50 transition-all text-left group"
              >
                <span className="font-bold text-gray-900 group-hover:text-indigo-700">完全替换</span>
                <span className="text-xs text-gray-500">清空当前所有计划，使用 Excel 数据完全覆盖。</span>
              </button>

              <button 
                onClick={() => confirmImport(false)}
                className="flex flex-col items-start p-4 border-2 border-gray-100 rounded-xl hover:border-indigo-500 hover:bg-indigo-50 transition-all text-left group"
              >
                <span className="font-bold text-gray-900 group-hover:text-indigo-700">合并更新</span>
                <span className="text-xs text-gray-500">同名任务将被更新，保留旧任务，新增 Excel 中的新任务。</span>
              </button>
            </div>

            <div className="flex justify-end">
              <button 
                onClick={() => setImportModal({ show: false, tasks: [] })}
                className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700"
              >
                取消导入
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
