from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def home():
    return {"message": "Running website backend is working!"}