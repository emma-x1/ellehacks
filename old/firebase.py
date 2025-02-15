import firebase_admin
from firebase_admin import credentials, db
import os

cred = credentials.Certificate("../ellehacks-7e087-firebase-adminsdk-fbsvc-4a6ff6890c.json")
firebase_admin.initialize_app(cred, {
    'databaseURL': os.getenv("FIREBASE_URL")
})

ref = db.reference("/")