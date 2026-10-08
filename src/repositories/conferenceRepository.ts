import type { ConferenceRecord } from '../types/conference.types';

const STORAGE_KEY = 'maxi-conferences';

export function saveConference(record: ConferenceRecord): void {
  const history = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') as ConferenceRecord[];
  localStorage.setItem(STORAGE_KEY, JSON.stringify([record, ...history]));
}

export function getConferences(): ConferenceRecord[] {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') as ConferenceRecord[];
}
