import { Platform } from 'react-native';
import * as Calendar from 'expo-calendar';

export type CalendarProvider = 'apple' | 'outlook' | 'none';

export interface TimeBlock {
  title: string;
  startDate: Date;
  endDate: Date;
  notes?: string;
}

// ─── Permission & Discovery ───────────────────────────────

export async function requestCalendarPermission(): Promise<boolean> {
  if (Platform.OS === 'web') return false;

  const { status } = await Calendar.requestCalendarPermissionsAsync();
  return status === 'granted';
}

export async function getAvailableCalendars(): Promise<Calendar.Calendar[]> {
  if (Platform.OS === 'web') return [];

  const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
  return calendars.filter((c) => c.allowsModifications);
}

export async function getDefaultCalendarId(): Promise<string | null> {
  if (Platform.OS === 'ios') {
    const defaultCal = await Calendar.getDefaultCalendarAsync();
    return defaultCal?.id ?? null;
  }

  // Android / fallback: pick the first modifiable calendar
  const calendars = await getAvailableCalendars();
  return calendars[0]?.id ?? null;
}

// ─── Apple Calendar (native via expo-calendar) ────────────

export async function createNativeTimeBlock(
  calendarId: string,
  block: TimeBlock,
): Promise<string | null> {
  if (Platform.OS === 'web') return null;

  const eventId = await Calendar.createEventAsync(calendarId, {
    title: block.title,
    startDate: block.startDate,
    endDate: block.endDate,
    notes: block.notes ?? 'Blocked by Tempo',
    availability: Calendar.Availability.BUSY,
  });

  return eventId;
}

export async function removeNativeTimeBlock(eventId: string): Promise<void> {
  if (Platform.OS === 'web') return;
  await Calendar.deleteEventAsync(eventId);
}

// ─── Outlook Calendar (Microsoft Graph API) ───────────────

// In production this would use MSAL / expo-auth-session to get an OAuth token
// For now, this is a typed stub that shows the integration shape

interface OutlookConfig {
  accessToken: string;
}

export async function createOutlookTimeBlock(
  config: OutlookConfig,
  block: TimeBlock,
): Promise<string | null> {
  const response = await fetch('https://graph.microsoft.com/v1.0/me/events', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      subject: block.title,
      start: {
        dateTime: block.startDate.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      end: {
        dateTime: block.endDate.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      body: {
        contentType: 'Text',
        content: block.notes ?? 'Blocked by Tempo',
      },
      showAs: 'busy',
      isReminderOn: false,
    }),
  });

  if (!response.ok) return null;

  const data = await response.json();
  return data.id ?? null;
}

export async function removeOutlookTimeBlock(
  config: OutlookConfig,
  eventId: string,
): Promise<void> {
  await fetch(`https://graph.microsoft.com/v1.0/me/events/${encodeURIComponent(eventId)}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${config.accessToken}`,
    },
  });
}

// ─── Unified API ──────────────────────────────────────────

export async function blockTime(
  provider: CalendarProvider,
  block: TimeBlock,
  options?: { calendarId?: string; outlookToken?: string },
): Promise<string | null> {
  switch (provider) {
    case 'apple': {
      const calId = options?.calendarId ?? (await getDefaultCalendarId());
      if (!calId) return null;
      return createNativeTimeBlock(calId, block);
    }
    case 'outlook': {
      if (!options?.outlookToken) return null;
      return createOutlookTimeBlock(
        { accessToken: options.outlookToken },
        block,
      );
    }
    default:
      return null;
  }
}

export async function unblockTime(
  provider: CalendarProvider,
  eventId: string,
  options?: { outlookToken?: string },
): Promise<void> {
  switch (provider) {
    case 'apple':
      return removeNativeTimeBlock(eventId);
    case 'outlook':
      if (!options?.outlookToken) return;
      return removeOutlookTimeBlock(
        { accessToken: options.outlookToken },
        eventId,
      );
  }
}
