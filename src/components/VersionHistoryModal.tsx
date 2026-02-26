import React, { useState } from 'react';
import { X, Save, Upload, Trash2, History } from 'lucide-react';
import { format } from 'date-fns';

interface Version {
  name: string;
  timestamp: string;
  plan: any; // Keeping plan generic for this component
}

interface VersionHistoryModalProps {
  versions: Version[];
  onClose: () => void;
  onSaveVersion: (name: string) => void;
  onLoadVersion: (timestamp: string) => void;
  onDeleteVersion: (timestamp: string) => void;
}

export const VersionHistoryModal: React.FC<VersionHistoryModalProps> = ({ 
  versions, 
  onClose, 
  onSaveVersion, 
  onLoadVersion, 
  onDeleteVersion 
}) => {
  const [newVersionName, setNewVersionName] = useState('');

  const handleSaveClick = () => {
    onSaveVersion(newVersionName);
    setNewVersionName('');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 flex flex-col h-[70vh]">
        <div className="flex items-center justify-between mb-4 flex-shrink-0">
          <div className="flex items-center gap-2">
            <History className="w-6 h-6 text-indigo-600" />
            <h3 className="text-xl font-bold text-gray-900">版本历史</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Save Current Version */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4 flex-shrink-0">
          <h4 className="font-semibold text-gray-700 mb-2">创建新版本快照</h4>
          <div className="flex items-center gap-2">
            <input 
              type="text"
              value={newVersionName}
              onChange={(e) => setNewVersionName(e.target.value)}
              placeholder={`例如：第一版草稿...`}
              className="flex-grow p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 outline-none"
            />
            <button 
              onClick={handleSaveClick}
              disabled={!newVersionName.trim()}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm disabled:bg-indigo-300 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              保存
            </button>
          </div>
        </div>

        {/* Versions List */}
        <div className="flex-grow overflow-y-auto pr-2 -mr-2">
          {versions.length > 0 ? (
            <ul className="space-y-2">
              {versions.map(version => (
                <li key={version.timestamp} className="bg-white p-3 rounded-lg border border-gray-200 flex items-center justify-between hover:border-indigo-400 hover:bg-indigo-50 transition-all">
                  <div>
                    <p className="font-semibold text-gray-800">{version.name}</p>
                    <p className="text-xs text-gray-500">
                      {format(new Date(version.timestamp), 'yyyy年MM月dd日 HH:mm:ss')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => onLoadVersion(version.timestamp)}
                      className="flex items-center gap-1 text-xs px-2 py-1 bg-white border border-gray-300 text-gray-600 rounded-md hover:bg-gray-50 hover:text-indigo-600"
                    >
                      <Upload className="w-3 h-3" />
                      加载
                    </button>
                    <button 
                      onClick={() => onDeleteVersion(version.timestamp)}
                      className="p-1.5 rounded-md hover:bg-red-100 text-gray-400 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-10">
              <p className="text-gray-500">还没有任何历史版本。</p>
              <p className="text-sm text-gray-400">您可以在上方创建第一个版本快照。</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
