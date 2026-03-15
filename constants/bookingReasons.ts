// ─────────────────────────────────────────────────────
// Cultivator proposal reason templates
// Variables: [name], [days], [goal], [event], [target],
//            [slot], [duration], [percent], [appointment]
// Every reason references the life model — never generic.
// ─────────────────────────────────────────────────────

import type { BookingCategory } from '../store/types';

export const BOOKING_REASON_TEMPLATES: Record<BookingCategory, string[]> = {
  body_maintenance: [
    'It\u2019s been [days] days. You mentioned wanting to feel sharper heading into [event].',
    'Your last [appointment] was [days] days ago. I found a quiet [slot] that won\u2019t interrupt anything important.',
    'Movement is at [percent]% this week. Last time you walked, you came back with the pricing model insight.',
  ],
  body_appointment: [
    'Your [appointment] is overdue by [days] days. I found [slot] — it\u2019s a low-energy window so nothing critical gets displaced.',
    'You set a [target]-week cadence for this. It\u2019s been [days] days.',
  ],
  mind_deep_work: [
    'You\u2019ve had [days] consecutive days of reactive work. Your [goal] goal needs uninterrupted time.',
    'Your peak hours tomorrow ([slot]) are currently open. I\u2019d like to hold them for [goal] before something else fills them.',
  ],
  mind_thought_partner: [
    'You\u2019ve had [days] consecutive days of reactive work with no thinking time. Your [goal] goal is [percent]% behind.',
    'Something in your last reflection suggested you needed space to think. I\u2019d like to give you that.',
    'Your [goal] goal hasn\u2019t moved in [days] days. A focused session might unstick it.',
  ],
  relationships_mentor: [
    'You set a goal to speak with [name] monthly. It\u2019s been [days] days \u2014 and [event] is coming up where their perspective would land well.',
    '[name] made your relationship-critical list. You haven\u2019t spoken in [days] days.',
    'Your board review is in [days] days. [name]\u2019s perspective on [goal] would be worth having before then.',
  ],
  relationships_maintenance: [
    'You haven\u2019t reached out to [name] in [days] days. Your target was every [target] days.',
    '[name] is in your \u201Cimportant\u201D tier. A quick check-in would keep that connection alive.',
  ],
  professional_craft: [
    'Your [goal] goal is [percent]% behind target. I found a [duration]-minute window during your peak hours.',
    'You mentioned wanting to ship [goal] this month. You\u2019ve had [days] days without dedicated craft time.',
  ],
  self_knowledge: [
    'You haven\u2019t had a reflection session in [days] days. Your life model works better when you update it.',
    'Your last check-in mentioned feeling [event]. A quiet self-knowledge block might help you name what\u2019s shifting.',
  ],
  life_logistics: [
    'This has been on your list for [days] days. I found a low-energy [slot] where it won\u2019t cost you anything important.',
    '[appointment] is due. Better to handle it in a [duration]-minute block than let it linger.',
  ],
  serendipity: [
    'You haven\u2019t had unstructured time in [days] days. No agenda. No output. Just yours.',
    'There\u2019s a quiet [slot] opening up. I\u2019d like to hold it for nothing \u2014 and protect it from everything.',
  ],
  recovery: [
    'You\u2019ve just come out of [duration] of back-to-back meetings. This buffer is yours to decompress.',
    'Post-[event] decompression. The thinking happens after, not during.',
    'You have [duration] of meetings ahead. I\u2019m booking a recovery buffer on the other side.',
  ],
};
