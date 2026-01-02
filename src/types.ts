export interface Trip {
  dateStart: string;
  dateEnd: string;
  dateDisplay: string;
  name: string;
  url: string;
  type: string;
  grade: string;
  description: string;
  maxParticipants: number;
  registered: number;
  waitingList: number;
  organizer: string;
  organizerUrl: string;
  membersOnly: boolean;
  screening: boolean;
}

