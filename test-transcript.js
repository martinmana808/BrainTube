import { Innertube } from 'youtubei.js';

const videoId = '0d727qv_MYs'; // The user's video

async function test() {
  try {
    console.log(`Fetching transcript for ${videoId}...`);
    const youtube = await Innertube.create();
    const info = await youtube.getInfo(videoId);
    const transcriptData = await info.getTranscript();
    
    if (transcriptData && transcriptData.transcript) {
       const lines = transcriptData.transcript.content.body.initial_segments.map(seg => seg.snippet.text);
       console.log('Success!');
       console.log('Transcript length (lines):', lines.length);
       console.log('First few lines:', lines.slice(0, 3));
    } else {
       console.log('No transcript found.');
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

test();
