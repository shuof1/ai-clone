import React from 'react'

function AnswerDisplay(searchResult) {
  const webResult=searchResult?.wen?.results;

  return (
    <div>
      <div>
        {webResult?.map((item,index)=>(
          <div key={index}>
            <div>
                <Image src={item?.profile?.img}
                alt={item.profile.name}
                width={20}
                height={20}/>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default AnswerDisplay