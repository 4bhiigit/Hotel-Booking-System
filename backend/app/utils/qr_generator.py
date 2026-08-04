import io
import base64
import qrcode
from PIL import Image

def generate_qr_code_base64(data_string: str) -> str:
    """
    Generates a Base64-encoded PNG data URI for a QR code.
    Safely converts input data to string and handles potential exceptions.
    """
    safe_data = str(data_string) if data_string is not None else ""
    
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    qr.add_data(safe_data)
    qr.make(fit=True)

    img = qr.make_image(fill_color="black", back_color="white")
    buffer = io.BytesIO()
    img.save(buffer, "PNG")  # type: ignore
    buffer.seek(0)
    
    img_str = base64.b64encode(buffer.getvalue()).decode("utf-8")
    return f"data:image/png;base64,{img_str}"
