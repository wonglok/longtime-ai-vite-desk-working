import { execSync } from 'child_process';
import { mkdirSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import Logger from './logger.js';
import { VideoMetadata } from './folder-manager.js';

const logger = Logger.getInstance();

export interface DownloadResult {
  videoPath: string;
  metadata: VideoMetadata;
}

export async function downloadVideo(url: string, outputDir: string): Promise<DownloadResult> {
  const tempOutput = join(outputDir, 'temp');
  
  // Create temporary output directory
  mkdirSync(tempOutput, { recursive: true });
  
  logger.info(`Downloading video from URL: ${url}`);
  
  try {
    // Use yt-dlp to download video and metadata
    const command = `yt-dlp --format "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]" --write-info-json --output "%(id)s.%(ext)s" "${url}" -P ${tempOutput}`;
    
    execSync(command, { stdio: 'inherit' });
    
    // Extract video ID from URL or filename
    const videoId = extractVideoId(url);
    
    logger.info(`Downloaded video with ID: ${videoId}`);
    
    return {
      videoPath: join(tempOutput, `${videoId}.mp4`),
      metadata: {
        videoId,
        title: 'Unknown',
        duration: undefined,
        uploader: undefined,
      },
    };
  } catch (error) {
    logger.error(`Failed to download video from URL: ${url}`);
    throw error;
  }
}

function extractVideoId(url: string): string {
  // Extract video ID from various YouTube URL formats
  const patterns = [
    /(?:v=|\/)([a-zA-Z0-9_-]{11})/,
    /youtu\.be\/([a-zA-Z0-9_-]{11})/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  // If no video ID found, use a hash of the URL as fallback
  const hash = Buffer.from(url).toString('base64').substring(0, 11);
  logger.warn(`Could not extract video ID from URL. Using: ${hash}`);
  return hash;
}

export function getMetadataFromJson(jsonPath: string): VideoMetadata {
  try {
    const jsonContent = JSON.parse(require('fs').readFileSync(jsonPath, 'utf-8'));
    
    return {
      videoId: jsonContent.id || extractVideoId(jsonContent.url || ''),
      title: jsonContent.title || 'Unknown',
      duration: jsonContent.duration,
      uploader: jsonContent.uploader || jsonContent.channel || 'Unknown',
    };
  } catch (error) {
    logger.warn(`Could not read metadata JSON. Using defaults.`);
    return {
      videoId: extractVideoId(jsonPath),
      title: 'Unknown',
      duration: undefined,
      uploader: undefined,
    };
  }
}