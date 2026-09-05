# OCR Setup Notes — Person 2's Track (SIH26100)

## Environment
- OS: Windows
- Python: 3.13.5 (installed via python.org installer, NOT Microsoft Store)
- IDE: VS Code

## Setup Steps (from scratch)

1. Install Python from https://www.python.org/downloads/
   - IMPORTANT: check "Add python.exe to PATH" on the first installer screen
   - If prompted, enable "long paths" support (Windows path length fix) — needed
     for PaddleOCR's nested dependency folders, especially inside OneDrive folders

2. Create project folder, open in VS Code

3. Create virtual environment:
   python -m venv ocr-env

4. Activate it:
   ocr-env\Scripts\Activate.ps1
   (if blocked: Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser)

5. In VS Code: Ctrl+Shift+P -> "Python: Select Interpreter" -> pick the one
   showing ocr-env in its path

6. Install packages (with (ocr-env) active in terminal):
   pip install paddlepaddle
   pip install paddleocr
   pip install Pillow

## Known Issues & Fixes

### Issue 1: PaddleOCR API changed in v3.7.0
Older PaddleOCR tutorials use `ocr.ocr(img, cls=True)` with `use_angle_cls=True`.
As of v3.7.0, this is deprecated. Use instead:
   ocr = PaddleOCR(use_textline_orientation=True, lang="en")
   result = ocr.predict(image_path)
Result format also changed — now a list of dicts with "rec_texts" and
"rec_scores" keys, not the old box/text/confidence tuple format.

### Issue 2: oneDNN crash on Windows CPU inference
Error seen:
   NotImplementedError: (Unimplemented) ConvertPirAttribute2RuntimeAttribute
   not support [pir::ArrayAttribute<pir::DoubleAttribute>]
This is a PaddlePaddle/oneDNN compatibility bug on some Windows CPU setups.

FIX: disable oneDNN acceleration when creating the OCR object:
   ocr = PaddleOCR(use_textline_orientation=True, lang="en", enable_mkldnn=False)

This is required on this machine — without it, OCR crashes on every image.

## Versions Confirmed Working
- paddlepaddle: 3.3.1
- paddleocr: 3.7.0
- paddlex: 3.7.2
- Pillow: 12.3.0

## Quick Test
Generate a test image and run OCR on it:
   python -c "from PIL import Image, ImageDraw; img = Image.new(''RGB'', (600, 200), color=''white''); d = ImageDraw.Draw(img); d.text((40,40), ''Hello OCR Test GSTIN: 27AAAAA0000A1Z5'', fill=''black''); img.save(''test.png'')"
   python ocr_hello_world.py test.png

Expect confidence scores around 0.95-1.00 on clean printed text.
