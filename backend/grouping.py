import json
from sentence_transformers import SentenceTransformer
from sklearn.cluster import AgglomerativeClustering
import sys


def cluster(slides_dict_list,n_cluster=None):

    valid_slide_index = []
    window_size = 1  # set to 0 to disable, 1 = include prev/next

    cleaned_texts = []
    for slide in slides_dict_list:
        title = slide.get("title", "").strip()
        body = slide.get("body", "").strip()
        notes = slide.get("notes", "").strip()

        if title or body or notes:
            full_text = f"{title}\n{body}\n{notes}".strip()
            cleaned_texts.append(full_text)
            valid_slide_index.append(slide["slide_id"])  # or use index

    windowed_texts = []
    for i in range(len(cleaned_texts)):
        window = []
        for j in range(i - window_size, i + window_size + 1):
            if 0 <= j < len(cleaned_texts):
                window.append(cleaned_texts[j])
        windowed_texts.append("\n---\n".join(window))  # join with separator

    # Embed
    model = SentenceTransformer("all-MiniLM-L6-v2")
    embeddings = model.encode(windowed_texts)

    # Cluster data
    clustering = AgglomerativeClustering(
        n_clusters=n_cluster, distance_threshold=0.4, metric="cosine", linkage="average"
    )
    labels = clustering.fit_predict(embeddings)

    for idx, cluster_id in zip(valid_slide_index, labels):
        slides_dict_list[idx]["cluster_id"] = int(cluster_id)

    # Group slides by cluster_id
    grouped_slides = {}
    for slide in slides_dict_list:
        cluster_id = slide.get("cluster_id")
        if cluster_id not in grouped_slides:
            grouped_slides[cluster_id] = []
        grouped_slides[cluster_id].append(slide)

    # Print grouped slides
    for cluster_id, slides in sorted(grouped_slides.items(), key=lambda x: (x[0] is None, x[0])):
        print(f"Cluster {cluster_id}:")
        for slide in sorted(slides, key=lambda x: x.get("slide_id", 0)):
            print(f"  Slide ID: {slide.get('slide_id')}, Title: {slide.get('title')}")
    return slides_dict_list

def save_cluster_json(data,output_json):
    with open(output_json, "w") as f:
        json.dump(data, f, indent=2,ensure_ascii=False)


# starting
if __name__ == "__main__":
    # if len(sys.argv) != 3:
    #     print("usage: python grouping.py input.json clustered.json")
    #     sys.exit(1)

    # extract data
    # input_json = sys.argv[1]
    input_json = "temp.json"
    with open(input_json, "r") as f:
        slides_dict_list = json.load(f)


    cluster_data = cluster(slides_dict_list)
