/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ProjectInput } from './components/ProjectInput';
import { GanttChart } from './components/GanttChart';
import { parseProjectPlan, ProjectPlan } from './services/gemini';
import { LayoutDashboard, Calendar, CheckCircle2, Play } from 'lucide-react';
import { DEMO_PROJECT_PLAN } from './data/demoData';

export default function App() {
  const [plan, setPlan] = useState<ProjectPlan | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleProjectSubmit = async (text: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await parseProjectPlan(text);
      setPlan(result);
    } catch (err) {
      console.error(err);
      setError('生成计划失败，请重试。');
    } finally {
      setIsLoading(false);
    }
  };

  const loadDemo = () => {
    setPlan(DEMO_PROJECT_PLAN);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <LayoutDashboard className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-gray-900">项目计划可视化工具</h1>
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
        {!plan && (
          <div className="text-center py-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">将想法转化为计划</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
              用简单的语言描述您的项目，我们将立即为您生成结构化的时间表和甘特图。
            </p>
            <div className="flex justify-center gap-4">
              <button 
                onClick={loadDemo}
                className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
              >
                <Play className="w-4 h-4 text-indigo-600" />
                加载施工演示案例
              </button>
            </div>
          </div>
        )}

        <ProjectInput onSubmit={handleProjectSubmit} isLoading={isLoading} />

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl max-w-2xl mx-auto text-center"
          >
            {error}
          </motion.div>
        )}

        {plan && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{plan.projectName}</h2>
                <p className="text-gray-500">时间表与任务</p>
              </div>
              <div className="flex gap-2">
                <div className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-sm font-medium border border-emerald-100 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  {plan.tasks.length} 个任务
                </div>
              </div>
            </div>

            <GanttChart tasks={plan.tasks} />
          </motion.div>
        )}
      </main>
    </div>
  );
}
