import time
start_total = time.time()
import json
from sklearn.cluster import AgglomerativeClustering
# from sentence_transformers import SentenceTransformer




print("Imports done in:", time.time() - start_total)

def cluster(slides_dict_list,model,n_cluster=None, threshold = 0.4):

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
    start_time = time.time()
    embeddings = model.encode(windowed_texts)
    print("embeddings time: " + str(time.time()- start_time)
)
    # Cluster data
    cluster_time = time.time()
    if not n_cluster:
        clustering = AgglomerativeClustering(
        n_clusters=None, distance_threshold=threshold, metric="cosine", linkage="average"
    )
    else :
       clustering = AgglomerativeClustering(
        n_clusters=n_cluster, distance_threshold=None, metric="cosine", linkage="average"
    )

    labels = clustering.fit_predict(embeddings)
    print("clustering time: " + str(time.time() - cluster_time))

    for idx, cluster_id in zip(valid_slide_index, labels):
        slides_dict_list[idx]["cluster_id"] = int(cluster_id)

    # # Group slides by cluster_id
    # grouped_slides = {}
    # for slide in slides_dict_list:
    #     cluster_id = slide.get("cluster_id")
    #     if cluster_id not in grouped_slides:
    #         grouped_slides[cluster_id] = []
    #     grouped_slides[cluster_id].append(slide)

    # # Print grouped slides
    # for cluster_id, slides in sorted(grouped_slides.items(), key=lambda x: (x[0] is None, x[0])):
    #     print(f"Cluster {cluster_id}:")
    #     for slide in sorted(slides, key=lambda x: x.get("slide_id", 0)):
    #         print(f"  Slide ID: {slide.get('slide_id')}, Title: {slide.get('title')}")
    return slides_dict_list

def save_cluster_json(data,output_json):
    with open(output_json, "w") as f:
        json.dump(data, f, indent=2,ensure_ascii=False)


# starting
# if __name__ == "__main__":

    # model = SentenceTransformer("all-MiniLM-L6-v2")
    # input_json = "temp.json"
    # output_json = "clus.json"
    # with open(input_json, "r") as f:
    #     slides_dict_list = json.load(f)

    # cluster_data = cluster(slides_dict_list,model)
    # save_cluster_json(cluster_data,output_json)
