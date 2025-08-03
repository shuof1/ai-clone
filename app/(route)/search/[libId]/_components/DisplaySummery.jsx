import React from 'react'
import Markdown from 'react-markdown'

function DisplaySummery({markdownText }) {
  return (
    <div>
        <Markdown>
            {markdownText }
        </Markdown>
    </div>
  )
}

export default DisplaySummery