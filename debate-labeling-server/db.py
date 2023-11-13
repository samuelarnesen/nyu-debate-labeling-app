from pydantic import BaseModel

from typing import Any, List, Optional
from enum import Enum
import json
import os
import pickle
import re


class DebateRole(Enum):
    JUDGE = 0
    DEBATER = 1


class DebateTurn(BaseModel):
    role: str
    index: Optional[int]
    probabilities: Optional[tuple[float, float]]
    text: Optional[str]


class DebateRow(BaseModel):
    storyId: str
    storyTitle: str
    story: str
    question: str
    answers: List[str]
    debateId: str
    judge: str
    turns: List[DebateTurn]
    isJudgeCorrect: bool

DATA_PATH = "/Users/samarnesen/nyu/debate-labeling-app/debate-labeling-server/data/debate-data.jsonl"
PICKLE_PATH = "/Users/samarnesen/nyu/debate-labeling-app/debate-labeling-server/data/rich-debate-data.p"

class DebateDatabase:
    def __init__(self):
        self.kv_store = self.__construct_kv_store()

    def __should_keep(self, row: dict[str, Any]) -> bool:
        roles = [turn.role for turn in row.turns]
        positions = set([turn.index for turn in row.turns])
        return (
            len(roles) >= 3
            and "GPT-4" not in roles
            and 0 in positions
            and 1 in positions
        )

    def __construct_kv_store(self) -> dict[str, DebateRow]:
        if os.path.exists(PICKLE_PATH):
            with open(PICKLE_PATH, "rb") as f:
                return pickle.load(f)
        else:
            with open(DATA_PATH) as f:
                rows = [DebateRow(**json.loads(line)) for line in f.readlines()]
            kv_store = {}
            for row in filter(self.__should_keep, rows):
                kv_store.setdefault(f"{row.storyTitle}_{row.debateId}", row)
            return kv_store

    def get_data(self) -> dict[str, DebateRow]:
        return self.kv_store

    def get_transcript(self, transcript_id: str):
        return self.kv_store[str(transcript_id)]

    def get_transcript_ids(self) -> list[str]:
        return [key for key in self.kv_store]

    def update(self, transcript_id: str, tag: str, text: str, role: str, index: int) -> Optional[str]:
        row = self.kv_store.get(transcript_id, None)
        eligible = 0
        for turn in filter(lambda x: x.role == role and x.index == index, row.turns or []):
            regex = re.escape(text)
            if re.search(regex, turn.text, flags=re.DOTALL):
                turn.text = re.sub(regex, f"<{tag.lower()}>{text}</{tag.lower()}>", turn.text, flags=re.DOTALL)
                return turn.text
        for turn in filter(lambda x: x.role == role and x.index == index, row.turns or []):
            print(turn.text)
        return None

    def remove(self, transcript_id: str, text: str, role: str, index: int) -> Optional[str]:
        row = self.kv_store.get(transcript_id, None)
        for turn in filter(lambda x: x.role == role and x.index == index, row.turns or []):
            regex = f"<([a-zA-Z_])+>{re.escape(text)}</([a-zA-Z_])+>"
            if re.search(regex, turn.text, flags=re.DOTALL):
                turn.text = re.sub(regex, text, turn.text, flags=re.DOTALL)
                return turn.text
        return None

    def save(self):
        with open(PICKLE_PATH, "wb") as f:
            pickle.dump(self.kv_store, f)


if __name__ == "__main__":
    db = DebateDatabase()
    print(len(db.get_data()))
