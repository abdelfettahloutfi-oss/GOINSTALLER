export interface ExtractionLogEntry {
  id: string;
  timestamp: string;
  submittedUrl: string;
  detectedPlatform: string;
  extractedMediaId: string | null;
  canonicalUrl: string;
  apiResponseStatus?: string | number;
  apiResponseSummary?: string;
  finalMediaUrl: string;
  validationResult: boolean;
  validationDetails?: string;
  error?: string;
}

class ExtractionLogger {
  private recentLogs: ExtractionLogEntry[] = [];
  private maxLogs = 100;

  public log(entry: Omit<ExtractionLogEntry, 'id' | 'timestamp'>): void {
    const fullEntry: ExtractionLogEntry = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toISOString(),
      ...entry,
    };

    this.recentLogs.unshift(fullEntry);
    if (this.recentLogs.length > this.maxLogs) {
      this.recentLogs.pop();
    }

    const isDev = process.env.NODE_ENV !== 'production';
    if (isDev) {
      const statusText = fullEntry.apiResponseStatus ?? 'N/A';
      const summaryText =
        fullEntry.apiResponseSummary ??
        (fullEntry.apiResponseStatus === 'ERROR' || !fullEntry.validationResult
          ? (fullEntry.error || fullEntry.validationDetails || 'Extraction Failed')
          : 'OK');

      console.log(
        `\n[Goinstaller Extraction Log] ${fullEntry.timestamp}\n` +
        `  • Submitted URL:       ${fullEntry.submittedUrl}\n` +
        `  • Detected Platform:   ${fullEntry.detectedPlatform}\n` +
        `  • Extracted Media ID:  ${fullEntry.extractedMediaId ?? 'NONE'}\n` +
        `  • Canonical URL:       ${fullEntry.canonicalUrl}\n` +
        `  • API Response:        ${statusText} - ${summaryText}\n` +
        `  • Final Media URL:     ${fullEntry.finalMediaUrl}\n` +
        `  • Validation Result:   ${fullEntry.validationResult ? 'VALID' : 'FAILED: ' + (fullEntry.validationDetails || fullEntry.error || 'MISMATCH')}\n`
      );
    }
  }

  public getRecentLogs(): ExtractionLogEntry[] {
    return [...this.recentLogs];
  }

  public clear(): void {
    this.recentLogs = [];
  }
}

export const extractionLogger = new ExtractionLogger();
