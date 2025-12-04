def score_move(move, keypoints):
    if move == "Jab":
        score = 100
        feedback = "Great!"
        return score,feedback
    elif move =="Cross":
        score = 80
        feedback = "Nice Cross!"
        return score, feedback
    else:
        return 0, "Try Adjusting stance"