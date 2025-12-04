import cv2
from detection import get_pose_landmarks, calculate_angle, classify_right_punch
from pose_logic import detect_move
from scoring import score_move

cap = cv2.VideoCapture(0)

while True:
    ret, frame = cap.read()
    if not ret:
        break

    # ---- STEP 3: Pose Detection ----
    rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    landmarks = get_pose_landmarks(rgb)

    if landmarks:
        for lm in landmarks:
            h, w, _ = frame.shape
            cx, cy = int(lm.x * w), int(lm.y * h)
            cv2.circle(frame, (cx, cy), 5, (0,255,0), -1)

        right_shoulder = (landmarks[12].x, landmarks[12].y)
        right_elbow    = (landmarks[14].x, landmarks[14].y)
        right_wrist    = (landmarks[16].x, landmarks[16].y)

        angle = calculate_angle(right_shoulder, right_elbow, right_wrist)

        cv2.putText(frame, f"Right Elbow: {angle} deg",
                    (30, 50), cv2.FONT_HERSHEY_SIMPLEX,
                    1, (0, 255, 0), 2)
        
        form = classify_right_punch(angle)

        cv2.putText(frame, f"Form: {form}",
                    (30, 100), cv2.FONT_HERSHEY_SIMPLEX,
                    1, (0, 255, 255), 2)
        

    # --------------------------------

    cv2.imshow("MMA Pose Detection", frame)


    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()