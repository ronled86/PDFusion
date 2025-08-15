/**
 * Content Analysis System for Intelligent Cursor Behavior
 * Analyzes PDF content to determine text regions, images, and interactive elements
 */

export interface ContentRegion {
  type: 'text' | 'image' | 'drawing' | 'form' | 'annotation';
  bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  confidence: number;
  metadata?: {
    fontSize?: number;
    fontFamily?: string;
    color?: string;
    imageType?: string;
    textContent?: string;
    annotationType?: string;
  };
}

export interface PageAnalysis {
  pageNumber: number;
  regions: ContentRegion[];
  textBlocks: ContentRegion[];
  images: ContentRegion[];
  lastAnalyzed: number;
}

export interface CursorContext {
  type: 'default' | 'text' | 'grab' | 'crosshair' | 'pointer';
  region?: ContentRegion;
  action?: string;
}

class ContentAnalyzer {
  private pageAnalysisCache = new Map<string, PageAnalysis>();
  private analysisWorkers = new Map<string, Promise<PageAnalysis>>();

  /**
   * Analyze page content for intelligent cursor behavior
   */
  async analyzePage(
    page: any, // PDF.js page object
    viewport: any, // PDF.js viewport
    pageNumber: number
  ): Promise<PageAnalysis> {
    const cacheKey = `${pageNumber}-${viewport.scale}`;
    
    // Return cached result if available and recent
    const cached = this.pageAnalysisCache.get(cacheKey);
    if (cached && Date.now() - cached.lastAnalyzed < 30000) {
      return cached;
    }

    // Check if analysis is already in progress
    if (this.analysisWorkers.has(cacheKey)) {
      return this.analysisWorkers.get(cacheKey)!;
    }

    // Start new analysis
    const analysisPromise = this.performPageAnalysis(page, viewport, pageNumber);
    this.analysisWorkers.set(cacheKey, analysisPromise);

    try {
      const result = await analysisPromise;
      this.pageAnalysisCache.set(cacheKey, result);
      return result;
    } finally {
      this.analysisWorkers.delete(cacheKey);
    }
  }

  /**
   * Perform actual page content analysis
   */
  private async performPageAnalysis(
    page: any,
    viewport: any,
    pageNumber: number
  ): Promise<PageAnalysis> {
    const regions: ContentRegion[] = [];
    const textBlocks: ContentRegion[] = [];
    const images: ContentRegion[] = [];

    try {
      // Analyze text content
      const textContent = await page.getTextContent();
      console.log('Text content items:', textContent.items.length);
      const textRegions = this.analyzeTextContent(textContent, viewport);
      console.log('Text regions created:', textRegions.length);
      regions.push(...textRegions);
      textBlocks.push(...textRegions);

      // Analyze images and graphics
      const operatorList = await page.getOperatorList();
      const imageRegions = this.analyzeImages(operatorList, viewport);
      regions.push(...imageRegions);
      images.push(...imageRegions);

      // Analyze annotations
      const annotations = await page.getAnnotations();
      const annotationRegions = this.analyzeAnnotations(annotations, viewport);
      regions.push(...annotationRegions);

    } catch (error) {
      console.warn('Content analysis failed:', error);
    }

    return {
      pageNumber,
      regions,
      textBlocks,
      images,
      lastAnalyzed: Date.now()
    };
  }

  /**
   * Analyze text content and create text regions
   */
  private analyzeTextContent(textContent: any, viewport: any): ContentRegion[] {
    const regions: ContentRegion[] = [];
    const items = textContent.items;

    console.log('Analyzing text content, items:', items.length);

    for (const item of items) {
      if (!item.transform || !item.str?.trim()) continue;

      const transform = item.transform;
      
      // Use EXACT same coordinates as TextLayer:
      // TextLayer: left = transform[4], top = viewport.height - transform[5]
      const x = transform[4];
      const y = viewport.height - transform[5];
      const fontSize = Math.abs(transform[0]);
      
      // More accurate text dimensions based on font metrics
      const textWidth = item.str.length * fontSize * 0.5; // Reduced multiplier for better accuracy
      const textHeight = fontSize * 1.2; // Account for line height

      const region = {
        type: 'text' as const,
        bounds: {
          x: x,
          y: y - fontSize, // Adjust y to account for text baseline
          width: textWidth,
          height: textHeight
        },
        confidence: 0.9,
        metadata: {
          fontSize,
          textContent: item.str,
          fontFamily: item.fontName
        }
      };

      regions.push(region);

      // Log first few regions for debugging
      if (regions.length <= 5) {
        console.log(`Text region ${regions.length}:`, {
          text: item.str,
          bounds: region.bounds,
          transform: transform
        });
      }
    }

    console.log(`Created ${regions.length} text regions`);
    return regions;
  }

  /**
   * Analyze images from operator list
   */
  private analyzeImages(operatorList: any, viewport: any): ContentRegion[] {
    const regions: ContentRegion[] = [];
    const fnArray = operatorList.fnArray;
    const argsArray = operatorList.argsArray;

    for (let i = 0; i < fnArray.length; i++) {
      const fn = fnArray[i];
      const args = argsArray[i];

      // Look for image operations
      if (fn === 84 || fn === 85) { // OPS.paintImageXObject or OPS.paintInlineImageXObject
        try {
          // Extract image bounds from transformation matrix
          if (args && args.length > 0) {
            // This is a simplified extraction - actual implementation would be more complex
            regions.push({
              type: 'image',
              bounds: {
                x: 0,
                y: 0,
                width: 100,
                height: 100
              },
              confidence: 0.8,
              metadata: {
                imageType: 'embedded'
              }
            });
          }
        } catch (error) {
          console.warn('Image analysis error:', error);
        }
      }
    }

    return regions;
  }

  /**
   * Analyze annotations
   */
  private analyzeAnnotations(annotations: any[], viewport: any): ContentRegion[] {
    const regions: ContentRegion[] = [];

    for (const annotation of annotations) {
      if (!annotation.rect) continue;

      const [x1, y1, x2, y2] = annotation.rect;
      const topLeft = viewport.convertToViewportPoint(x1, y2);
      const bottomRight = viewport.convertToViewportPoint(x2, y1);

      regions.push({
        type: 'annotation',
        bounds: {
          x: topLeft[0],
          y: topLeft[1],
          width: bottomRight[0] - topLeft[0],
          height: bottomRight[1] - topLeft[1]
        },
        confidence: 1.0,
        metadata: {
          annotationType: annotation.subtype
        }
      });
    }

    return regions;
  }

  /**
   * Determine cursor context based on mouse position
   */
  getCursorContext(
    x: number,
    y: number,
    pageAnalysis: PageAnalysis,
    currentTool: string
  ): CursorContext {
    // If a specific tool is selected, use tool-specific cursor
    if (currentTool !== 'select') {
      return this.getToolCursorContext(currentTool);
    }

    // Find the region under the cursor
    const region = this.findRegionAt(x, y, pageAnalysis.regions);

    if (!region) {
      return { type: 'default' };
    }

    // Determine cursor based on content type
    switch (region.type) {
      case 'text':
        return {
          type: 'text',
          region,
          action: 'Select text'
        };
      case 'image':
        return {
          type: 'grab',
          region,
          action: 'Move or select image'
        };
      case 'annotation':
        return {
          type: 'pointer',
          region,
          action: 'Interact with annotation'
        };
      default:
        return { type: 'default' };
    }
  }

  /**
   * Get tool-specific cursor context
   */
  private getToolCursorContext(tool: string): CursorContext {
    switch (tool) {
      case 'highlight':
      case 'draw':
        return { type: 'crosshair', action: 'Draw or highlight' };
      case 'text':
        return { type: 'text', action: 'Add text' };
      case 'hand':
        return { type: 'grab', action: 'Pan document' };
      default:
        return { type: 'default' };
    }
  }

  /**
   * Find content region at specific coordinates
   */
  private findRegionAt(x: number, y: number, regions: ContentRegion[]): ContentRegion | null {
    // Sort by confidence and find the best match
    const candidates = regions.filter(region => {
      const bounds = region.bounds;
      // Add some padding to make text selection more forgiving
      const padding = 2;
      return x >= bounds.x - padding &&
             x <= bounds.x + bounds.width + padding &&
             y >= bounds.y - padding &&
             y <= bounds.y + bounds.height + padding;
    });

    if (candidates.length === 0) return null;

    // Return the region with highest confidence
    return candidates.reduce((best, current) => 
      current.confidence > best.confidence ? current : best
    );
  }

  /**
   * Clear analysis cache for memory management
   */
  clearCache(pageNumber?: number): void {
    if (pageNumber !== undefined) {
      // Clear specific page
      for (const [key] of this.pageAnalysisCache) {
        if (key.startsWith(`${pageNumber}-`)) {
          this.pageAnalysisCache.delete(key);
        }
      }
    } else {
      // Clear all cache
      this.pageAnalysisCache.clear();
    }
  }

  /**
   * Get text selection bounds for intelligent text selection
   */
  getTextSelectionBounds(
    startX: number,
    startY: number,
    endX: number,
    endY: number,
    pageAnalysis: PageAnalysis
  ): ContentRegion[] {
    const selectedRegions: ContentRegion[] = [];
    
    const minX = Math.min(startX, endX);
    const maxX = Math.max(startX, endX);
    const minY = Math.min(startY, endY);
    const maxY = Math.max(startY, endY);

    for (const region of pageAnalysis.textBlocks) {
      const bounds = region.bounds;
      
      // Check if text region intersects with selection area
      // Make selection more forgiving by reducing the required overlap
      const overlapX = Math.max(0, Math.min(maxX, bounds.x + bounds.width) - Math.max(minX, bounds.x));
      const overlapY = Math.max(0, Math.min(maxY, bounds.y + bounds.height) - Math.max(minY, bounds.y));
      
      // Include if there's any overlap or if the region is within the selection area
      if (overlapX > 0 && overlapY > 0) {
        selectedRegions.push(region);
      }
    }

    // Sort by y position first, then x position for reading order
    selectedRegions.sort((a, b) => {
      const yDiff = a.bounds.y - b.bounds.y;
      if (Math.abs(yDiff) < 5) { // Same line (within 5px)
        return a.bounds.x - b.bounds.x;
      }
      return yDiff;
    });

    return selectedRegions;
  }
}

// Export singleton instance
export const contentAnalyzer = new ContentAnalyzer();

// Utility functions for cursor management integration
export const getCursorForContent = (
  x: number,
  y: number,
  pageAnalysis: PageAnalysis | null,
  currentTool: string
): string => {
  if (!pageAnalysis) return 'default';

  const context = contentAnalyzer.getCursorContext(x, y, pageAnalysis, currentTool);
  
  switch (context.type) {
    case 'text':
      return 'text';
    case 'grab':
      return 'grab';
    case 'crosshair':
      return 'crosshair';
    case 'pointer':
      return 'pointer';
    default:
      return 'default';
  }
};
