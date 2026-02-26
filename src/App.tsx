/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { TaskLookup } from './components/TaskLookup';
import { GanttChart } from './components/GanttChart';
import { ProjectPlan, Task } from './services/gemini';
import { LayoutDashboard, Calendar, CheckCircle2 } from 'lucide-react';
import { DEMO_PROJECT_PLAN } from './data/demoData';

export default function App() {
  const [plan, setPlan] = useState<ProjectPlan>(DEMO_PROJECT_PLAN);
  const [selectedTaskId, setSelectedTaskId] = useState<string>('');

  const handleUpdateTask = (taskId: string, updates: Partial<Task>) => {
    setPlan(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => t.id === taskId ? { ...t, ...updates } : t)
    }));
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
    </div>
  );
}
