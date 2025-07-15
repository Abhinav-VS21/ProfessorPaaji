
from extractText import extract_text_from_pptx
from grouping import cluster
from gemini import get_gemini_response
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from sentence_transformers import SentenceTransformer
import io
import time
from fastapi import Request

model = SentenceTransformer("all-MiniLM-L6-v2")
app = FastAPI()


# Enable CORS for local frontend testing (you can limit this in production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change to your frontend domain in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


async def add_process_time_header(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = f"{process_time:.3f}s"
    return response

@app.post("/api/cluster")
async def cluster_endpoint(file: UploadFile = File(...),threshold:float = Form(0.4)):

    pptx_content = await file.read()
    pptx_file = io.BytesIO(pptx_content)
    slides = extract_text_from_pptx(pptx_file)
    clustered = cluster(slides , model=model , threshold=threshold)
    return clustered
@app.post("/api/explain-cluster")
async def explain_cluster_content(cluster_data: str = Form(...)):
    """
    Explain the content of a cluster using Gemini AI
    """
    enhanced_prompt = (
        "Can you explain this group of slide content to a college student "
        "in a concise yet complete way? Here's the content: " + cluster_data
    )
    explanation = get_gemini_response(enhanced_prompt)
    return {
        "cluster_content": cluster_data,
        "explanation": explanation
    }

# Test endpoint for Gemini
@app.get("/api/test-gemini")
async def test_gemini():
    """
    Test endpoint to verify Gemini API is working
    """
    test_response = get_gemini_response("Hello! Please respond with 'Gemini API is working!'")
    return {"status": "success", "response": test_response}