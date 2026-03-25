import { execSync } from 'child_process';
import Logger from './logger.js';

const logger = Logger.getInstance();

export async function convertToWav(inputPath: string, outputPath: string): Promise<void> {
  logger.info(`Converting ${inputPath} to WAV format`);
  
  try {
    // Use ffmpeg to convert MP4 to WAV
    const command = `ffmpeg -i "${inputPath}" -vn -acodec pcm_s16le -ar 16000 -ac 2 "${outputPath}"`;
    
    execSync(command, { stdio: 'inherit' });
    
    logger.info(`Successfully converted to WAV: ${outputPath}`);
  } catch (error) {
    logger.error(`Failed to convert audio file`);
    throw error;
  }
}

export function ensureWavExists(wavPath: string): boolean {
  const fs = require('fs');
  return fs.existsSync(wavPath);
}