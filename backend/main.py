from fastapi import FastAPI, File, UploadFile, HTTPException
from google.cloud import documentai
import os
from starlette.middleware.cors import CORSMiddleware  # Import CORS

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins (for development)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Set up Google Cloud credentials (replace with your values)
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = "../vision_key.json"  # Replace with your key file path
PROJECT_ID = "cheque-data-extractor"
LOCATION = "us"
PROCESSOR_ID = "5541de561ce7840d"

@app.post("/process")
async def process_image(file: UploadFile = File(...)):
    """Processes an uploaded image using Document AI."""
    try:
        image_content = await file.read()  # Read the uploaded file

        client = documentai.DocumentProcessorServiceClient()
        name = f"projects/{PROJECT_ID}/locations/{LOCATION}/processors/{PROCESSOR_ID}"

        raw_document = documentai.RawDocument(content=image_content, mime_type=file.content_type) # Use file.content_type
        request = documentai.ProcessRequest(name=name, raw_document=raw_document)
        result = client.process_document(request=request)
        document = result.document

        extracted_data = {}
        for entity in document.entities:
            label = entity.type_
            text = entity.normalized_value.text if entity.normalized_value else entity.mention_text
            extracted_data[label] = text

        return extracted_data

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))