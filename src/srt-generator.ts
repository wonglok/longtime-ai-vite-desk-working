import { writeFileSync } from 'fs';
import Logger from './logger.js';

const logger = Logger.getInstance();

export interface SRTSegment {
  index: number;
  start: number;
  end: number;
  text: string;
}

export function generateSRT(transcriptData: any, outputPath: string): void {
  const segments: SRTSegment[] = [];
  
  // Extract segments from different possible formats
  if (Array.isArray(transcriptData)) {
    transcriptData.forEach((segment: any, index: number) => {
      segments.push({
        index: index + 1,
        start: segment.start || 0,
        end: segment.end || 0,
        text: segment.text || '',
      });
    });
  } else if (transcriptData.chunks && Array.isArray(transcriptData.chunks)) {
    transcriptData.chunks.forEach((chunk: any, index: number) => {
      segments.push({
        index: index + 1,
        start: chunk.timestamp?.[0] || 0,
        end: chunk.timestamp?.[1] || 0,
        text: chunk.text || '',
      });
    });
  } else if (transcriptData.segments && Array.isArray(transcriptData.segments)) {
    transcriptData.segments.forEach((segment: any, index: number) => {
      segments.push({
        index: index + 1,
        start: segment.start || 0,
        end: segment.end || 0,
        text: segment.text || '',
      });
    });
  } else {
    // Fallback to simple text if no structured data
    logger.warn('No structured segments found in transcript data');
    return;
  }
  
  // Generate SRT content
  let srtContent = '';
  for (const segment of segments) {
    srtContent += `${segment.index}\n`;
    srtContent += `${formatTimestamp(segment.start)} --> ${formatTimestamp(segment.end)}\n`;
    srtContent += `${segment.text}\n\n`;
  }
  
  // Write SRT file
  writeFileSync(outputPath, srtContent);
  logger.info(`Generated SRT caption file: ${outputPath}`);
}

function formatTimestamp(seconds: number): string {
  const date = new Date(0);
  date.setSeconds(seconds);
  return date.toISOString().substr(11, 8).replace('.', ',');
}