import { Rate } from 'antd'

function StarRating({ rating = 0, className = '', starClassName = '' }) {
  return (
    <Rate
      disabled
      allowHalf={false}
      value={Math.floor(rating)}
      className={`!flex !leading-none [&_.ant-rate-star]:!mr-0.5 [&_.ant-rate-star]:!text-[#666666] [&_.ant-rate-star-full_.ant-rate-star-second]:!text-[#FFAD33] [&_.ant-rate-star-full_.ant-rate-star-first]:!text-[#FFAD33] ${starClassName || 'text-xs sm:text-sm'} ${className}`}
    />
  )
}

export { StarRating }
