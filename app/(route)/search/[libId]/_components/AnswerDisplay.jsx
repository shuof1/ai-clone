import React from 'react'

import SourceList from './SourceList'
function AnswerDisplay({searchResult}) {
  const webResult=searchResult?.web?.results;

  return (
    <div>
      <SourceList webResult={webResult}></SourceList>
    </div>
  )
}

export default AnswerDisplay