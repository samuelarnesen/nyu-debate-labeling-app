'use client'

import React, { useEffect, useState } from 'react'

interface TranscriptButtonProps {
  buttonTranscriptId: string
  setTranscript: (value: Array<Record<string, any>>) => void
  setTranscriptId: (value: string) => void
  selectedTranscriptId: string
  setQuestion: (value: string) => void
  setAnswers: (value: string[]) => void
}

const TranscriptButton: React.FC<TranscriptButtonProps> = ({ buttonTranscriptId, setTranscript, setTranscriptId, selectedTranscriptId, setQuestion, setAnswers }) => {
  const handleClick = async () => {
    fetch(`http://127.0.0.1:8000/transcripts/${buttonTranscriptId}`)
      .then(async response => await response.json())
      .then((data: Record<string, any>) => {
        setTranscript(data.turns)
        setQuestion(data.question)
        setAnswers(data.answers)
        setTranscriptId(buttonTranscriptId)
      })
      .catch(error => {
        console.error('Error fetching transcript: ', error)
      })
  }

  return (
    <button onClick={handleClick}>
      <div className={selectedTranscriptId === buttonTranscriptId ? 'font-bold' : ''}>{buttonTranscriptId}</div>
    </button>
  )
}

interface TranscriptListProps {
  setTranscript: (value: Array<Record<string, any>>) => void
  setTranscriptId: (value: string) => void
  selectedTranscriptId: string
  setQuestion: (value: string) => void
  setAnswers: (value: string[]) => void
}

export const TranscriptList: React.FC<TranscriptListProps> = ({ setTranscript, setTranscriptId, selectedTranscriptId, setQuestion, setAnswers }) => {
  const [items, setItems] = useState<string[]>([])

  useEffect(() => {
    fetch('http://127.0.0.1:8000/transcripts')
      .then(async response => await response.json())
      .then((data: string[]) => {
        setItems(data)
      })
      .catch(error => {
        console.error('Error fetching transcript list: ', error)
      })
  }, [])

  return (
    <div className="flex-grow">
      <h1 className="font-bold">Debates</h1>
      <ul>
        {items.map((item, index) => (
          <li key={index}>
            <TranscriptButton buttonTranscriptId={item} setTranscript={setTranscript} setTranscriptId={setTranscriptId} selectedTranscriptId={selectedTranscriptId} setQuestion={setQuestion} setAnswers={setAnswers}/>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default TranscriptList;
