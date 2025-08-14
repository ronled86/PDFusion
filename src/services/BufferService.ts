import { OpenedFile } from '../lib/types';

export class BufferService {
  private static cachedBuffer: Uint8Array | null = null;

  /**
   * Create a safe copy of a buffer that won't be detached
   */
  static createSafeBuffer(source: Uint8Array): Uint8Array {
    try {
      // Always create a completely independent copy
      return new Uint8Array(source);
    } catch (e) {
      console.error("Cannot create safe buffer from source");
      throw new Error("Source buffer is corrupted");
    }
  }

  /**
   * Get a working buffer, handling detachment gracefully
   */
  static getWorkingBuffer(buffers: Uint8Array | null, file: OpenedFile | undefined): Uint8Array | null {
    if (!buffers || !file) return null;
    
    // Use cached buffer if available and valid
    if (this.cachedBuffer) {
      try {
        this.cachedBuffer.slice(0, 1); // Test if cached buffer is detached
        return this.cachedBuffer;
      } catch (e) {
        console.log("Cached buffer is detached, clearing cache");
        this.cachedBuffer = null;
      }
    }
    
    try {
      buffers.slice(0, 1); // Test if buffer is detached
      const safeCopy = this.createSafeBuffer(buffers);
      this.cachedBuffer = safeCopy;
      return safeCopy;
    } catch (error) {
      console.warn("Main buffer is detached, trying file.data");
      
      if (file.data && file.data instanceof Uint8Array) {
        try {
          file.data.slice(0, 1); // Test if file.data is detached
          const safeCopy = this.createSafeBuffer(file.data);
          this.cachedBuffer = safeCopy;
          return safeCopy;
        } catch (fileDataError) {
          console.error("Both buffers are detached");
          return null;
        }
      }
      return null;
    }
  }

  /**
   * Update the cached buffer
   */
  static updateCachedBuffer(buffer: Uint8Array | null): void {
    this.cachedBuffer = buffer;
  }

  /**
   * Clear the cached buffer
   */
  static clearCachedBuffer(): void {
    this.cachedBuffer = null;
  }

  /**
   * Validate that a buffer is accessible and not detached
   */
  static isBufferValid(buffer: Uint8Array | null): boolean {
    if (!buffer) return false;
    try {
      buffer.slice(0, 1);
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Create an enhanced buffer update with immediate safe copy
   */
  static createSafeUpdate(newBuffer: Uint8Array): Uint8Array {
    try {
      // Create a safe copy immediately
      const safeCopy = this.createSafeBuffer(newBuffer);
      this.cachedBuffer = safeCopy;
      console.log("Buffers updated with safe copy, length:", safeCopy.length);
      return safeCopy;
    } catch (error) {
      console.error("Failed to create safe buffer update:", error);
      throw error;
    }
  }
}
