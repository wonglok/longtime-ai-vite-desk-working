import { pipeline, env } from '@xenova/transformers';
import Logger from './logger.js';

const logger = Logger.getInstance();

// Disable local model caching for cleaner output
env.allowLocalModels = false;
env.useBrowserCache = false;

export interface TranscriptionResult {
  text: string;
  segments: Array<{
    start: number;
    end: number;
    text: string;
  }>;
}

export async function transcribeAudio(wavPath: string, outputDir: string): Promise<TranscriptionResult> {
  logger.info(`Starting transcription for audio file: ${wavPath}`);
  
  try {
    // Load Whisper model
    const pipe = await pipeline('automatic-speech-recognition', 'Xenova/whisper-tiny');
    
    // Transcribe the audio
    const result = await pipe(wavPath, {
      chunk_length_s: 30,
      stride_length_s: 5,
    });
    
    logger.info(`Transcription completed successfully`);
    
    return result;
  } catch (error) {
    logger.error(`Failed to transcribe audio file`);
    throw error;
  }
}

export function saveTranscript(result: TranscriptionResult, outputDir: string): void {
  const fs = require('fs');
  
  // Save raw JSON result
  const jsonPath = `${outputDir}/raw.json`;
  fs.writeFileSync(jsonPath, JSON.stringify(result, null, 2));
  logger.info(`Saved raw transcription to ${jsonPath}`);
  
  // Save line-by-line transcript text
  const txtPath = `${outputDir}/transcript.txt`;
  let transcriptText = '';
  
  if (Array.isArray(result)) {
    for (const segment of result) {
      transcriptText += `[${formatTime(segment.start)}] ${segment.text}\n`;
    }
  } else if (result.text && Array.isArray(result.chunks)) {
    for (const chunk of result.chunks) {
      transcriptText += `[${formatTime(chunk.timestamp[0])}] ${chunk.text}\n`;
    }
  } else {
    transcriptText = result.text || '';
  }
  
  fs.writeFileSync(txtPath, transcriptText);
  logger.info(`Saved transcript text to ${txtPath}`);
}

function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}