import { WasteBin } from '../types';

/**
 * Check if a bin's camera is offline (no data received in last 10 hours)
 * @param bin - The waste bin to check
 * @returns true if camera is offline, false otherwise
 */
export function isCameraOffline(bin: WasteBin): boolean {
  const TEN_HOURS_MS = 10 * 60 * 60 * 1000; // 10 hours in milliseconds
  const now = new Date().getTime();
  
  // Check lastAnalysis timestamp
  let lastUpdateTime: number | null = null;
  
  if (bin.lastAnalysis) {
    // Try to parse lastAnalysis - it might be ISO string or formatted string
    try {
      const parsed = new Date(bin.lastAnalysis);
      if (!isNaN(parsed.getTime())) {
        lastUpdateTime = parsed.getTime();
      }
    } catch (e) {
      // If parsing fails, try to extract from formatted string like "CCTV (AI): 10:30:45"
      const match = bin.lastAnalysis.match(/(\d{1,2}):(\d{2}):(\d{2})/);
      if (match) {
        const today = new Date();
        today.setHours(parseInt(match[1]), parseInt(match[2]), parseInt(match[3]), 0);
        lastUpdateTime = today.getTime();
      }
    }
  }
  
  // Also check deviceHealth.lastPing if available
  if (bin.deviceHealth?.lastPing) {
    try {
      const pingTime = new Date(bin.deviceHealth.lastPing).getTime();
      if (!isNaN(pingTime) && (!lastUpdateTime || pingTime > lastUpdateTime)) {
        lastUpdateTime = pingTime;
      }
    } catch (e) {
      // Ignore parsing errors
    }
  }
  
  // If no timestamp found, consider camera offline
  if (!lastUpdateTime) {
    return true;
  }
  
  // Check if more than 10 hours have passed
  const timeSinceLastUpdate = now - lastUpdateTime;
  return timeSinceLastUpdate > TEN_HOURS_MS;
}

/**
 * Get camera status message for a bin
 * @param bin - The waste bin to check
 * @returns Status message string
 */
export function getCameraStatusMessage(bin: WasteBin): string {
  if (isCameraOffline(bin)) {
    return 'Kamera ishlamayabdi';
  }
  return 'Kamera ishlayapti';
}

/**
 * Deduplicate bins by ID only
 * Address-based deduplication is too aggressive and removes valid bins
 * If there are truly duplicate bins, they should be cleaned at the database level
 * @param bins - Array of bins to deduplicate
 * @returns Deduplicated array
 */
export function deduplicateBins(bins: WasteBin[]): WasteBin[] {
  // Deduplicate by ID (primary key) only
  // If same ID appears multiple times, keep the last one (most recent)
  const uniqueById = new Map<string, WasteBin>();
  
  for (const bin of bins) {
    if (!bin || !bin.id) continue;
    
    // Always keep unique IDs - if same ID appears, replace with latest
    uniqueById.set(bin.id, bin);
  }
  
  return Array.from(uniqueById.values());
}

/**
 * Add or update a bin in an array, ensuring no duplicates
 * @param bins - Current array of bins
 * @param newBin - Bin to add or update
 * @returns New array with bin added/updated
 */
export function addOrUpdateBin(bins: WasteBin[], newBin: WasteBin): WasteBin[] {
  const uniqueBins = deduplicateBins(bins);
  const existingIndex = uniqueBins.findIndex(b => b.id === newBin.id);
  
  if (existingIndex !== -1) {
    // Update existing bin
    uniqueBins[existingIndex] = newBin;
  } else {
    // Add new bin
    uniqueBins.push(newBin);
  }
  
  return uniqueBins;
}
