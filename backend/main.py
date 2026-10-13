import firebase_admin
from firebase_admin import credentials, firestore
from fastapi.middleware.cors import CORSMiddleware

from fastapi import FastAPI

cred = credentials.Certificate(
    "backend/cleartask-service-account.json"
)

firebase_admin.initialize_app(cred)

db = firestore.client()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def home():
    return {
        "message": "ClearTask backend is working!"
    }


@app.get("/clearance")
def get_clearance():
    return {
        "student": "Juan Dela Cruz",
        "status": "In Progress",
        "tasks": [
            {
                "office": "Library",
                "status": "Cleared"
            },
            {
                "office": "Accounting",
                "status": "Cleared"
            },
            {
                "office": "Registrar",
                "status": "Pending"
            }
        ]
    }

@app.get("/test-firebase")
def test_firebase():
    collections = db.collections()

    return {
        "message": "Firebase connected successfully!",
        "collections": [collection.id for collection in collections]
    }
@app.get("/offices")
def get_offices():
    offices = db.collection("offices").stream()

    return [
        {
            "id": office.id,
            **office.to_dict()
        }
        for office in offices
    ]
@app.get("/clearance-tasks")
def get_clearance_tasks(student_number: str):
    tasks = db.collection("clearance_tasks").stream()

    result = []

    for task in tasks:
        data = task.to_dict() or {}

        if data.get("student_number") == student_number:
            result.append({
                "id": task.id,
                **data
            })

    return result