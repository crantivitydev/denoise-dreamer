
import os
import tempfile
import uvicorn
from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import shutil
from typing import Optional

from image_processor import ImageProcessor
from audio_processor import AudioProcessor

app = FastAPI(title="AI Processing API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For production, you should specify your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize processors
MODEL_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "models")
image_processor = ImageProcessor(MODEL_DIR)
audio_processor = AudioProcessor(MODEL_DIR)

# Create temporary directory for uploads and results
TEMP_DIR = os.path.join(tempfile.gettempdir(), "ai_processing")
os.makedirs(TEMP_DIR, exist_ok=True)

@app.post("/process")
async def process_file(
    file: UploadFile = File(...),
    service: str = Form(...),
):
    """
    Process a file using the specified service
    
    Args:
        file: The file to process
        service: The service to use (image-denoise, image-upscale, audio-denoise)
    
    Returns:
        The processed file
    """
    # Validate service
    if service not in ["image-denoise", "image-upscale", "audio-denoise"]:
        raise HTTPException(status_code=400, detail="Invalid service")
    
    # Create unique file path
    file_ext = os.path.splitext(file.filename)[1]
    temp_input_path = os.path.join(TEMP_DIR, f"input_{os.urandom(8).hex()}{file_ext}")
    temp_output_path = os.path.join(TEMP_DIR, f"output_{os.urandom(8).hex()}{file_ext}")
    
    # Save uploaded file
    try:
        with open(temp_input_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"File save error: {str(e)}")
    finally:
        file.file.close()
    
    # Process file based on service
    try:
        if service == "image-denoise":
            output_path = image_processor.denoise_image(temp_input_path, temp_output_path)
        elif service == "image-upscale":
            output_path = image_processor.upscale_image(temp_input_path, temp_output_path)
        elif service == "audio-denoise":
            output_path = audio_processor.denoise_audio(temp_input_path, temp_output_path)
        else:
            raise HTTPException(status_code=400, detail="Invalid service")
        
        if not output_path:
            raise HTTPException(status_code=500, detail="Processing failed")
        
        # Return processed file
        return FileResponse(
            output_path,
            filename=f"processed_{file.filename}",
            media_type=file.content_type
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Processing error: {str(e)}")
    finally:
        # Clean up temporary files (optional - you might want to keep them for debugging)
        if os.path.exists(temp_input_path):
            os.remove(temp_input_path)

@app.get("/health")
async def health_check():
    """
    Health check endpoint
    """
    return {"status": "healthy"}

if __name__ == "__main__":
    # Load models on startup
    image_processor.load_denoise_model()
    image_processor.load_upscale_model()
    audio_processor.load_denoise_model()
    
    # Run the server
    uvicorn.run(app, host="0.0.0.0", port=8000)
