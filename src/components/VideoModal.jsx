import React, { useState, useEffect, useRef } from 'react';
import YouTube from 'react-youtube';
import { X, Sparkles, Loader, Eye, EyeOff, Heart, Trash2, RotateCcw } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { supabase } from '../services/supabase';

const VideoModal = ({ video, onClose, apiKey, aiApiKey, state, onToggleSeen, onToggleSaved, onDelete }) => {
  const { seen, saved, deleted } = state || {};
  const [summary, setSummary] = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [error, setError] = useState(null);
  const playerRef = useRef(null);

  useEffect(() => {
    const fetchSummary = async () => {
      const { data, error } = await supabase
        .from('video_metadata')
        .select('summary')
        .eq('video_id', video.id)
        .single();
      
      if (data?.summary) {
        setSummary(data.summary);
      }
    };
    fetchSummary();

    return () => {
      // Save progress on unmount
      if (playerRef.current) {
        const time = playerRef.current.getCurrentTime();
        localStorage.setItem(`progress_${video.id}`, time);
      }
    };
  }, [video.id]);

  const generateSummary = async () => {
    setLoadingSummary(true);
    setError(null);
    try {
      // 1. Fetch Transcript via Netlify Function
      const response = await fetch(`/.netlify/functions/get-transcript?videoId=${video.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch transcript');
      }
      const { transcript } = await response.json();
      
      if (!transcript) {
        throw new Error('No transcript available for this video');
      }

      // 2. Call Groq API (Llama 3)
      const prompt = `Summarize the following YouTube video transcript in a concise, bulleted format. Highlight the key takeaways. \n\nTranscript: ${transcript.substring(0, 25000)}`; // Truncate for Llama 3 context window
      
      const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${aiApiKey}`
        },
        body: JSON.stringify({
          messages: [{
            role: 'user',
            content: prompt
          }],
          model: 'llama-3.3-70b-versatile'
        })
      });

      if (!groqResponse.ok) {
        const errorData = await groqResponse.json();
        throw new Error(errorData.error?.message || 'Failed to generate summary with Groq');
      }

      const groqData = await groqResponse.json();
      const aiSummary = groqData.choices[0].message.content;

      setSummary(aiSummary);

      // 3. Save to Supabase
      await supabase.from('video_metadata').upsert({
        video_id: video.id,
        summary: aiSummary,
        last_updated: new Date().toISOString()
      });

    } catch (err) {
      console.error("Error generating summary:", err);
      setError(err.message);
    } finally {
      setLoadingSummary(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden w-full max-w-6xl h-[80vh] flex shadow-2xl relative" onClick={e => e.stopPropagation()}>
        
        {/* Video Player Section */}
        <div className="w-2/3 h-full bg-black flex items-center justify-center relative">
           {/* Close button for mobile/if sidebar is collapsed? No, let's put it in sidebar header for desktop */}
          <YouTube
            videoId={video.id}
            opts={{
              height: '100%',
              width: '100%',
              playerVars: {
                autoplay: 1,
              },
            }}
            onReady={(e) => {
              playerRef.current = e.target;
              const iframe = e.target.getIframe();
              if (iframe) {
                const allow = iframe.getAttribute('allow') || '';
                if (!allow.includes('picture-in-picture')) {
                  iframe.setAttribute('allow', `${allow}; picture-in-picture`);
                }
              }
              
              const savedTime = localStorage.getItem(`progress_${video.id}`);
              if (savedTime) {
                e.target.seekTo(parseFloat(savedTime));
              }
            }}
            onStateChange={(e) => {
              // Save progress on pause (2) or buffer (3) or end (0)
              if (e.data === 2) {
                 localStorage.setItem(`progress_${video.id}`, e.target.getCurrentTime());
              }
            }}
            className="w-full h-full"
            iframeClassName="w-full h-full"
          />
        </div>

        {/* Summary Section */}
        <div className="w-1/3 h-full border-l border-gray-800 flex flex-col bg-gray-900 relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="p-6 border-b border-gray-800 pr-12"> {/* Added pr-12 for close button space */}
            <h2 className="text-xl font-bold text-gray-100 line-clamp-2 mb-2">{video.title}</h2>
            <p className="text-sm text-gray-500 font-mono mb-4">{video.channelTitle}</p>
            
            {/* Action Buttons */}
            <div className="flex gap-2">
               <button 
                 onClick={() => onToggleSeen(video.id)}
                 className={`flex-1 flex items-center justify-center gap-2 p-2 rounded transition-colors ${seen ? 'bg-gray-800 text-gray-400' : 'bg-gray-800 text-gray-200 hover:bg-gray-700'}`}
                 title={seen ? "Mark as Unseen" : "Mark as Seen"}
               >
                 {seen ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                 <span className="text-xs font-bold">{seen ? 'SEEN' : 'MARK SEEN'}</span>
               </button>
               <button 
                 onClick={() => onToggleSaved(video.id)}
                 className={`flex-1 flex items-center justify-center gap-2 p-2 rounded transition-colors ${saved ? 'bg-pink-900/30 text-pink-500' : 'bg-gray-800 text-gray-200 hover:bg-gray-700'}`}
                 title={saved ? "Unsave" : "Save for Later"}
               >
                 <Heart className={`w-4 h-4 ${saved ? 'fill-current' : ''}`} />
                 <span className="text-xs font-bold">{saved ? 'SAVED' : 'SAVE'}</span>
               </button>
               <button 
                 onClick={() => onDelete(video.id)}
                 className={`flex-1 flex items-center justify-center gap-2 p-2 rounded transition-colors ${deleted ? 'bg-blue-900/30 text-blue-500' : 'bg-gray-800 text-gray-200 hover:bg-red-900/30 hover:text-red-500'}`}
                 title={deleted ? "Undo Delete" : "Delete Video"}
               >
                 {deleted ? <RotateCcw className="w-4 h-4" /> : <Trash2 className="w-4 h-4" />}
                 <span className="text-xs font-bold">{deleted ? 'RESTORE' : 'TRASH'}</span>
               </button>
            </div>
          </div>

          <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
            {summary ? (
              <div className="prose prose-invert prose-sm max-w-none">
                <div className="flex items-center gap-2 text-green-400 mb-4 font-mono text-xs uppercase tracking-wider">
                  <Sparkles className="w-4 h-4" />
                  AI Summary
                </div>
                <div className="text-gray-300 leading-relaxed">
                  <ReactMarkdown>{summary}</ReactMarkdown>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-4">
                <div className="bg-gray-900 p-4 rounded-full mb-4">
                  <Sparkles className="w-8 h-8 text-green-500" />
                </div>
                <h3 className="text-gray-200 font-bold mb-2">No Summary Yet</h3>
                <p className="text-gray-500 text-sm mb-6 max-w-xs">
                  Generate an AI summary to get a quick overview of this video's content.
                </p>
                <button
                  onClick={generateSummary}
                  disabled={loadingSummary}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-black font-bold rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loadingSummary ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Generate Summary
                    </>
                  )}
                </button>
                {error && (
                  <p className="text-red-500 text-xs mt-4 max-w-xs">{error}</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoModal;
