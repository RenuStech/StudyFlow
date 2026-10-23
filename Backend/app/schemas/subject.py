from pydantic import BaseModel, Field

class SubjectCreate(BaseModel):
    name: str =Field(min_length=1, max_length=100)
    icon: str
    color: str

class SubjectUpdate(BaseModel):
    name: str | None = Field(default = None, min_length =1 , max_length=100)
    icon: str | None = None
    color: str | None = None
    progress: int | None = Field(default =None, ge=0, le=100)

class SubjectResponse(BaseModel):
    id:int
    user_id:int
    name:str
    icon:str
    color:str
    progress:int
