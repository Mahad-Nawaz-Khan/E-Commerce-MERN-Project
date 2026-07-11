import { useEffect, useState } from 'react'

/**
 * Compute the breakdown of time remaining until `target` (ms epoch).
 * Returns normalized values (minutes always 0-59, etc.) and never negative.
 */
function getTimeLeft(target) {
  const diff = Math.max(0, target - Date.now())
  const totalSeconds = Math.floor(diff / 1000)
  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
    isOver: diff === 0,
  }
}

/**
 * Live countdown hook. Pass a target timestamp (ms epoch) and read back
 * { days, hours, minutes, seconds, isOver }, updated every second.
 *
 *   const target = useStableTarget(3 * DAY)
 *   const { days, hours, minutes, seconds } = useCountdown(target)
 *
 * The interval is cleared on unmount.
 */
export function useCountdown(target) {
  const [timeLeft, setTimeLeft] = useState(() => getTimeLeft(target))

  useEffect(() => {
    setTimeLeft(getTimeLeft(target))
    const id = setInterval(() => setTimeLeft(getTimeLeft(target)), 1000)
    return () => clearInterval(id)
  }, [target])

  return timeLeft
}

/** Pad a number to 2 digits — handy for clock-style "03", "09" display. */
export const pad = (n) => String(n).padStart(2, '0')

const DAY = 1000 * 60 * 60 * 24
const HOUR = 1000 * 60 * 60
const MINUTE = 1000 * 60
const SECOND = 1000

/**
 * Build a target timestamp `durationMs` from now, computed once and frozen
 * for the component's lifetime (so the countdown doesn't reset on re-render).
 * Use this to feed a stable target into useCountdown.
 */
export function useStableTarget(durationMs) {
  const [target] = useState(() => Date.now() + durationMs)
  return target
}

export const DURATIONS = { DAY, HOUR, MINUTE, SECOND }
