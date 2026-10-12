// Timezone policy: a link stays open through the END of its chosen calendar
// day in UTC. The friend form sends a date-only "YYYY-MM-DD", which
// `new Date()` parses as UTC midnight, so the UTC date of `validUntil` is the
// day the giver picked. Reading it back in UTC (instead of the server's local
// zone, as the pages used to) keeps the cut-off identical on Vercel, a dev
// laptop, and inside saveGameResult. For WIB (UTC+7) that is 06:59 the next
// morning local time, the same moment production already used.
export function linkClosesAt(validUntil: Date): Date {
  return new Date(
    Date.UTC(
      validUntil.getUTCFullYear(),
      validUntil.getUTCMonth(),
      validUntil.getUTCDate(),
      23,
      59,
      59,
      999
    )
  );
}

export function isLinkExpired(
  validUntil: Date | string | null | undefined,
  now: Date = new Date()
): boolean {
  if (validUntil == null) return false;
  const date = new Date(validUntil);
  // An unparseable deadline can't be enforced; treat it as "no deadline"
  // rather than locking the receiver out of a link that was never closed.
  if (Number.isNaN(date.getTime())) return false;
  return now.getTime() > linkClosesAt(date).getTime();
}
