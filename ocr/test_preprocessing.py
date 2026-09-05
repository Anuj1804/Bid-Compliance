"""
test_preprocessing.py — Before/after comparison, Person 2's track (SIH26100)

v2: milder, more realistic degradation (a genuinely bad flatbed scan or
phone photo is rarely THIS unreadable) + saves each preprocessing step
separately so you can visually inspect where a step helps or hurts.
"""

import numpy as np
import cv2
from PIL import Image, ImageDraw, ImageFont

from preprocessing import (
    _deskew, _normalize_contrast, _denoise, _binarize, preprocess_image,
)
from extraction import extract_fields


def make_messy_test_image(path: str = "messy_test.png") -> str:
    """Creates a clean text image with a larger, more realistic font size,
    then applies MODERATE degradation — closer to a slightly tilted,
    slightly grainy phone photo than to static noise."""
    img = Image.new("RGB", (1000, 400), color="white")
    draw = ImageDraw.Draw(img)

    try:
        font = ImageFont.truetype("arial.ttf", 28)
    except OSError:
        font = ImageFont.load_default(size=28)

    draw.text((40, 40), "Company Name: ABC Enterprises Pvt Ltd", fill="black", font=font)
    draw.text((40, 110), "GSTIN: 27AAAPL1234C1Z5", fill="black", font=font)
    draw.text((40, 180), "PAN: AAAPL1234C", fill="black", font=font)
    draw.text((40, 250), "Udyam Reg No: UDYAM-MH-01-0012345", fill="black", font=font)

    arr = np.array(img)

    (h, w) = arr.shape[:2]
    matrix = cv2.getRotationMatrix2D((w // 2, h // 2), 1.5, 1.0)
    arr = cv2.warpAffine(arr, matrix, (w, h), borderValue=(255, 255, 255))

    arr = cv2.convertScaleAbs(arr, alpha=0.8, beta=15)

    noise = np.random.normal(0, 6, arr.shape).astype(np.int16)
    arr = np.clip(arr.astype(np.int16) + noise, 0, 255).astype(np.uint8)

    cv2.imwrite(path, arr)
    return path


def save_pipeline_steps(image_path: str, prefix: str = "step") -> None:
    """Runs each preprocessing step individually and saves the result after
    each stage, so you can open the images and see exactly where (if
    anywhere) a step is destroying legibility instead of helping."""
    image = cv2.imread(image_path)

    cv2.imwrite(f"{prefix}_0_original.png", image)

    step1 = _deskew(image)
    cv2.imwrite(f"{prefix}_1_deskewed.png", step1)

    step2 = _normalize_contrast(step1)
    cv2.imwrite(f"{prefix}_2_contrast.png", step2)

    step3 = _denoise(step2)
    cv2.imwrite(f"{prefix}_3_denoised.png", step3)

    step4 = _binarize(step3)
    cv2.imwrite(f"{prefix}_4_binarized.png", step4)

    print(f"Saved: {prefix}_0_original.png through {prefix}_4_binarized.png")
    print("Open these in order and check where the text becomes unreadable.")


def run_comparison():
    print("Generating synthetic messy test document...")
    messy_path = make_messy_test_image()

    print("\nSaving each preprocessing step separately for visual inspection...")
    save_pipeline_steps(messy_path)

    print("\n" + "=" * 60)
    print("WITHOUT preprocessing")
    print("=" * 60)
    result_raw = extract_fields(messy_path)
    for field, data in result_raw.items():
        print(f"  {field}: {data}")

    print("\nRunning full preprocessing pipeline...")
    processed_path = preprocess_image(messy_path)

    print("\n" + "=" * 60)
    print("WITH preprocessing")
    print("=" * 60)
    result_processed = extract_fields(processed_path)
    for field, data in result_processed.items():
        print(f"  {field}: {data}")

    print("\n" + "=" * 60)
    print("SUMMARY")
    print("=" * 60)
    for field in result_raw:
        raw_found = result_raw[field]["value"] is not None
        proc_found = result_processed[field]["value"] is not None
        raw_conf = result_raw[field]["confidence"]
        proc_conf = result_processed[field]["confidence"]
        verdict = (
            "IMPROVED" if (proc_found and not raw_found) or (proc_conf > raw_conf)
            else "WORSE" if (raw_found and not proc_found) or (proc_conf < raw_conf)
            else "SAME"
        )
        print(f"  {field}: raw_conf={raw_conf}, processed_conf={proc_conf} -> {verdict}")


if __name__ == "__main__":
    run_comparison()