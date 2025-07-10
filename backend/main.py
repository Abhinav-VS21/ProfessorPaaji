
from extractText import extract_text_from_pptx, save_to_json
from grouping import cluster, save_cluster_json
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
import io


app = FastAPI()

# Enable CORS for local frontend testing (you can limit this in production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change to your frontend domain in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/cluster")
async def cluster_endpoint(file: UploadFile = File(...)):

    pptx_content = await file.read()
    pptx_file = io.BytesIO(pptx_content)
    slides = extract_text_from_pptx(pptx_file)
    clustered = cluster(slides)
    return clustered
