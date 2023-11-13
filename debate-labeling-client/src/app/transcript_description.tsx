'use client'

import React, { useEffect, useState } from 'react'

interface TranscriptDescriptionProps{
	question: string
	answers: string[]
}

const TranscriptDescription: React.FC<TranscriptDescriptionProps> = ({ question, answers }) => {
	return (
		<>
			<div className="bg-black p-1">
				<div className="bg-white">
					<div className="font-bold pl-2">{question}</div>
					<div className="bg-red-200 bg-opacity-50 pl-2 pr-2">{answers[0]}</div>
					<div className="bg-blue-200 bg-opacity-50 pl-2 pr-2">{answers[1]}</div>
				</div>
			</div>
		</>
	);
}

export default TranscriptDescription;
