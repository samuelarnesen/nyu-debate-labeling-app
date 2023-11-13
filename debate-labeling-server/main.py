from db import DebateDatabase

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from typing import Union


class UpdateParam(BaseModel):
    transcript_id: str
    tag: str
    text: str
    role: str
    index: int

app = FastAPI()

origins = [
    "http://localhost:3000",  # Allow only this origin
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

db = DebateDatabase()

@app.get("/data")
async def get_data():
    return db.get_data()

@app.get("/transcripts")
async def get_transcript_ids():
    return db.get_transcript_ids()

@app.get("/transcripts/{transcript_id}")
async def get_transcript_ids(transcript_id: str):
    return db.get_transcript(transcript_id=transcript_id)

@app.post("/update")
async def update_transcript(params: UpdateParam):
    if params.tag.lower() != "remove":
        response = db.update(transcript_id=params.transcript_id, tag=params.tag, text=params.text, role=params.role, index=params.index)
    else:
        response = db.remove(transcript_id=params.transcript_id, text=params.text, role=params.role, index=params.index)
    db.save()
    return response