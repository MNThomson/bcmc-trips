import type { Trip } from './types';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Parse trips from BCMC HTML using regex (Workers don't have DOM)
export function parseTrips(html: string): Trip[] {
  const trips: Trip[] = [];
  
  // Track current month context from section headers
  let currentMonth = '';
  
  // BCMC uses <div class="trip_list_month-year"> Jan 2026 </div> for month headers
  const monthHeaderRegex = /trip_list_month-year[^>]*>\s*(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s*\d{4}/gi;
  
  // Find all trip rows in the trip_list_table
  // Each row has: date-time cell, information cell, participants cell, organizer cell
  const tripRowRegex = /<tr>\s*<td[^>]*trip_list_date-time[^>]*>([\s\S]*?)<\/td>\s*<td[^>]*trip_list_information[^>]*>([\s\S]*?)<\/td>\s*<td[^>]*trip_list_participants[^>]*>([\s\S]*?)<\/td>\s*<td[^>]*trip_list_organizer[^>]*>([\s\S]*?)<\/td>\s*<\/tr>/gi;
  
  let match;
  while ((match = tripRowRegex.exec(html)) !== null) {
    const [, dateCell, tripInfoCell, participantsCell, organizerCell] = match;
    
    // Check for month context before this trip in the HTML
    // BCMC uses <div class="trip_list_month-year"> Jan 2026 </div>
    const htmlBeforeTrip = html.substring(0, match.index);
    const monthMatches = [...htmlBeforeTrip.matchAll(monthHeaderRegex)];
    if (monthMatches.length > 0) {
      const lastMonthMatch = monthMatches[monthMatches.length - 1][0];
      // Extract just the month abbreviation (Jan, Feb, etc.)
      const monthExtract = lastMonthMatch.match(/(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/i);
      if (monthExtract) {
        currentMonth = monthExtract[1];
      }
    }
    
    // Parse dates - start is in <strong>, end comes after "to"
    const dateStartMatch = dateCell.match(/<strong>([^<]+)<\/strong>/i);
    
    // Cleaner date extraction - get text after the last <br>
    const dateEndClean = dateCell.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').trim();
    const dateEndParts = dateEndClean.split(/\s+to\s+/i);
    const dateEndRaw = dateEndParts.length > 1 ? dateEndParts[1].trim() : dateEndParts[0].trim();
    const dateStartRaw = dateStartMatch ? dateStartMatch[1].trim() : '';
    
    // Check if dates already contain month info (e.g., "Feb 2" vs "Fri 2")
    const hasMonthInStart = MONTHS.some(m => dateStartRaw.toLowerCase().startsWith(m.toLowerCase()));
    const hasMonthInEnd = MONTHS.some(m => dateEndRaw.toLowerCase().startsWith(m.toLowerCase()));
    
    // Build full date strings with month
    const dateStart = hasMonthInStart ? dateStartRaw : (currentMonth ? `${currentMonth} ${dateStartRaw.replace(/^\w+\s*/, '')}` : dateStartRaw);
    const dateEnd = hasMonthInEnd ? dateEndRaw : (currentMonth ? `${currentMonth} ${dateEndRaw.replace(/^\w+\s*/, '')}` : dateEndRaw);
    
    // Parse trip name and URL from trip_title div
    const nameMatch = tripInfoCell.match(/class="trip_title"[^>]*>\s*<a[^>]*href="([^"]+)"[^>]*>([^<]+)<\/a>/i);
    if (!nameMatch) continue;
    
    const [, tripUrl, tripName] = nameMatch;
    
    // Parse activity type from category div
    const categoryMatch = tripInfoCell.match(/<div class="category">([^<]+)<\/div>/i);
    const type = categoryMatch ? categoryMatch[1].trim() : 'Unknown';
    
    // Parse grade from span
    const gradeMatch = tripInfoCell.match(/Grade:\s*<span>([^<]+)<\/span>/i);
    const grade = gradeMatch ? gradeMatch[1].trim() : '';
    
    // Parse description from trip_list_desc
    const descMatch = tripInfoCell.match(/class="trip_list_desc"[^>]*><em>([^<]*)<\/em>/i);
    const description = descMatch ? descMatch[1].trim() : '';
    
    // Check for members only and screening
    const membersOnly = tripInfoCell.includes('Members Only');
    const screening = tripInfoCell.includes('Screening');
    
    // Parse participants from nested table
    const maxMatch = participantsCell.match(/Maximum:<\/th><td>(\d+)<\/td>/i);
    const regMatch = participantsCell.match(/Registered:<\/th><td>(\d+)<\/td>/i);
    const waitMatch = participantsCell.match(/Waiting List:<\/th><td>(\d+)<\/td>/i);
    
    // Parse organizer
    const orgMatch = organizerCell.match(/<a[^>]*href="([^"]+)"[^>]*>([^<]+)<\/a>/i);
    
    trips.push({
      dateStart,
      dateEnd,
      dateDisplay: `${dateStart} → ${dateEnd}`,
      name: tripName.trim(),
      url: tripUrl.startsWith('http') ? tripUrl : `https://bcmc.ca${tripUrl}`,
      type,
      grade,
      description,
      maxParticipants: maxMatch ? parseInt(maxMatch[1], 10) : 0,
      registered: regMatch ? parseInt(regMatch[1], 10) : 0,
      waitingList: waitMatch ? parseInt(waitMatch[1], 10) : 0,
      organizer: orgMatch ? orgMatch[2].trim() : 'Unknown',
      organizerUrl: orgMatch ? (orgMatch[1].startsWith('http') ? orgMatch[1] : `https://bcmc.ca${orgMatch[1]}`) : '#',
      membersOnly,
      screening,
    });
  }
  
  return trips;
}

// Convert date display to sortable ISO-ish format
export function parseDateForSort(dateStr: string): string {
  // dateStr like "Thu 1" or "Sat 15" - we need to extract day number
  // Since we don't have year/month context easily, we'll use the order they appear
  const dayMatch = dateStr.match(/(\d+)/);
  return dayMatch ? dayMatch[1].padStart(2, '0') : '00';
}

