import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
import matplotlib.pyplot as plt

def get_top_k_similar(embeddings, metadata_list, input_embedding, k=5, TOP_K=50):
    similarities = cosine_similarity([input_embedding], list(embeddings.values()))[0]
    top_indices_limit = np.argsort(similarities)[-TOP_K:][::-1]
    top_k_metadata = [metadata_list[i] for i in top_indices_limit[:k]]
    top_k_scores = [similarities[i] for i in top_indices_limit[:k]]
    return top_k_metadata, top_k_scores

def find_elbow_point(similarities):
    points = [(i, s) for i, s in enumerate(similarities)]
    p1, pn = points[0], points[-1]
    def distance_from_line(p, p1, pn):
        return np.abs((pn[1] - p1[1]) * p[0] - (pn[0] - p1[0]) * p[1] + pn[0] * p1[1] - pn[1] * p1[0]) / np.sqrt(
            (pn[1] - p1[1]) ** 2 + (pn[0] - p1[0]) ** 2)
    distances = np.array([distance_from_line(p, p1, pn) for p in points])
    elbow_index = np.argmax(distances)
    return elbow_index + 1 

def plot_elbow_curve(similarities):
    plt.figure(figsize=(10, 6))
    plt.plot(similarities, 'b-', marker='o', markerfacecolor='red', markersize=8)
    plt.title('Elbow Method For Optimal k')
    plt.xlabel('Rank')
    plt.ylabel('Cosine Similarity')
    plt.grid(True)
    plt.show()

