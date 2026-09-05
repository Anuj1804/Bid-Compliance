"""
preprocessing.py — Image preprocessing module, Person 2's track (SIH26100)
"""

from pathlib import Path

import cv2
import numpy as np


def _deskew(image: np.ndarray) -> np.ndarray:
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY) if image.ndim == 3 else image
    thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY_INV | cv2.THRESH_OTSU)[1]
    coords = np.column_stack(np.where(thresh > 0))

    if coords.shape[0] < 10:
        return image

    angle = cv2.minAreaRect(coords)[-1]
    if angle < -45:
        angle = -(90 + angle)
    else:
        angle = -angle

    if abs(angle) < 0.5:
        return image

    (h, w) = image.shape[:2]
    center = (w // 2, h // 2)
    matrix = cv2.getRotationMatrix2D(center, angle, 1.0)
    rotated = cv2.warpAffine(
        image, matrix, (w, h),
        flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE,
    )
    return rotated


def _normalize_contrast(image: np.ndarray) -> np.ndarray:
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY) if image.ndim == 3 else image
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    return clahe.apply(gray)


def _denoise(image: np.ndarray) -> np.ndarray:
    if image.ndim == 3:
        return cv2.fastNlMeansDenoisingColored(image, None, 10, 10, 7, 21)
    return cv2.fastNlMeansDenoising(image, None, 10, 7, 21)


def _binarize(image: np.ndarray) -> np.ndarray:
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY) if image.ndim == 3 else image
    return cv2.adaptiveThreshold(
        gray, 255,
        cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY,
        blockSize=31, C=15,
    )


def preprocess_image(
    image_path: str,
    enabled: bool = True,
    deskew: bool = True,
    normalize_contrast: bool = True,
    denoise: bool = True,
    binarize: bool = True,
    output_suffix: str = "_processed",
) -> str:
    src = Path(image_path)
    if not src.exists():
        raise FileNotFoundError(f"Image not found: {image_path}")

    if not enabled:
        return str(src)

    image = cv2.imread(str(src))
    if image is None:
        raise ValueError(f"Could not read image (unsupported format?): {image_path}")

    if deskew:
        image = _deskew(image)
    if normalize_contrast:
        image = _normalize_contrast(image)
    if denoise:
        image = _denoise(image)
    if binarize:
        image = _binarize(image)

    out_path = src.with_name(f"{src.stem}{output_suffix}{src.suffix}")
    cv2.imwrite(str(out_path), image)
    return str(out_path)


if __name__ == "__main__":
    import sys

    if len(sys.argv) != 2:
        print("Usage: python preprocessing.py <path_to_image>")
        sys.exit(1)

    result_path = preprocess_image(sys.argv[1])
    print(f"Processed image saved to: {result_path}")