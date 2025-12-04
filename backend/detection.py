import cv2
import mediapipe as mp
import numpy as np
import math

mp_pose = mp.tasks.vision.PoseLandmarker
mp_draw = mp.solutions.drawing_utils

BaseOptions = mp.tasks.BaseOptions
PoseLandmarker = mp.tasks.vision.PoseLandmarker
PoseLandmarkerOptions = mp.tasks.vision.PoseLandmarkerOptions
VisionRunningMode = mp.tasks.vision.RunningMode

# Load the model
options = PoseLandmarkerOptions(
    base_options=BaseOptions(model_asset_path="models/pose_landmarker_full.task"),
    running_mode=VisionRunningMode.IMAGE
)

pose_detector = PoseLandmarker.create_from_options(options)

def get_pose_landmarks(image):
    mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=image)
    result = pose_detector.detect(mp_image)

    if result.pose_landmarks:
        return result.pose_landmarks[0]   # return first person
    return None

def calculate_angle(a, b, c):
    """
    Returns the angle ABC (in degrees).
    a, b, c are (x,y) tuples from landmarks.
    """
    a = np.array(a)
    b = np.array(b)
    c = np.array(c)

    ba = a - b
    bc = c - b

    cosine_angle = np.dot(ba, bc) / (np.linalg.norm(ba) * np.linalg.norm(bc))
    angle = np.degrees(np.arccos(cosine_angle))

    return int(angle)

def classify_right_punch(angle):
    if angle < 70:
        return "Guard (arm bent)"
    elif angle < 130:
        return "Middle Punch"
    else:
        return "Full Extension"
    