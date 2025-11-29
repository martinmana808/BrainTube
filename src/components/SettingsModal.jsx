import React from 'react';
import { motion } from 'framer-motion';
import { X, Key, Plus, FolderPlus, Youtube } from 'lucide-react';

const SettingsModal = ({ 
  isOpen, 
  onClose, 
  apiKey, 
  setApiKey, 
  aiApiKey, 
  setAiApiKey,
  setAiApiKey,
  onAddVideoByLink,
  onAddChannel,
  onAddCategory
}) => {
  if (!isOpen) return null;

  const [newChannelId, setNewChannelId] = React.useState('');
  const [newCategoryName, setNewCategoryName] = React.useState('');
  const [isAddingChannel, setIsAddingChannel] = React.useState(false);

  const handleAddChannel = async (e) => {
    e.preventDefault();
    if (!newChannelId.trim()) return;
    
    setIsAddingChannel(true);
    try {
      await onAddChannel(newChannelId);
      setNewChannelId('');
    } catch (error) {
      // Alert is handled in App.jsx usually, but we might want to show it here or rely on App's alert
    } finally {
      setIsAddingChannel(false);
    }
  };

  const handleAddCategory = (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    onAddCategory(newCategoryName);
    setNewCategoryName('');
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={onClose}>
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden w-full max-w-lg shadow-2xl" 
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-800 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">System Settings</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* API Keys */}
          <div>
            <h3 className="text-sm font-bold text-green-500 mb-4 uppercase tracking-wider">API Configuration</h3>
            
            <div className="mb-4">
              <label className="block text-xs font-mono text-gray-500 mb-2 uppercase">YouTube Data API Key</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Key className="h-4 w-4 text-gray-600" />
                </div>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="block w-full pl-10 bg-gray-950 border border-gray-800 rounded text-gray-300 text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none py-2 font-mono"
                  placeholder="Enter YouTube API Key"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-mono text-gray-500 mb-2 uppercase">Groq API Key (AI Summary)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Key className="h-4 w-4 text-gray-600" />
                </div>
                <input
                  type="password"
                  value={aiApiKey}
                  onChange={(e) => setAiApiKey(e.target.value)}
                  className="block w-full pl-10 bg-gray-950 border border-gray-800 rounded text-gray-300 text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none py-2 font-mono"
                  placeholder="Enter Groq API Key"
                />
              </div>
              <p className="text-[10px] text-gray-600 mt-1">
                Required for AI summaries. Get a free key at <a href="https://console.groq.com/keys" target="_blank" rel="noopener noreferrer" className="text-green-500 hover:underline">console.groq.com</a>
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div>
             <h3 className="text-sm font-bold text-blue-500 mb-4 uppercase tracking-wider">Content Management</h3>
             
             {/* Add Video */}
             <div className="mb-4">
                <label className="block text-xs font-mono text-gray-500 mb-2 uppercase">Add Video by Link</label>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const url = e.target.elements.videoUrl.value;
                  if (url.trim()) {
                    onAddVideoByLink(url, () => {
                       e.target.elements.videoUrl.focus();
                    });
                    e.target.elements.videoUrl.value = '';
                  }
                }} className="flex gap-2">
                  <input
                    name="videoUrl"
                    type="text"
                    className="flex-1 bg-gray-950 border border-gray-800 rounded text-gray-300 text-sm focus:border-blue-500 outline-none px-3 py-2 font-mono"
                    placeholder="YouTube Video URL"
                  />
                  <button
                    type="submit"
                    disabled={!apiKey}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold p-2 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Plus className="h-5 w-5" />
                  </button>
                </form>
             </div>

             {/* Add Channel */}
             <div className="mb-4">
                <label className="block text-xs font-mono text-gray-500 mb-2 uppercase">Add Channel</label>
                <form onSubmit={handleAddChannel} className="flex gap-2">
                  <input
                    type="text"
                    value={newChannelId}
                    onChange={(e) => setNewChannelId(e.target.value)}
                    className="flex-1 bg-gray-950 border border-gray-800 rounded text-gray-300 text-sm focus:border-blue-500 outline-none px-3 py-2 font-mono"
                    placeholder="Channel ID / Handle / URL"
                  />
                  <button
                    type="submit"
                    disabled={isAddingChannel || !apiKey}
                    className="bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold p-2 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Youtube className="h-5 w-5" />
                  </button>
                </form>
             </div>

             {/* Add Category */}
             <div className="mb-4">
                <label className="block text-xs font-mono text-gray-500 mb-2 uppercase">Add Category</label>
                <form onSubmit={handleAddCategory} className="flex gap-2">
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    className="flex-1 bg-gray-950 border border-gray-800 rounded text-gray-300 text-sm focus:border-blue-500 outline-none px-3 py-2 font-mono"
                    placeholder="Category Name"
                  />
                  <button
                    type="submit"
                    disabled={!newCategoryName.trim()}
                    className="bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold p-2 rounded disabled:opacity-50 transition-colors"
                  >
                    <FolderPlus className="h-5 w-5" />
                  </button>
                </form>
             </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SettingsModal;
