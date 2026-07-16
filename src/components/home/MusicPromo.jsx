import { Button } from '../ui/Button'
import { useCountdown, useStableTarget, pad, DURATIONS } from '../../hooks/useCountdown'
import { Link } from 'react-router-dom'

/**
 * JBL speaker promo banner — black background with a live countdown and a
 * "Buy Now!" CTA.
 */
function MusicPromo() {
  // Live countdown — ~2 days from first mount, ticking every second
  const target = useStableTarget(2 * DURATIONS.DAY + 5 * DURATIONS.HOUR)
  const { hours, days, minutes, seconds } = useCountdown(target)

  return (
    <section className="max-w-292.5 mx-auto px-4 sm:px-6 lg:px-0 py-12 sm:py-16">
      <div className="relative overflow-hidden">
        <div className="bg-black text-white p-8 sm:p-12 lg:p-14 min-h-105 sm:min-h-125 flex flex-col sm:flex-row items-center">
          {/* Left Content */}
          <div className="w-full sm:w-1/2 z-10">
            <span className="text-[#00FF66] text-sm sm:text-base mb-4 block">Categories</span>
            <h2 className="text-3xl sm:text-5xl font-semibold tracking-[0.04em] mb-8 sm:mb-12 leading-tight">
              Enhance Your
              <br />
              Music Experience
            </h2>

            {/* Timer Circles */}
            <div className="flex gap-4 mb-8">
              {[
                [pad(days), 'Days'],
                [pad(hours), 'Hours'],
                [pad(minutes), 'Minutes'],
                [pad(seconds), 'Seconds'],
              ].map(([value, label]) => (
                <div
                  key={label}
                  className="bg-white rounded-full w-14 sm:w-16 h-14 sm:h-16 flex flex-col items-center justify-center text-black"
                >
                  <span className="text-sm sm:text-base font-bold">{value}</span>
                  <span className="text-2.5">{label}</span>
                </div>
              ))}
            </div>

            <Link to="/product/jbl-bluetooth-speaker">
              <Button className="bg-[#00FF66] hover:bg-[#00FF66]/90 text-black font-medium px-8 h-12 rounded">Buy Now!</Button>
            </Link>
          </div>

          {/* Right Image */}
          <div className="w-full sm:w-1/2 relative h-50 sm:h-full mt-6 sm:mt-0 sm:absolute sm:right-0 sm:top-0">
            <img
              src="/images/products/jbl-speaker.png"
              alt="JBL Speaker"
              className="absolute inset-0 w-full h-full object-contain"
            />
          </div>
        </div>
      </div>
    </section>
  )
}

export { MusicPromo }
