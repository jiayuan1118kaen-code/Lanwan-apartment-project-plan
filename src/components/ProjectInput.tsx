import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Send, Loader2 } from 'lucide-react';

interface ProjectInputProps {
  onSubmit: (text: string) => void;
  isLoading: boolean;
}

export const ProjectInput: React.FC<ProjectInputProps> = ({ onSubmit, isLoading }) => {
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onSubmit(text);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
    >
      <h2 className="text-xl font-semibold text-gray-800 mb-4">描述您的项目</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="例如：重新设计网站。周一进行调研，设计阶段持续3天，开发一周，周五评审。"
          className="w-full h-32 p-4 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none resize-none transition-all text-gray-700 placeholder-gray-400"
          disabled={isLoading}
        />
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isLoading || !text.trim()}
            className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white rounded-xl font-medium transition-colors shadow-sm"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                正在生成计划...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                可视化计划
              </>
            )}
          </button>
        </div>
      </form>
    </motion.div>
  );
};
