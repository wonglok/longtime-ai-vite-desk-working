import { parseArgs } from './src/cli-parser.js';
import Logger from './src/logger.js';
import { downloadVideo, getMetadataFromJson } from './src/downloader.js';
import { convertToWav } from './src/converter.js';
import { transcribeAudio, saveTranscript } from './src/transcriber.js';
import { generateSRT } from './src/srt-generator.js';
import { organizeAndOpenFolder, generateMetadataInfo } from './src/folder-manager.js';

const logger = Logger.getInstance();

export default async function main(): Promise<void> {
  try {
    const args = process.argv.slice(2);
    
    // Check for help flag
    if (args.includes('--help') || args.includes('-h')) {
      console.log(`
YouTube Downloader & Transcriber CLI

Usage: bun run ./cli.ts --download <url> [--output <path>]

Options:
  --download <url>   YouTube URL to download (can be multiple, space-separated)
  --output <path>    Output directory path (default: ./output)
  -h, --help         Show this help message

Examples:
  bun run ./cli.ts --download https://www.youtube.com/watch?v=D3yMC_qoAes
  bun run ./cli.ts --download "https://youtube.com/watch?v=1" "https://youtube.com/watch?v=2" --output ./my-info
      `);
      return;
    }

    // Parse arguments
    const options = parseArgs(args);
    
    if (!options.download || options.download.length === 0) {
      logger.error('No YouTube URLs provided. Use --download <url>');
      process.exit(1);
    }

    logger.info(`Starting YouTube Downloader & Transcriber CLI`);
    logger.info(`Processing ${options.download.length} video(s)`);
    
    const processedVideos: string[] = [];
    
    // Process each URL
    for (const url of options.download) {
      try {
        await processVideo(url, options.output);
        processedVideos.push(options.output);
      } catch (error) {
        logger.error(`Failed to process video from URL: ${url}`);
      }
    }

    // Open output folder when all done
    if (processedVideos.length > 0) {
      await organizeAndOpenFolder(processedVideos[0].split('/').pop() || 'output', options.output);
    }

    logger.info('All tasks completed successfully!');
    
  } catch (error) {
    logger.error(`CLI execution failed: ${error}`);
    process.exit(1);
  }
}

async function processVideo(url: string, outputDir: string): Promise<void> {
  const videoId = extractVideoId(url);
  const videoOutputDir = `${outputDir}/${videoId}`;
  
  logger.info(`Processing video ID: ${videoId}`);
  
  // Step 1: Download video and metadata
  const downloadResult = await downloadVideo(url, outputDir);
  
  // Step 2: Convert MP4 to WAV
  const wavPath = `${videoOutputDir}/audio.wav`;
  await convertToWav(downloadResult.videoPath, wavPath);
  
  // Step 3: Transcribe audio with Whisper
  const transcriptionResult = await transcribeAudio(wavPath, videoOutputDir);
  
  // Step 4: Save transcript files
  saveTranscript(transcriptionResult, videoOutputDir);
  
  // Step 5: Generate SRT captions
  generateSRT(transcriptionResult, `${videoOutputDir}/captions.srt`);
  
  // Step 6: Organize and create metadata
  await organizeAndOpenFolder(videoId, outputDir);
  generateMetadataInfo(videoId, downloadResult.metadata);
  
  logger.info(`Completed processing for video ID: ${videoId}`);
}

function extractVideoId(url: string): string {
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
  
  const hash = Buffer.from(url).toString('base64').substring(0, 11);
  logger.warn(`Could not extract video ID from URL. Using: ${hash}`);
  return hash;
}

// Run main function if this is the entry point
if (require.main === module) {
  main();
}