// Contextual daily observations — direct, no sentiment

interface Nudge {
  text: string;
  match: (date: Date) => boolean;
}

const nudges: Nudge[] = [
  // Day-of-week
  { text: 'Monday. Start slow.', match: (d) => d.getDay() === 1 },
  { text: 'Midweek. Good day to call someone.', match: (d) => d.getDay() === 3 },
  { text: 'Friday. Finish something, don\u2019t start something.', match: (d) => d.getDay() === 5 },
  { text: 'Weekend. Guard it.', match: (d) => d.getDay() === 6 },
  { text: 'Sunday. Let tomorrow wait.', match: (d) => d.getDay() === 0 },

  // Seasonal
  { text: 'Days are getting longer. Walk while there\u2019s light.', match: (d) => d.getMonth() >= 2 && d.getMonth() <= 4 },
  { text: 'Summer. Pick one thing, not five.', match: (d) => d.getMonth() >= 5 && d.getMonth() <= 7 },
  { text: 'Air\u2019s changing. Good time to revisit what you\u2019re reading.', match: (d) => d.getMonth() >= 8 && d.getMonth() <= 10 },
  { text: 'Dark mornings. Ease in.', match: (d) => d.getMonth() === 11 || d.getMonth() <= 1 },

  // Monthly
  { text: 'First of the month. Next step, not fresh start.', match: (d) => d.getDate() === 1 },
  { text: 'Mid-month. Notice what changed.', match: (d) => d.getDate() >= 14 && d.getDate() <= 16 },
  { text: 'End of month. Drop something that isn\u2019t working.', match: (d) => d.getDate() >= 28 },

  // Universal
  { text: 'Rest isn\u2019t a reward.', match: () => true },
  { text: 'Not everything loud is urgent.', match: () => true },
  { text: 'One thing done well. What is it?', match: () => true },
  { text: 'The plan can change.', match: () => true },
];

export function getDailyNudge(date: Date = new Date()): string {
  // Filter to nudges that match today
  const eligible = nudges.filter((n) => n.match(date));

  // Use the date as a seed so the nudge is stable for the whole day
  const daySeed = date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
  const index = daySeed % eligible.length;

  return eligible[index].text;
}
