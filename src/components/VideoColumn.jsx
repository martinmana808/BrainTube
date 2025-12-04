import React, { useState, useMemo, useEffect } from 'react';
import VideoCard from './VideoCard';
import { Search, ChevronDown, Loader } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const VideoColumn = ({ title, videos, emptyMessage, videoStates, onToggleSeen, onToggleSaved, onDelete, categories = [], channels = [], onVideoClick, loading, onViewSummary, showBin = true, showSaved = false, searchQuery = '' }) => {
  // Filtered videos are just the passed videos prop, as filtering is handled by parent or global state now
  const filteredVideos = videos;

  const deletedVideos = filteredVideos.filter(v => videoStates?.[v.id]?.deleted);
  
  // If showSaved is true, we separate saved videos from active/seen
  const savedVideos = showSaved ? filteredVideos.filter(v => videoStates?.[v.id]?.saved && !videoStates?.[v.id]?.deleted) : [];
  
  // Main list includes both seen and unseen, but excludes deleted and saved (if showSaved is true)
  const mainVideos = filteredVideos.filter(v => 
    !videoStates?.[v.id]?.deleted && 
    (!showSaved || !videoStates?.[v.id]?.saved)
  );
  
  const unwatchedCount = mainVideos.filter(v => !videoStates?.[v.id]?.seen).length;
  
  const [filterMode, setFilterMode] = useState('ALL'); // 'ALL' or 'UNWATCHED'

  const [isMainCollapsed, setIsMainCollapsed] = useState(false);
  const [isDeletedCollapsed, setIsDeletedCollapsed] = useState(true);
  const [isSavedCollapsed, setIsSavedCollapsed] = useState(false); // Default open for Saved

  const [isMainFlashing, setIsMainFlashing] = useState(false);
  const [isDeletedFlashing, setIsDeletedFlashing] = useState(false);
  const [isSavedFlashing, setIsSavedFlashing] = useState(false);

  const [prevMainCount, setPrevMainCount] = useState(0);
  const [prevDeletedCount, setPrevDeletedCount] = useState(0);
  const [prevSavedCount, setPrevSavedCount] = useState(0);

  // Trigger flash animation
  useEffect(() => {
    if (mainVideos.length > prevMainCount && prevMainCount > 0 && isMainCollapsed) {
      setIsMainFlashing(true);
      const timer = setTimeout(() => setIsMainFlashing(false), 500);
      return () => clearTimeout(timer);
    }
    setPrevMainCount(mainVideos.length);
  }, [mainVideos.length, isMainCollapsed]);

  useEffect(() => {
    if (deletedVideos.length > prevDeletedCount && prevDeletedCount > 0 && isDeletedCollapsed) {
      setIsDeletedFlashing(true);
      const timer = setTimeout(() => setIsDeletedFlashing(false), 500);
      return () => clearTimeout(timer);
    }
    setPrevDeletedCount(deletedVideos.length);
  }, [deletedVideos.length, isDeletedCollapsed]);

  useEffect(() => {
    if (savedVideos.length > prevSavedCount && prevSavedCount > 0 && isSavedCollapsed) {
      setIsSavedFlashing(true);
      const timer = setTimeout(() => setIsSavedFlashing(false), 500);
      return () => clearTimeout(timer);
    }
    setPrevSavedCount(savedVideos.length);
  }, [savedVideos.length, isSavedCollapsed]);

  const videoCardProps = {
    onToggleSeen,
    onToggleSaved,
    onDelete,
    onClick: onVideoClick,
    videoStates, // Pass videoStates down to VideoCard
    onViewSummary,
  };

  const videosToShow = useMemo(() => {
    if (filterMode === 'UNWATCHED') {
      return mainVideos.filter(v => !videoStates?.[v.id]?.seen);
    }
    return mainVideos;
  }, [mainVideos, filterMode, videoStates]);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-black border-r border-gray-200 dark:border-gray-800 last:border-r-0 transition-colors duration-200">
      <div className="flex-none h-[88px] border-b border-gray-200 dark:border-gray-800 flex flex-col justify-center px-4 mb-4 bg-white dark:bg-black z-10">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
          {title}
        </h2>
        <div className="flex items-center gap-3 text-xs font-mono tracking-wider">
            <button 
                onClick={() => setFilterMode('ALL')}
                className={`transition-colors ${filterMode === 'ALL' ? 'text-blue-600 dark:text-blue-400 font-bold' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
            >
                ALL ({mainVideos.length})
            </button>
            <span className="text-gray-300 dark:text-gray-700">|</span>
            <button 
                onClick={() => setFilterMode('UNWATCHED')}
                className={`transition-colors ${filterMode === 'UNWATCHED' ? 'text-blue-600 dark:text-blue-400 font-bold' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
            >
                UNWATCHED ({unwatchedCount})
            </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        
        {/* Saved Videos Section (Only if showSaved is true) */}
        {showSaved && savedVideos.length > 0 && (
          <div className="mb-4">
            <button 
              onClick={() => setIsSavedCollapsed(!isSavedCollapsed)}
              className="flex items-center gap-2 w-full text-left mb-4 group"
            >
              <div className={`transition-transform duration-200 ${isSavedCollapsed ? '-rotate-90' : 'rotate-0'}`}>
                <ChevronDown className="w-4 h-4 text-gray-500 group-hover:text-gray-900 dark:group-hover:text-gray-300" />
              </div>
              <h3 className={`text-xs uppercase tracking-wider group-hover:text-gray-900 dark:group-hover:text-gray-300 transition-colors font-mono ${
                isSavedFlashing ? 'text-teal-600 dark:text-green-500' : 'text-gray-500'
              }`}>
                Saved [{savedVideos.length}]
              </h3>
            </button>

            {!isSavedCollapsed && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="space-y-4 overflow-hidden"
              >
                <AnimatePresence mode="popLayout">
                  {savedVideos.map((video) => (
                    <motion.div
                      key={video.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                    >
                      <VideoCard 
                        video={video} 
                        state={videoStates?.[video.id] || {}}
                        {...videoCardProps}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </div>
        )}

        {/* Main Videos List (Mixed Watched/Unwatched) */}
        <div className="mb-4">
          {/* Only show collapse button if we really want to collapse the main list, 
              but usually main list is always visible. Let's keep it simple and just show the list. 
              Or if we want to keep consistency with other sections, we can add a header, but user didn't ask for one here.
              User asked for header at the TOP of the column.
          */}

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            <AnimatePresence mode="popLayout">
              {videosToShow.map((video) => {
                const isSeen = videoStates?.[video.id]?.seen;
                return (
                  <motion.div
                    key={video.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: isSeen ? 0.5 : 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <VideoCard 
                      video={video} 
                      state={videoStates?.[video.id] || {}}
                      {...videoCardProps}
                    />
                  </motion.div>
                );
              })}
            </AnimatePresence>
            {videosToShow.length === 0 && filteredVideos.length > 0 && !loading && (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }}
                className="text-center text-gray-600 py-8 font-mono text-sm italic"
              >
                {filterMode === 'UNWATCHED' && mainVideos.length > 0 ? "All caught up!" : "All videos cleared"}
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* Deleted Videos Section (Bin) - Only if showBin is true */}
        {showBin && deletedVideos.length > 0 && (
          <div className="pt-4 border-t dark:border-gray-800 border-gray-200">
            <button 
              onClick={() => setIsDeletedCollapsed(!isDeletedCollapsed)}
              className="flex items-center gap-2 w-full text-left mb-4 group"
            >
              <div className={`transition-transform duration-200 ${isDeletedCollapsed ? '-rotate-90' : 'rotate-0'}`}>
                <ChevronDown className="w-4 h-4 text-gray-500 group-hover:text-gray-900 dark:group-hover:text-gray-300" />
              </div>
              <h3 className={`text-xs uppercase tracking-wider group-hover:text-gray-900 dark:group-hover:text-gray-300 transition-colors font-mono ${
                isDeletedFlashing ? 'text-teal-600 dark:text-green-500' : 'text-gray-500'
              }`}>
                Bin [{deletedVideos.length}]
              </h3>
            </button>

            {!isDeletedCollapsed && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="space-y-4 overflow-hidden"
              >
                <AnimatePresence mode="popLayout">
                  {deletedVideos.map((video) => (
                    <motion.div
                      key={video.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <VideoCard 
                        video={video} 
                        state={videoStates?.[video.id] || {}}
                        {...videoCardProps}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </div>
        )}

        {/* Empty State / Loading */}
        {loading ? (
          <div className="flex flex-col items-center justify-center mt-20 text-teal-500 dark:text-green-500">
            <Loader className="w-8 h-8 animate-spin mb-2" />
            <span className="text-xs font-mono uppercase tracking-wider">Loading...</span>
          </div>
        ) : filteredVideos.length === 0 && (
          <div className="text-center text-gray-600 mt-10 font-mono text-sm">
            {searchQuery ? 'No matches found' : (emptyMessage || 'No videos found')}
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoColumn;
