export default class Logger {
  private static instance: Logger;
  
  private constructor() {}
  
  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  info(message: string): void {
    console.log(`[INFO] ${this.formatTime()} - ${message}`);
  }

  warn(message: string): void {
    console.warn(`[WARN] ${this.formatTime()} - ${message}`);
  }

  error(message: string): void {
    console.error(`[ERROR] ${this.formatTime()} - ${message}`);
  }

  debug(message: string): void {
    if (process.env.DEBUG === 'true') {
      console.log(`[DEBUG] ${this.formatTime()} - ${message}`);
    }
  }

  private formatTime(): string {
    const now = new Date();
    return now.toISOString().replace('T', ' ').substring(0, 19);
  }
}