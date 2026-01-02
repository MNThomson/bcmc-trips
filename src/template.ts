import type { Trip } from './types';

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
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
    
    return `
      <article class="trip" 
        data-type="${escapeHtml(trip.type.toLowerCase())}"
        data-name="${escapeHtml(trip.name.toLowerCase())}"
        data-index="${index}"
        data-spots="${spotsLeft}">
        ${dateBox}
        <div class="trip-content">
          <div class="trip-row">
            <div class="trip-main">
              <h2 class="trip-name">
                <a href="${escapeHtml(trip.url)}" target="_blank" rel="noopener">${escapeHtml(trip.name)}</a>
              </h2>
              <div class="trip-info">
                <span class="trip-type">${escapeHtml(trip.type)}</span>
                ${trip.grade ? `<span class="trip-grade">${escapeHtml(trip.grade)}</span>` : ''}
              </div>
            </div>
            <div class="trip-side">
              <span class="trip-availability ${isFull ? 'full' : 'available'}">
                ${trip.registered}/${trip.maxParticipants}
              </span>${isFull && trip.waitingList > 0 ? `<span class="trip-waitlist">(${trip.waitingList})</span>` : ''}
              <div class="trip-badges">
                ${trip.membersOnly ? '<span class="badge members">Members</span>' : ''}
                ${trip.screening ? '<span class="badge screening">Screening</span>' : ''}
              </div>
              <span class="trip-organizer">
                <a href="${escapeHtml(trip.organizerUrl)}" target="_blank" rel="noopener">${escapeHtml(trip.organizer)}</a>
              </span>
            </div>
          </div>
          ${trip.description ? `<p class="trip-desc">${escapeHtml(trip.description)}</p>` : ''}
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
    
    .trip-info {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.8125rem;
    }
    
    .trip-type {
      color: var(--text-muted);
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    
    .trip-grade {
      font-size: 0.6875rem;
      background: var(--border);
      padding: 0.125rem 0.5rem;
      border-radius: 3px;
      font-weight: 500;
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

