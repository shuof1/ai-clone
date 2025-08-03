import React from 'react'

import SourceList from './SourceList'
import DisplaySummery from './DisplaySummery'

function AnswerDisplay({ searchResult }) {
  const webResult = searchResult?.web?.results;
  console.log(searchResult);
  const parsedAiResp = typeof searchResult?.Chats?.aiResp === 'string'
    ? JSON.parse(searchResult.Chats.aiResp)
    : searchResult.Chats.aiResp;
  return (
    <div>
      <SourceList webResult={webResult}></SourceList>
      <DisplaySummery markdownText={parsedAiResp?.text}></DisplaySummery>
    </div>
  )
}

export default AnswerDisplay