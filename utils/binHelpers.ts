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
 * Deduplicate bins by ID and address only
 * Location-based deduplication is too aggressive and removes valid bins
 * @param bins - Array of bins to deduplicate
 * @returns Deduplicated array
 */
export function deduplicateBins(bins: WasteBin[]): WasteBin[] {
  // First, deduplicate by ID (primary key) - this is the most important
  const uniqueById = new Map<string, WasteBin>();
  const uniqueByAddress = new Map<string, WasteBin>();
  
  for (const bin of bins) {
    if (!bin || !bin.id) continue;
    
    // Deduplicate by ID - if same ID, keep the latest one
    if (!uniqueById.has(bin.id)) {
      uniqueById.set(bin.id, bin);
      
      // Also track by address to catch duplicates with different IDs but same address
      // Only if address is provided and not empty
      if (bin.address && bin.address.trim()) {
        const addressKey = bin.address.trim().toLowerCase();
        if (!uniqueByAddress.has(addressKey)) {
          uniqueByAddress.set(addressKey, bin);
        } else {
          // If we already have a bin with this exact address, keep the one with better data
          const existing = uniqueByAddress.get(addressKey)!;
          // Only replace if new bin has significantly better data
          const newBinHasData = bin.imageUrl || bin.lastAnalysis || bin.fillLevel !== undefined;
          const existingHasData = existing.imageUrl || existing.lastAnalysis || existing.fillLevel !== undefined;
          
          if (newBinHasData && !existingHasData) {
            // New bin has data, existing doesn't - replace
            uniqueByAddress.set(addressKey, bin);
            uniqueById.set(bin.id, bin);
            // Remove old bin if it has different ID
            if (existing.id !== bin.id) {
              uniqueById.delete(existing.id);
            }
          } else if (existing.id === bin.id) {
            // Same ID, just update
            uniqueById.set(bin.id, bin);
            uniqueByAddress.set(addressKey, bin);
          }
          // Otherwise, keep existing bin (don't add duplicate)
        }
      }
    }
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
