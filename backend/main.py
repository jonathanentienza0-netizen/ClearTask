from fastapi import FastAPI

app = FastAPI()


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