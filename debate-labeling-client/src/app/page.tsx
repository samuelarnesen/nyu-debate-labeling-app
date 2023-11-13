'use client'

import React, { useState } from 'react'

import Transcript from './transcript'
import TranscriptDescription from "./transcript_description"
import TranscriptList from './transcript_list'

export default function Home () {
  return (
    <main className="overflow-auto">
      <MainView/>
    </main>
  )
}

const MainView: React.FC = () => {
  const [transcript, setTranscript] = useState<Array<Record<string, any>>>([])
  const [transcriptId, setTranscriptId] = useState<string>('')
  const [question, setQuestion] = useState<string>('')
  const [answers, setAnswers] = useState<string[]>([])

  return (
    <div className="flex h-screen overflow-auto">
      <div className="w-1/3 bg-gray-200 text-black overflow-auto"> {}
        <TranscriptList setTranscript={setTranscript} setTranscriptId={setTranscriptId} selectedTranscriptId={transcriptId} setQuestion={setQuestion} setAnswers={setAnswers}/>
      </div>
      <div className="flex-1 bg-gray-100 text-black overflow-auto space-y-4"> {}
        {transcript.length > 0 && <TranscriptDescription question={question} answers={answers}/>}
        {transcript.length > 0 && <Transcript transcriptId={transcriptId} transcript={transcript}/>}
      </div>
    </div>
  )
}
