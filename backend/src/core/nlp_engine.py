import numpy as np
from sentence_transformers import SentenceTransformer
from ..core.config import settings

class NLPEngine:
    def __init__(self):
        self.model = None

    def load_model(self):
        """Loads the sentence transformer model into memory."""
        print(f"Loading NLP Model: {settings.MODEL_NAME}")
        self.model = SentenceTransformer(settings.MODEL_NAME)
        print("NLP Model loaded successfully.")

    def get_embedding(self, text: str) -> np.ndarray:
        """Returns the embedding vector for the given text."""
        if self.model is None:
            raise RuntimeError("Model is not loaded.")
        return self.model.encode(text)

    def calculate_similarity(self, guess: str, target_vector: np.ndarray) -> int:
        """
        Computes cosine similarity between a guess and the target vector.
        Returns a normalized integer score between 0 and 100.
        """
        guess_vector = self.get_embedding(guess)
        
        # Cosine similarity formula: dot(a, b) / (norm(a) * norm(b))
        dot_product = np.dot(guess_vector, target_vector)
        norm_guess = np.linalg.norm(guess_vector)
        norm_target = np.linalg.norm(target_vector)
        
        if norm_guess == 0 or norm_target == 0:
            return 0
            
        similarity = dot_product / (norm_guess * norm_target)
        
        # Convert [-1, 1] to [0, 100]
        # Since these are semantic embeddings, they rarely go negative,
        # but we clip to [0, 1] then scale.
        score = max(0, min(100, int(similarity * 100)))
        return score

nlp_engine = NLPEngine()
