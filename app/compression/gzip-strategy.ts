import { gzipSync, gunzipSync } from "zlib";
import type { CompressionStrategy } from "./compression-strategy";

export class GzipStrategy implements CompressionStrategy {
  getEncodingName(): string {
    return "gzip";
  }
  compress(data: string | Buffer): Buffer {
    return gzipSync(data);
  }
  decompress(data: Buffer): string | Buffer {
    return gunzipSync(data);
  }
}