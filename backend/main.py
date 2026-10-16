
import firebase_admin
from firebase_admin import credentials, firestore, auth

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

# Firebase connection
cred = credentials.Certificate(
    "backend/cleartask-service-account.json"
)

firebase_admin.initialize_app(cred)
db = firestore.client()

# FastAPI application
app = FastAPI()
security = HTTPBearer()

# CORS configuration for frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)



def verify_firebase_token(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    try:
        decoded_token = auth.verify_id_token(credentials.credentials)
        return decoded_token
    except Exception:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired Firebase token"
        )


@app.get("/")
def home():
    return {
        "message": "ClearTask backend is working!"
    }


# List all active offices
@app.get("/offices")
def get_offices():
    offices = db.collection("offices").stream()

    return [
        {
            "id": office.id,
            **(office.to_dict() or {})
        }
        for office in offices
    ]


# Test Firebase connection
@app.get("/test-firebase")
def test_firebase():
    collections = db.collections()

    return {
        "message": "Firebase connected successfully!",
        "collections": [collection.id for collection in collections]
    }


# Get clearance tasks belonging to the logged-in student

@app.get("/clearance-tasks")
def get_clearance_tasks(
    student=Depends(verify_firebase_token)
):
    email = student.get("email")

    if not email:
        raise HTTPException(
            status_code=401,
            detail="Your account must have an email address."
        )

    students = (
        db.collection("students")
        .where("email", "==", email)
        .limit(1)
        .stream()
    )

    student_record = next(students, None)

    if student_record is None:
        raise HTTPException(
            status_code=404,
            detail="Student record not found."
        )

    student_data = student_record.to_dict() or {}
    student_number = student_data.get("student_number")

    if not student_number:
        raise HTTPException(
            status_code=404,
            detail="Student number not found."
        )

    tasks = (
        db.collection("clearance_tasks")
        .where("student_number", "==", student_number)
        .stream()
    )

    offices = {}

    for task in tasks:
        data = task.to_dict() or {}
        office_name = data.get("office_name", "Unassigned")

        if office_name not in offices:
            offices[office_name] = []

        offices[office_name].append({
            "id": task.id,
            "task_name": data.get("task_name", "Unnamed task"),
            "status": data.get("status", "Pending"),
            "remarks": data.get("remarks", "")
        })

    return [
        {
            "office_name": office_name,
            "tasks": office_tasks
        }
        for office_name, office_tasks in offices.items()
    ]


