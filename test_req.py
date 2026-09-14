import urllib.request, json
req = urllib.request.Request('http://localhost:8000/api/auth/login', data=b'username=officer1&password=password123', headers={'Content-Type': 'application/x-www-form-urlencoded'})
resp = urllib.request.urlopen(req)
token = json.loads(resp.read())['access_token']

body = b'--bndry\r\nContent-Disposition: form-data; name=\"document_type\"\r\n\r\nGST\r\n--bndry\r\nContent-Disposition: form-data; name=\"file\"; filename=\"test.png\"\r\nContent-Type: image/png\r\n\r\nhi\r\n--bndry--\r\n'
req2 = urllib.request.Request('http://localhost:8000/api/bidders/6/documents', data=body, method='POST')
req2.add_header('Authorization', f'Bearer {token}')
req2.add_header('Content-Type', 'multipart/form-data; boundary=bndry')
try:
    urllib.request.urlopen(req2)
except Exception as e:
    print(e.code)
    print(e.read().decode('utf-8'))
