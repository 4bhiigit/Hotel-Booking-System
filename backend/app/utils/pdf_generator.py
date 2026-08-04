import io
import html
from datetime import datetime, date
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
import qrcode

def generate_booking_pdf_invoice(booking_data: dict, room_data: dict, user_data: dict) -> bytes:
    """
    Generates an official PDF reservation & payment invoice for a booking.
    Safely handles datetime formats, missing fields, and XML escaping for ReportLab.
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter, rightMargin=36, leftMargin=36, topMargin=36, bottomMargin=36)
    story = []
    styles = getSampleStyleSheet()

    # Title / Header Styles
    title_style = ParagraphStyle(
        "InvoiceTitle",
        parent=styles["Heading1"],
        fontSize=24,
        leading=28,
        textColor=colors.HexColor("#1e293b"),
        alignment=0
    )
    subtitle_style = ParagraphStyle(
        "InvoiceSubTitle",
        parent=styles["Normal"],
        fontSize=10,
        textColor=colors.HexColor("#64748b")
    )
    
    story.append(Paragraph("<b>GRAND LUXURY HOTEL</b>", title_style))
    story.append(Paragraph("Official Reservation & Payment Invoice", subtitle_style))
    story.append(Spacer(1, 15))

    # Safe Date Formatting
    created_at_val = booking_data.get("created_at")
    if isinstance(created_at_val, (datetime, date)):
        created_at_str = created_at_val.strftime("%Y-%m-%d")
    elif isinstance(created_at_val, str) and "T" in created_at_val:
        created_at_str = created_at_val.split("T")[0]
    else:
        created_at_str = str(created_at_val or datetime.now().strftime("%Y-%m-%d"))

    # XML Escaped Field Values
    booking_ref = html.escape(str(booking_data.get("booking_reference") or "N/A"))
    guest_name = html.escape(str(user_data.get("name") or "Guest"))
    guest_email = html.escape(str(user_data.get("email") or "N/A"))
    guest_phone = html.escape(str(user_data.get("phone") or "N/A"))
    room_title = html.escape(str(room_data.get("title") or "Luxury Suite"))
    special_requests = html.escape(str(booking_data.get("special_requests") or "None"))

    # Details Grid (Two Columns: Hotel/Invoice Info vs Guest Info)
    info_data = [
        [
            Paragraph(f"<b>Invoice No:</b> #{booking_ref}<br/>"
                      f"<b>Date Issued:</b> {created_at_str}<br/>"
                      f"<b>Payment Status:</b> <font color='green'>PAID</font>", styles["Normal"]),
            Paragraph(f"<b>Guest Name:</b> {guest_name}<br/>"
                      f"<b>Email:</b> {guest_email}<br/>"
                      f"<b>Phone:</b> {guest_phone}", styles["Normal"])
        ]
    ]
    info_table = Table(info_data, colWidths=[270, 270])
    info_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#f8fafc")),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor("#e2e8f0")),
        ('PADDING', (0, 0), (-1, -1), 10),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    story.append(info_table)
    story.append(Spacer(1, 20))

    # Room Details Table
    table_data = [
        ["Room Title / Type", "Check-In", "Check-Out", "Nights", "Rate/Night", "Total"],
        [
            room_title,
            str(booking_data.get("check_in", "N/A")),
            str(booking_data.get("check_out", "N/A")),
            str(booking_data.get("nights_count", 1)),
            f"INR {float(room_data.get('price_per_night', 0)):,.2f}",
            f"INR {float(booking_data.get('total_price', 0)):,.2f}"
        ]
    ]

    room_table = Table(table_data, colWidths=[150, 80, 80, 50, 80, 100])
    room_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#0f172a")),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 10),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 8),
        ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor("#ffffff")),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
        ('ALIGN', (3, 0), (-1, -1), 'RIGHT'),
        ('PADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(room_table)
    story.append(Spacer(1, 20))

    # QR Code Generation for Invoice Validation
    qr_content = f"GRAND-HOTEL-BOOKING|REF:{booking_ref}|GUEST:{guest_email}"
    qr_img = qrcode.make(qr_content)
    qr_buffer = io.BytesIO()
    qr_img.save(qr_buffer, "PNG")  # type: ignore
    qr_buffer.seek(0)
    
    qr_reportlab_img = Image(qr_buffer, width=100, height=100)

    status_str = html.escape(str(booking_data.get("status", "confirmed")).upper())
    qr_text = Paragraph(
        f"<b>Scan QR Code for Check-in Validation</b><br/>"
        f"Status: <b>{status_str}</b><br/>"
        f"Special Requests: {special_requests}<br/><br/>"
        f"<i>Thank you for choosing Grand Luxury Hotel!</i>",
        styles["Normal"]
    )

    qr_table = Table([[qr_reportlab_img, qr_text]], colWidths=[120, 420])
    qr_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('PADDING', (0, 0), (-1, -1), 5),
    ]))
    story.append(qr_table)

    doc.build(story)
    buffer.seek(0)
    return buffer.getvalue()
