import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

model = genai.GenerativeModel("gemini-1.5-flash")
def get_gemini_response(prompt: str) -> str:
	try:

			response = model.generate_content(prompt)
			return response.text
	except Exception as e:
		return f"[ERROR] Gemini API failed: {str(e)}"
