import React from 'react'

export default function RatingCard({text,bg}:{text:string, bg:string}) {
  return (
    <div className='relative flex flex-row items-center justify-center'>
    <span
        className={` ml-1 scale-100   py-2 px-4 w-26 ${bg} rounded-xl     text-gray-800`}>
       {text}
    </span>
</div>
  )
}

