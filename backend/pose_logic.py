from utils import angle

def detect_move(keypoints):
    if keypoints is None:
        return "No Person"
    
    shoulder = keypoints[11]
    elbow = keypoints[13]
    wrist = keypoints[15]

    elbow_angle = angle(shoulder, elbow, wrist)

    if elbow_angle < 40:
        return "Jab"
    
    elif elbow_angle > 140:
        return "Cross"
    else:
        return "Unknown"
    