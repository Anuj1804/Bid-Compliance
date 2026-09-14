import os, sys
sys.path.insert(0, os.path.abspath('backend'))
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)
# Need to mock auth or login
resp = client.post('/api/auth/login', data={'username': 'officer1', 'password': 'password123'})
token = resp.json()['access_token']

resp2 = client.post('/api/bidders/6/documents', headers={'Authorization': f'Bearer {token}'}, data={'document_type': 'GST'}, files={'file': ('test.png', b'fake_image_content', 'image/png')})
print(resp2.status_code)
print(resp2.json())
