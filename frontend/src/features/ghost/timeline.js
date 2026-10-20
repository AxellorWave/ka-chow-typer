export function progressAt(timeline, t) {
  if (!timeline?.length) return 0
  const last = timeline.length - 1
  if (t <= timeline[0][0]) return timeline[0][1]
  if (t >= timeline[last][0]) return timeline[last][1]

  let low = 0
  let high = last
  while (high - low > 1) {
    const middle = (low + high) >> 1
    if (timeline[middle][0] <= t) low = middle
    else high = middle
  }

  const [t0, p0] = timeline[low]
  const [t1, p1] = timeline[high]
  return t1 === t0 ? p1 : p0 + ((p1 - p0) * (t - t0)) / (t1 - t0)
}

export function elapsedMs({ startedAt, pausedAt, finishedAt }, now) {
  if (startedAt === null) return 0
  return Math.max(0, (finishedAt ?? pausedAt ?? now) - startedAt)
}
