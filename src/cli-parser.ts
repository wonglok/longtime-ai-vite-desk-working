import { Command } from 'commander';
import Logger from './logger.js';

export interface ParsedOptions {
  download?: string[];
  output: string;
  help: boolean;
}

const logger = Logger.getInstance();

export function parseArgs(args: string[]): ParsedOptions {
  const program = new Command();

  program
    .name('youtube-transcriber')
    .description('Download YouTube videos and transcribe them with Whisper')
    .option('--download <url>', 'YouTube URL to download (can be multiple, space-separated)')
    .option('--output <path>', 'Output directory path', './output')
    .parse(args);

  const options = program.opts();
  
  // Parse multiple URLs if provided as space-separated string
  let urls: string[] | undefined;
  if (options.download) {
    urls = typeof options.download === 'string' 
      ? options.download.split(' ')
      : [options.download];
    
    // Validate YouTube URL format
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;
    for (const url of urls) {
      if (!youtubeRegex.test(url)) {
        logger.error(`Invalid YouTube URL: ${url}`);
        throw new Error('Invalid YouTube URL format');
      }
    }
  }

  return {
    download: urls,
    output: options.output || './output',
    help: program.helpOption() !== undefined && (program.args.includes('--help') || program.args.includes('-h')),
  };
}