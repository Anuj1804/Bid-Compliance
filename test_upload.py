import sys, os
sys.path.insert(0, os.path.abspath('backend'))
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from database.db import get_db, engine
from routes.bidders import upload_document
from services.auth_service import CurrentUser
from fastapi import UploadFile

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
db = SessionLocal()

with open('test.png', 'wb') as f:
    f.write(b'hi')

class MockUploadFile:
    def __init__(self, filename):
        self.filename = filename
        self.file = open('test.png', 'rb')

mock_file = MockUploadFile('test.png')
user = CurrentUser(username='officer1', role='officer')

try:
    doc = upload_document(bidder_id=6, document_type='GST', file=mock_file, db=db, current_user=user)
    print("SUCCESS", doc.id)
except Exception as e:
    import traceback
    traceback.print_exc()
