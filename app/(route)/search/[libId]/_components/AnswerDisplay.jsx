import React from 'react'

import SourceList from './SourceList'
import DisplaySummery from './DisplaySummery'

function AnswerDisplay({ chat }) {
  // const webResult = searchResult?.web?.results;
  // console.log(searchResult);
  const parsedAiResp = typeof chat?.aiResp === 'string'
    ? JSON.parse(chat.aiResp)
    : chat?.aiResp;
  return (
    <div>
      <SourceList webResult={chat?.searchResult}></SourceList>
      <DisplaySummery markdownText={parsedAiResp?.text}></DisplaySummery>
    </div>
  )
}

export default AnswerDisplay