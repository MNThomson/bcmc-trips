import { parseTrips } from './parser';
import { generateHtml } from './template';

interface Env {
  BCMC_URL: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    try {
      // Fetch the BCMC events page
      const response = await fetch(env.BCMC_URL, {
        headers: {
          'User-Agent': 'BCMC-Trips-Viewer/1.0',
          'Accept': 'text/html',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch BCMC: ${response.status}`);
      }
      
      const html = await response.text();
      const trips = parseTrips(html);
      const pageHtml = generateHtml(trips);
      
      return new Response(pageHtml, {
        headers: {
          'Content-Type': 'text/html;charset=UTF-8',
          'Cache-Control': 'public, max-age=300', // Cache for 5 minutes
        },
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return new Response(`Error: ${errorMessage}`, {
        status: 500,
        headers: { 'Content-Type': 'text/plain' },
      });
    }
  },
};
