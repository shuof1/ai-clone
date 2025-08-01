import React from 'react'

function Displayresult({searchInputRecord}) {
  return (
    <div className='mt-7'>
        <h2 className='font-medium text-3xl line-clamp-2'>{searchInputRecord?.searchInput}</h2>
    </div>
  )
}

export default Displayresult