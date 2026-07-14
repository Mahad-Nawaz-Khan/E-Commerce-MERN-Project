/**
 * 5-star rating — extracted from the repeated inline SVG star markup used
 * across the original's FlashSales / BestSelling / ExploreProducts / Wishlist.
 * Filled stars = Math.floor(rating), rest grey.
 */
const STAR_PATH =
  'M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z'

function StarRating({ rating = 0, className = '', starClassName = '' }) {
  return (
    <div className={`flex ${className}`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          className={`${i < Math.floor(rating) ? 'text-[#FFAD33]' : 'text-[#666666]'} ${
            starClassName || 'w-3 h-3 sm:w-4 sm:h-4'
          }`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d={STAR_PATH} />
        </svg>
      ))}
    </div>
  )
}

export { StarRating }
