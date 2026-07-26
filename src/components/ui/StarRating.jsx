import { Rate } from 'antd'

function StarRating({ rating = 0, className = '', starClassName = '' }) {
  return (
    <Rate
      disabled
      allowHalf={false}
      value={Math.floor(rating)}
      className={`flex! leading-none! [&_.ant-rate-star]:mr-0.5! [&_.ant-rate-star]:text-muted-text! [&_.ant-rate-star-full_.ant-rate-star-second]:text-rating! [&_.ant-rate-star-full_.ant-rate-star-first]:text-rating! ${starClassName || 'text-xs sm:text-sm'} ${className}`}
    />
  )
}

export { StarRating }
