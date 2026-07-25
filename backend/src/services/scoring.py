from ..core.nlp_engine import nlp_engine
import numpy as np

def calculate_score(guess: str, target_vector: np.ndarray) -> int:
    return nlp_engine.calculate_similarity(guess, target_vector)
