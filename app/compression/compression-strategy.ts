export interface CompressionStrategy {
  getEncodingName: () => string;
  compress: (data: string | Buffer) => Buffer;
  decompress: (data: Buffer) => string | Buffer;
}