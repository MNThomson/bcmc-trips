import type { Trip } from './types';

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// NPS Symbol Library - https://github.com/nationalparkservice/symbol-library
function getActivityIcon(type: string): string {
  const icons: Record<string, string> = {
    // Downhill Skiing
    'backcountry skiing': `<path d="M12.3,0.4C11.2-0.3,9.7,0,8.9,1.1c-0.4,0.6-0.5,1.4-0.3,2l1.3,4.2L6,8.5C5.5,8.7,5.2,9.2,5.1,9.7C5,10.5,5.6,10.9,6.4,11c0.2,0,0.3,0,0.5,0l5.3-1.6C12.6,9.2,13,8.8,13,8.5c0-0.2,0.1-0.4,0.1-0.6L12.3,5l3.2,1.9l0.4,2.8c0,0.5,0.3,0.8,0.6,1L20,13c0.5,0.2,1.6,0.2,1.9-0.3s0.1-1-0.4-1.3L18,9.5V7h-1V5h1c-0.4-0.8-0.5-1.5-1-1.8L12.3,0.4L12.3,0.4z"/><polygon points="0,9 19,20 21,20 21,19 22,19 22,20 21,21 19,21 0,10"/><circle cx="20" cy="6" r="2"/>`,
    
    // Trailhead (hiker with sign)
    'hiking': `<path d="M7.6,3.7c0.1-0.3-0.1-0.5-0.4-0.6L5.8,2.8C5.6,2.7,5.3,2.9,5.2,3.2L4,8.2C3.9,8.4,4.1,8.7,4.4,8.8l1.4,0.3C6.1,9.2,6.4,9,6.4,8.8L7.6,3.7z"/><path d="M5,20.5v0.2C5,21.5,5.5,22,6.2,22c0.6,0,1-0.4,1.2-0.9l2.1-8.7l2,8.6c0.1,0.5,0.6,0.9,1.2,0.9c0.7,0,1.2-0.5,1.2-1.2c0-0.1,0-0.2,0-0.3L11.1,9.1l0.2-1l0.2,0.8c0.2,0.5,0.6,0.6,0.6,0.6l2.8,0.7h0.2c0.5,0,0.8-0.4,0.8-0.8c0-0.4-0.3-0.7-0.6-0.8L12.9,8l-0.7-2.7C11.8,4.1,10,4,10,4C9.3,4,8.7,5.2,8.7,5.2L5,20.5z"/><path d="M11.9,3h-0.8C10.5,3,10,2.5,10,1.9V1.1C10,0.5,10.5,0,11.1,0h0.8C12.5,0,13,0.5,13,1.1v0.8C13,2.5,12.5,3,11.9,3z"/><rect x="17.8" y="5" width="1.2" height="17"/>`,
    
    // Walking
    'trail running': `<path d="M10.4,3.6c1,0,1.8-0.8,1.7-1.8c0-1-0.8-1.8-1.8-1.7c-1,0-1.8,0.8-1.7,1.8C8.6,2.8,9.5,3.6,10.4,3.6z"/><path d="M16.5,9.5L13.9,8l-2.2-3.4c-0.3-0.4-0.9-0.8-1.5-0.7C9.7,4,9.3,4.2,9,4.4L5.8,7.7C5.7,7.8,5.6,8,5.6,8.1l-0.4,3.6c0,0,0,0.1,0,0.1c0,0.4,0.4,0.8,0.8,0.8c0.4,0,0.7-0.4,0.8-0.8l0.3-3.1l1.1-1.1l-1,8.6l-1.9,4.1c-0.1,0.1-0.1,0.3-0.1,0.5c0,0.7,0.6,1.2,1.2,1.2c0.5,0,0.9-0.3,1.1-0.7l2-4.4c0-0.1,0.2-0.4,0.2-0.5l0.2-2.1l2.1,6.9c0.2,0.5,0.6,0.8,1.2,0.8c0.7,0,1.2-0.6,1.2-1.2c0-0.1,0-0.1,0-0.2L11.5,11l0.4-3.1l0.8,1.3c0.1,0.1,0.1,0.2,0.2,0.2l2.8,1.6c0.1,0,0.2,0.1,0.4,0.1c0.4,0,0.8-0.4,0.8-0.8C16.9,9.8,16.7,9.6,16.5,9.5z"/>`,
    
    // Technical Rock Climb
    'rock climbing': `<path d="M2.5,9.4c-0.1,0.2-0.2,0.4-0.2,0.7c0,0.1,0,0.2,0,0.4L2.4,16l-1.9,4.1c-0.1,0.1-0.1,0.3-0.1,0.4c-0.1,0.7,0.4,1.3,1,1.4c0.5,0.1,1-0.2,1.3-0.6l2.1-4.5c0-0.1,0.1-0.2,0.1-0.3c0-0.1,0-0.1,0-0.2l0-3.4l3.2,1.4l0.5,3.4c0.1,0.5,0.5,0.9,1,1c0.7,0.1,1.3-0.4,1.4-1c0-0.1,0-0.2,0-0.3l-0.6-4.1c-0.1-0.4-0.3-0.7-0.7-0.9L6.8,11l1.8-3.2l0.9,1.2C9.7,9,9.8,9.1,10,9.2l3.5,1c0.5,0.1,0.9-0.1,1.1-0.6c0.2-0.5,0-1.1-0.5-1.3c0,0,0,0,0,0l-3-0.9L8.7,4.7C8.3,4.3,7.9,4.1,7.3,4C6.4,3.8,5.5,4.3,5.1,5L2.5,9.4z"/><path d="M12.5,17.4l-0.2,1.7l-6,1.5l0.1,1H21c0.5,0,0.9-0.4,0.9-0.9l0-19.7l-2-0.5l-1.2,5.2l-1.9,0.8l-1.7,4.8l1.6,3.7l-0.5,1.4L12.5,17.4z"/><ellipse transform="matrix(0.9871 -0.1602 0.1602 0.9871 -0.1902 1.3795)" cx="8.5" cy="1.9" rx="1.9" ry="1.9"/><path d="M4.7,4c0.1-0.3,0.1-0.6-0.2-0.7L3.6,2.8C3.4,2.6,3.1,2.7,2.9,3L0.1,7.8C0,8,0.1,8.4,0.3,8.5L1.2,9C1.5,9.2,1.8,9.1,2,8.8L4.7,4z"/>`,
    
    // Climbing
    'mixed climbing': `<path d="M21,15h-2.6l1.8-1.8c0.4-0.4,0.4-1,0-1.4c-0.4-0.4-1-0.4-1.4,0L17,13.6V11c0-0.5-0.5-1-1-1s-1,0.5-1,1v2.6l-1.8-1.8c-0.4-0.4-1-0.4-1.4,0c-0.4,0.4-0.4,1,0,1.4l1.8,1.8H11c-0.5,0-1,0.5-1,1s0.5,1,1,1h2.6l-1.8,1.8c-0.4,0.4-0.4,1,0,1.4c0.4,0.4,1,0.4,1.4,0l1.8-1.8V21c0,0.5,0.5,1,1,1s1-0.5,1-1v-2.6l1.8,1.8c0.4,0.4,1,0.4,1.4,0c0.4-0.4,0.4-1,0-1.4L18.4,17H21c0.5,0,1-0.5,1-1S21.5,15,21,15z"/><path d="M9,1C8.5,1,8,1.5,8,2v4.6L1.7,0.3l0,0C1.5,0.1,1.3,0,1,0C0.4,0,0,0.4,0,1c0,0.3,0.1,0.5,0.3,0.7L6.6,8H2C1.5,8,1,8.5,1,9s0.5,1,1,1h6h0.6H9c0.5,0,1-0.5,1-1V8.6V8V2C10,1.5,9.5,1,9,1z"/>`,
    
    // Ranger-led Events
    'instructional program': `<path d="M2.8,4.8L1.6,4.5C1.3,4.4,1.1,4.6,1,4.8L0,9.1c0,0.2,0.1,0.4,0.3,0.5l1.2,0.3c0.2,0,0.3,0,0.4-0.2V7h0.7L3,5.7V5h0.1C3,4.9,2.9,4.8,2.8,4.8z"/><path d="M9.1,9.4L7,8.9L6.4,6.5C5.7,6,4.9,6,4.9,6C4.5,6,4.2,6.8,4,7H3.3L3,8.3V10H2.6l-2.3,9.6l0,0v0.2c0,0.6,0.5,1,1,1s0.9-0.3,1-0.7l1.8-7.4l1.7,7.4c0.1,0.5,0.5,0.8,1,0.8c0.6,0,1-0.5,1-1v-0.2L5.5,9.9L5.7,9l0.1,0.7c0.1,0.4,0.5,0.5,0.5,0.5l2.4,0.6h0.1c0.4,0,0.7-0.3,0.7-0.7C9.6,9.7,9.4,9.5,9.1,9.4z"/><polygon points="12,0 12,4 9,2"/><path d="M12,21c0,0,0-6.4,0-7.1c0.4-0.4,3.1-3.3,3.1-3.3c0.2-0.2,0.2-0.4,0.2-0.6c0-0.2-0.1-0.4-0.2-0.6c-0.3-0.3-0.9-0.3-1.2,0L10,13v8H12z"/><path d="M15,21L15,21c-0.6,0-1-0.4-1-1s0.4-1,1-1s1,0.4,1,1S15.6,21,15,21z"/><path d="M18,21L18,21c-0.6,0-1-0.4-1-1s0.4-1,1-1s1,0.4,1,1S18.6,21,18,21z"/><path d="M21,18L21,18c-0.6,0-1-0.4-1-1s0.4-1,1-1s1,0.4,1,1S21.6,18,21,18z"/><path d="M21,21L21,21c-0.6,0-1-0.4-1-1s0.4-1,1-1s1,0.4,1,1S21.6,21,21,21z"/><path d="M21,15L21,15c-0.6,0-1-0.4-1-1s0.4-1,1-1s1,0.4,1,1S21.6,15,21,15z"/><path d="M21,6L21,6c-0.6,0-1-0.4-1-1s0.4-1,1-1s1,0.4,1,1S21.6,6,21,6z"/><path d="M15,3L15,3c-0.6,0-1-0.4-1-1s0.4-1,1-1s1,0.4,1,1S15.6,3,15,3z"/><path d="M18,3L18,3c-0.6,0-1-0.4-1-1s0.4-1,1-1s1,0.4,1,1S18.6,3,18,3z"/><path d="M21,9L21,9c-0.6,0-1-0.4-1-1s0.4-1,1-1s1,0.4,1,1S21.6,9,21,9z"/><path d="M21,3L21,3c-0.6,0-1-0.4-1-1s0.4-1,1-1s1,0.4,1,1S21.6,3,21,3z"/><path d="M21,12L21,12c-0.6,0-1-0.4-1-1s0.4-1,1-1s1,0.4,1,1S21.6,12,21,12z"/><path d="M5.7,5H5.3C4.6,5,4,4.4,4,3.7V3.3C4,2.6,4.6,2,5.3,2h0.4C6.4,2,7,2.6,7,3.3v0.4C7,4.4,6.4,5,5.7,5z"/>`,
    
    // Self-guiding Trail
    'guided instruction': `<path d="M11.3,14.6c-0.2,0.1-0.4,0.1-0.7,0.1c-0.3,0-0.5,0-0.7-0.1l-2.6,6C7,21.1,6.4,21.3,5.8,21c-0.6-0.3-0.8-1-0.6-1.6l3.2-7.3h4.1v-0.7l2.1-1c0.5-0.3,1.2,0.2,1.4,0.8l1,4c0.1,0.6-0.2,1.2-0.8,1.3c-0.6,0.1-1.2-0.2-1.3-0.8l-0.6-2.6L11.3,14.6z"/><path d="M13.1,10.4c4.5-2.2,6.2-9.8,6.2-10.4h-0.6c-0.2,1.6-2.1,7.9-5.6,9.7V10.4z"/><path d="M4.9,8.7C5.1,9.1,5.6,9.3,6,9.1l2.4-0.9V11h4.1V7.7l3.6-5.8c0.3-0.4,0.1-1-0.3-1.3c-0.4-0.3-1-0.1-1.2,0.3l-3.1,5l-1.9,0c-0.1,0-0.2,0-0.4,0.1L6,7.1L4.4,4.6C4.1,4.2,3.5,4.1,3.1,4.3C2.7,4.6,2.6,5.2,2.8,5.6L4.9,8.7z"/><path d="M10.1,5.5c0.9,0,1.6-0.7,1.6-1.6S11,2.2,10.1,2.2C9.2,2.2,8.5,3,8.5,3.9S9.2,5.5,10.1,5.5z"/><rect x="12" y="15" width="1" height="7"/>`,
  };
  
  // Default: Point of Interest
  const defaultIcon = `<path d="M16.911,14.362C15.202,14.228,13.178,14.15,11,14.15c-2.178,0-4.203,0.079-5.912,0.213C2.032,14.602,0,15.021,0,15.5c0,0.746,4.926,1.35,11,1.35c6.074,0,11-0.604,11-1.35C22,15.021,19.967,14.602,16.911,14.362z"/><path d="M16.356,8.179c-0.483-0.297-2.209-1.014-2.895-2.041c-0.646-0.969-1.813-1.009-2.27-0.983h-0.384c-0.457-0.026-1.624,0.013-2.27,0.983C7.852,7.165,6.126,7.882,5.645,8.179C5.162,8.476,5.088,8.512,5.088,8.956v1.402v2.129c1.466-0.113,3.121-0.184,4.866-0.205c0.352-0.013,0.704-0.021,1.046-0.021c0.344,0,0.694,0.008,1.046,0.021c1.747,0.021,3.402,0.092,4.866,0.205v-2.129V8.956C16.911,8.512,16.837,8.476,16.356,8.179z"/>`;
  
  const typeLower = type.toLowerCase();
  const iconPath = icons[typeLower] || defaultIcon;
  
  return `<svg class="nps-icon" width="14" height="14" viewBox="0 0 22 22" fill="currentColor">${iconPath}</svg>`;
}

export function generateHtml(trips: Trip[]): string {
  const uniqueTypes = [...new Set(trips.map(t => t.type))].sort();
  
  const tripCards = trips.map((trip, index) => {
    const spotsLeft = trip.maxParticipants - trip.registered;
    const isFull = spotsLeft <= 0;
    
    // Parse date strings like "Fri 2" or "Feb 2" - extract the day number and any month/day name
    const parseDatePart = (dateStr: string) => {
      const parts = dateStr.trim().split(/\s+/);
      if (parts.length >= 2) {
        return { label: parts[0], day: parts[1] };
      } else if (parts.length === 1) {
        // Just a number
        return { label: '', day: parts[0] };
      }
      return { label: '', day: '?' };
    };
    
    const startParts = parseDatePart(trip.dateStart);
    const endParts = parseDatePart(trip.dateEnd);
    const isMultiDay = trip.dateStart !== trip.dateEnd;
    
    const dateBox = isMultiDay 
      ? `<div class="date-box multi">
          <div class="date-start">
            <span class="date-label">${startParts.label}</span>
            <span class="date-day">${startParts.day}</span>
          </div>
          <div class="date-end">
            <span class="date-label">${endParts.label}</span>
            <span class="date-day">${endParts.day}</span>
          </div>
        </div>`
      : `<div class="date-box">
          <span class="date-label">${startParts.label}</span>
          <span class="date-day">${startParts.day}</span>
        </div>`;
    
    const infoBox = `<div class="info-box">
          <span class="info-grade">${trip.grade ? escapeHtml(trip.grade) : '—'}</span>
          <span class="info-icon">${getActivityIcon(trip.type)}</span>
        </div>`;
    
    return `
      <article class="trip" 
        data-type="${escapeHtml(trip.type.toLowerCase())}"
        data-name="${escapeHtml(trip.name.toLowerCase())}"
        data-index="${index}"
        data-spots="${spotsLeft}">
        <div class="trip-boxes">
          ${dateBox}
          ${infoBox}
        </div>
        <div class="trip-content">
          <div class="trip-row">
            <div class="trip-main">
              <h2 class="trip-name">
                <a href="${escapeHtml(trip.url)}" target="_blank" rel="noopener">${escapeHtml(trip.name)}</a>
              </h2>
            </div>
            <div class="trip-side">
              <div class="trip-badges">
                ${trip.membersOnly ? '<span class="badge members">Members</span>' : ''}
                ${trip.screening ? '<span class="badge screening">Screening</span>' : ''}
              </div>
              <span class="trip-organizer">
                <a href="${escapeHtml(trip.organizerUrl)}" target="_blank" rel="noopener">${escapeHtml(trip.organizer)}</a>
              </span>
            </div>
          </div>
          ${trip.description ? `<p class="trip-desc"><span class="trip-availability ${isFull ? 'full' : 'available'}">${trip.registered}/${trip.maxParticipants}</span>${isFull && trip.waitingList > 0 ? `<span class="trip-waitlist">(${trip.waitingList})</span>` : ''} ${escapeHtml(trip.description)}</p>` : ''}
        </div>
      </article>
    `;
  }).join('\n');

  const typeOptions = uniqueTypes.map(type => 
    `<option value="${escapeHtml(type.toLowerCase())}">${escapeHtml(type)}</option>`
  ).join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>BCMC Trips</title>
  <style>
    :root {
      --bg: #0a0a0b;
      --surface: #141416;
      --border: #2a2a2e;
      --text: #e4e4e7;
      --text-muted: #71717a;
      --accent: #f0f0f0;
      --green: #22c55e;
      --yellow: #eab308;
      --red: #ef4444;
    }
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: "SF Mono", "Fira Code", "JetBrains Mono", monospace;
      background: var(--bg);
      color: var(--text);
      line-height: 1.4;
      min-height: 100vh;
    }
    
    .container {
      max-width: 900px;
      margin: 0 auto;
      padding: 3rem 1.5rem;
    }
    
    header {
      margin-bottom: 3rem;
    }
    
    h1 {
      font-size: 1.5rem;
      font-weight: 400;
      letter-spacing: -0.02em;
      margin-bottom: 0.5rem;
    }
    
    h1 span {
      color: var(--text-muted);
    }
    
    .subtitle {
      color: var(--text-muted);
      font-size: 0.875rem;
    }
    
    .controls {
      display: flex;
      gap: 1rem;
      margin-bottom: 1rem;
      flex-wrap: wrap;
    }
    
    select {
      appearance: none;
      background: var(--surface);
      border: 1px solid var(--border);
      color: var(--text);
      padding: 0.625rem 2rem 0.625rem 0.875rem;
      font-family: inherit;
      font-size: 0.8125rem;
      border-radius: 4px;
      cursor: pointer;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2371717a' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 0.75rem center;
    }
    
    select:hover {
      border-color: var(--text-muted);
    }
    
    select:focus {
      outline: none;
      border-color: var(--accent);
    }
    
    .checkbox-filter {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
      font-size: 0.8125rem;
      color: var(--text-muted);
      user-select: none;
    }
    
    .checkbox-filter:hover {
      color: var(--text);
    }
    
    .checkbox-filter input {
      display: none;
    }
    
    .checkbox-filter .checkmark {
      width: 16px;
      height: 16px;
      border: 1px solid var(--border);
      border-radius: 3px;
      background: var(--surface);
      position: relative;
      transition: border-color 0.15s, background 0.15s;
    }
    
    .checkbox-filter:hover .checkmark {
      border-color: var(--text-muted);
    }
    
    .checkbox-filter input:checked + .checkmark {
      background: var(--green);
      border-color: var(--green);
    }
    
    .checkbox-filter input:checked + .checkmark::after {
      content: '';
      position: absolute;
      left: 5px;
      top: 2px;
      width: 4px;
      height: 8px;
      border: solid var(--bg);
      border-width: 0 2px 2px 0;
      transform: rotate(45deg);
    }
    
    .trip-count {
      color: var(--text-muted);
      font-size: 0.8125rem;
      margin-bottom: 1rem;
    }
    
    .trips {
      display: flex;
      flex-direction: column;
      gap: 1px;
      background: var(--border);
      border: 1px solid var(--border);
      border-radius: 6px;
      overflow: hidden;
    }
    
    .trip {
      background: var(--surface);
      padding: 0.75rem 1rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
    }
    
    .trip[hidden] {
      display: none;
    }
    
    .trip-content {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 0.375rem;
    }
    
    .trip-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
    }
    
    .trip-main {
      flex: 1;
      min-width: 0;
    }
    
    .trip-desc {
      font-size: 0.8125rem;
      color: var(--text-muted);
      font-style: italic;
      line-height: 1.4;
    }
    
    .trip-name {
      font-size: 0.9375rem;
      font-weight: 500;
      margin-bottom: 0.125rem;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    
    .trip-name a {
      color: var(--text);
      text-decoration: none;
    }
    
    .trip-name a:hover {
      text-decoration: underline;
      text-underline-offset: 2px;
    }
    
    .trip-boxes {
      display: flex;
      align-items: center;
      gap: 0.375rem;
      flex-shrink: 0;
    }
    
    .date-box {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: 4.5rem;
      height: 3.5rem;
      padding: 0.375rem;
      background: var(--bg);
      border-radius: 4px;
      text-align: center;
      flex-shrink: 0;
    }
    
    .date-box.multi {
      flex-direction: row;
      gap: 0.375rem;
    }
    
    .date-box.multi .date-start,
    .date-box.multi .date-end {
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    
    .date-box.multi .date-label {
      font-size: 0.5625rem;
    }
    
    .date-box.multi .date-day {
      font-size: 1rem;
    }
    
    .date-box .date-label {
      font-size: 0.6875rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-muted);
      line-height: 1;
    }
    
    .date-box .date-day {
      font-size: 1.375rem;
      font-weight: 600;
      line-height: 1.1;
      color: var(--text);
    }
    
    .info-box {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: 3rem;
      height: 3.5rem;
      padding: 0.375rem;
      background: var(--bg);
      border-radius: 4px;
      text-align: center;
      flex-shrink: 0;
      gap: 0.25rem;
    }
    
    .info-grade {
      font-size: 0.875rem;
      font-weight: 600;
      line-height: 1;
      color: var(--text);
    }
    
    .info-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--text-muted);
    }
    
    .info-icon svg {
      display: block;
    }
    
    .nps-icon {
      display: block;
    }
    
    
    .trip-availability {
      font-weight: 500;
      font-size: 0.8125rem;
    }
    
    .trip-availability.available {
      color: var(--green);
    }
    
    .trip-availability.full {
      color: var(--red);
    }
    
    .trip-waitlist {
      font-size: 0.75rem;
      color: var(--red);
    }
    
    .trip-side {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      flex-shrink: 0;
    }
    
    .trip-badges {
      display: flex;
      gap: 0.25rem;
    }
    
    .badge {
      font-size: 0.625rem;
      text-transform: uppercase;
      letter-spacing: 0.03em;
      padding: 0.125rem 0.375rem;
      border-radius: 3px;
      white-space: nowrap;
    }
    
    .badge.members {
      background: rgba(34, 197, 94, 0.15);
      color: var(--green);
    }
    
    .badge.screening {
      background: rgba(234, 179, 8, 0.15);
      color: var(--yellow);
    }
    
    .trip-organizer {
      font-size: 0.75rem;
    }
    
    .trip-organizer a {
      color: var(--text-muted);
      text-decoration: none;
    }
    
    .trip-organizer a:hover {
      color: var(--text);
    }
    
    .empty-state {
      text-align: center;
      padding: 3rem;
      color: var(--text-muted);
      background: var(--surface);
    }
    
    footer {
      margin-top: 3rem;
      text-align: center;
      font-size: 0.75rem;
      color: var(--text-muted);
    }
    
    footer a {
      color: var(--text-muted);
    }
    
    footer a:hover {
      color: var(--text);
    }
    
    @media (max-width: 600px) {
      .container {
        padding: 2rem 1rem;
      }
      
      .controls {
        flex-direction: column;
        align-items: flex-start;
      }
      
      select {
        width: 100%;
      }
      
      .trip {
        flex-wrap: wrap;
        gap: 0.5rem 0.75rem;
      }
      
      .date-box {
        width: 3.5rem;
        height: 3rem;
      }
      
      .date-box.multi .date-day {
        font-size: 0.875rem;
      }
      
      .info-box {
        width: 2.5rem;
        height: 3rem;
      }
      
      .info-grade {
        font-size: 0.75rem;
      }
      
      .info-icon svg {
        width: 12px;
        height: 12px;
      }
      
      .trip-content {
        flex: 1 1 70%;
      }
      
      .trip-row {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.375rem;
      }
      
      .trip-name {
        white-space: normal;
      }
      
      .trip-side {
        flex-wrap: wrap;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>BCMC <span>Trips</span></h1>
      <p class="subtitle">British Columbia Mountaineering Club</p>
    </header>
    
    <div class="controls">
      <select id="filter-type">
        <option value="">All activities</option>
        ${typeOptions}
      </select>
      <label class="checkbox-filter">
        <input type="checkbox" id="filter-available">
        <span class="checkmark"></span>
        Space available
      </label>
    </div>
    
    <p class="trip-count"><span id="visible-count">${trips.length}</span> of ${trips.length} trips</p>
    
    <div class="trips" id="trips">
      ${trips.length > 0 ? tripCards : '<div class="empty-state">No upcoming trips found</div>'}
    </div>
    
    <footer>
      Data from <a href="https://bcmc.ca/m/events/" target="_blank" rel="noopener">bcmc.ca</a>
    </footer>
  </div>
  
  <script>
    (function() {
      const trips = document.querySelectorAll('.trip');
      const filterType = document.getElementById('filter-type');
      const filterAvailable = document.getElementById('filter-available');
      const visibleCount = document.getElementById('visible-count');
      
      function updateView() {
        const typeFilter = filterType.value.toLowerCase();
        const onlyAvailable = filterAvailable.checked;
        
        let visible = 0;
        trips.forEach(trip => {
          const matchesType = !typeFilter || trip.dataset.type === typeFilter;
          const matchesAvailable = !onlyAvailable || parseInt(trip.dataset.spots) > 0;
          const show = matchesType && matchesAvailable;
          trip.hidden = !show;
          if (show) visible++;
        });
        
        visibleCount.textContent = visible;
      }
      
      filterType.addEventListener('change', updateView);
      filterAvailable.addEventListener('change', updateView);
    })();
  </script>
</body>
</html>`;
}

