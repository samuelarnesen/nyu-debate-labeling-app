'use client'

import React, { useEffect, useState } from 'react'


const tagColors = {
    quote: 'bg-yellow-200',
    summary: 'bg-green-200',
    analysis: 'bg-pink-400',
    refutation: 'bg-purple-400',
    reply: 'bg-teal-400',
    flourish: 'bg-yellow-600',
    framing: 'bg-gray-500',
    statement: 'bg-teal-600',
    logic: 'bg-red-700',
    q_context: 'bg-indigo-400',
    position: 'bg-blue-600',
    oob_quote: 'bg-orange-400',
    promise: 'bg-purple-700'
};


interface EditButtonProps {
  buttonText: string
  onClick: (buttonText: string) => void
}

const EditButton: React.FC<EditButtonProps> = ({ buttonText, onClick }) => {
  const color = tagColors[buttonText.toLowerCase()] ? tagColors[buttonText.toLowerCase()] : "bg-gray-100"
  console.log(color)

  return (
    <button
      className={color + " hover:bg-black text-gray-700 font-bold py-2 px-4 rounded m-1"}
      onClick={() => onClick(buttonText)}
    >
      {buttonText}
    </button>
  )
}

interface EditPopupProps {
  turnText: string
  selectedText: string
  transcriptId: string
  role: string
  index: number
  setShowPopup: (value: boolean) => void
  setTurnText: (value: string) => void
}

const EditPopup: React.FC<EditPopupProps> = ({ turnText, selectedText, transcriptId, role, index, setShowPopup, setTurnText }) => {
  const sendPostRequest = (buttonText: string) => {
    const postData = {
      transcript_id: transcriptId,
      tag: buttonText.toUpperCase(),
      text: selectedText,
      role,
      index
    }
    if (buttonText !== 'Exit') {
      fetch('http://127.0.0.1:8000/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(postData)
      })
        .then(async response => await response.json())
        .then(data => {
          console.log(data);
          if (data) {
            setTurnText(data);
          }
        })
        .catch((error) => {
          console.error('Error:', error)
        })
    }
    setShowPopup(false)
  }

  return (
    <>
      <div className="absolute bg-white border p-2 mt-1 rounded shadow-lg bg-opacity-100 z-10">
          <EditButton buttonText="Summary" onClick={sendPostRequest} />
          <EditButton buttonText="Refutation" onClick={sendPostRequest} />
          <EditButton buttonText="Analysis" onClick={sendPostRequest} />
          <EditButton buttonText="Reply" onClick={sendPostRequest} />
          <EditButton buttonText="Flourish" onClick={sendPostRequest} />
          <EditButton buttonText="Framing" onClick={sendPostRequest} />
          <EditButton buttonText="Statement" onClick={sendPostRequest} />
          <EditButton buttonText="Logic" onClick={sendPostRequest} />
          <EditButton buttonText="Q_Context" onClick={sendPostRequest} />
          <EditButton buttonText="Position" onClick={sendPostRequest} />
          <EditButton buttonText="OOB_Quote" onClick={sendPostRequest} />
          <EditButton buttonText="Promise" onClick={sendPostRequest} />
          <EditButton buttonText="Remove" onClick={sendPostRequest} />
          <EditButton buttonText="Exit" onClick={sendPostRequest} />
      </div>
    </>
  )
}


type TextSegment = {
    text: string;
    type: string | null;
};

function useTextParser(inputtedText: string, tags: string[]): TextSegment[] {
  let segments: TextSegment[] = [{ text: inputtedText, type: null }];

  // Iterate over each tag
  tags.forEach(tag => {
    // Process each segment for the current tag
    segments = segments.flatMap(segment => {
      // Skip processing for already tagged segments
      if (segment.type !== null) {
        return [segment];
      }

      const tagStart = `<${tag}>`;
      const tagEnd = `</${tag}>`;
      const parts = segment.text.split(new RegExp(`(${tagStart}|${tagEnd})`, 'g'));

      return parts.map((part, index) => {
        if (part === tagStart || part === tagEnd) {
          return null; // Don't return anything for the actual tags
        }
        const isTaggedText = parts[index - 1] === tagStart || parts[index + 1] === tagEnd;

        return {
          text: part,
          type: isTaggedText ? tag : null,
        };
      }).filter((part): part is TextSegment => part !== null);
    });
  });

  return segments;
}

interface HighlightedTooltipProps {
  segmentType: string,
  segmentText: string
}

const HighlightedTooltip: React.FC<HighlightedTooltipProps> = ({ segmentType, segmentText }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const getClassName = () => {
    return (segmentType !== null && segmentType in tagColors ? tagColors[segmentType as keyof typeof tagColors] : '') + ' flex-row'
  }

  return (
    <span 
      className={getClassName()} 
      title={segmentType}
      onMouseEnter={() => setShowTooltip(segmentType != null && segmentType.length > 0)}
      onMouseLeave={() => setShowTooltip(false)}
    >
        {segmentText}
        {showTooltip && (
          <span className="absolute bottom-full mb-2 px-3 py-1 bg-black text-white text-xs rounded">
            {segmentType}
          </span>
        )}
    </span>
  );
};

interface HighlightedTextProps {
  text: string;
}

const HighlightedText: React.FC<HighlightedTextProps> = ({ text }) => {
    const [showTooltip, setShowTooltip] = useState(false);
    const tags = Object.keys(tagColors);
    const parsedText = useTextParser(text, tags);

    return (
        <div>
            {parsedText.filter((segment, index) => segment != null).map((segment, index) => (
              <HighlightedTooltip key={index} segmentType={segment.type} segmentText={segment.text}/>
            ))}
        </div>
    );
};


interface TurnProps {
  index: number
  role: string
  text: string
  transcriptId: string
}

const Turn: React.FC<TurnProps> = ({ index, role, text, transcriptId }) => {
  const [showPopup, setShowPopup] = useState(false)
  const [selectedText, setSelectedText] = useState('')
  const [turnText, setTurnText] = useState(text);

  const getSelectedText = () => {
    const selection = window.getSelection()
    if (selection) {
      return selection.toString()
    }
    return ''
  }

  const handleMouseUp = () => {
    const selection = getSelectedText()
    if (selection) {
      setSelectedText(selection)
      setShowPopup(true)
    } else {
      setShowPopup(false)
    }
  }

  const bgColor = (role: string) => {
    if (role === 'Debater') {
      if (index === 0) {
        return 'bg-red-200 bg-opacity-50'
      } else {
        return 'bg-blue-200 bg-opacity-50'
      }
    } else {
      return 'bg-gray-200 bg-opacity-50'
    }
  }

  return (
    <>
    <div onMouseUp={handleMouseUp} className={`${bgColor(role)} p-4 rounded-lg relative`}>
      <HighlightedText text={turnText}/>
      {showPopup && (
        <EditPopup turnText={turnText} selectedText={selectedText} transcriptId={transcriptId} role={role} index={index} setShowPopup={setShowPopup} setTurnText={setTurnText}/>
      )}
    </div>
    </>
  )
}

interface TranscriptProps {
  transcriptId: string
  transcript: Array<Record<string, any>>
}

const Transcript: React.FC<TranscriptProps> = ({ transcriptId, transcript }) => {
  return (
    <>
      <div>
        {transcript.filter((record) => record.text).map((record) => (
          <div key={`${record.text}_${record.index}_${record.role}`} className="mb-5">
            <Turn index={record.index} role={record.role} text={record.text} transcriptId={transcriptId}/>
          </div>
        ))}
      </div>
    </>
  )
}

export default Transcript;
