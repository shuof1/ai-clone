import React from 'react'
import Image from 'next/image';
function ImageListTab({searchResult}) {
    console.log(searchResult);
    const parsedChats = typeof searchResult?.Chats === 'string'
    ? JSON.parse(searchResult.Chats)
    : searchResult?.Chats;
  return (
    <div className='flex gap-5 flex-wrap mt-6'>
      {parsedChats.searchResult.map((item,index)=>(
        
          <Image src={item?.thumbnail} alt={item.title}
          width={300}
          height={300}
          key={index}
          className='bg-accent rounded-xl'/>
        
      ))}
    </div>
  )
}

export default ImageListTab