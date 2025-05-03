import type { CompressionStrategy } from "./compression-strategy";
import { GzipStrategy } from "./gzip-strategy";

export class CompressionFactory {
  private static strategies: CompressionStrategy[] = [
    new GzipStrategy(),
  ];
  
  static getStrategy(encodings: string[]): CompressionStrategy | null {
    const strategy = this.strategies.find((strategy) => {
      const encodingName = strategy.getEncodingName();
      return encodings.some((encoding) => {
        return encoding.trim() === encodingName;
      });
    });
    return strategy || null;
  }
}