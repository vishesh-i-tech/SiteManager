import os
import sys
from datetime import datetime
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable, KeepTogether
)
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, page_count):
        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#64748B"))
        
        # Header (pages > 1)
        if self._pageNumber > 1:
            self.drawString(54, 750, "SiteSaathi — Mobile App Architecture & Updates Report")
            self.setStrokeColor(colors.HexColor("#E2E8F0"))
            self.setLineWidth(0.5)
            self.line(54, 742, 612 - 54, 742)
            
        # Footer
        page_text = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(612 - 54, 36, page_text)
        self.drawString(54, 36, "Confidential — SiteSaathi Field Operations & App Development")
        self.setStrokeColor(colors.HexColor("#E2E8F0"))
        self.setLineWidth(0.5)
        self.line(54, 48, 612 - 54, 48)
        self.restoreState()

def build_pdf():
    pdf_filename = "SiteSaathi_App_Updates_Report.pdf"
    doc = SimpleDocTemplate(
        pdf_filename,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )

    styles = getSampleStyleSheet()

    # Custom styles
    primary_color = colors.HexColor("#1D4ED8")   # Professional Cobalt Blue
    dark_slate = colors.HexColor("#0F172A")
    muted_slate = colors.HexColor("#475569")
    card_bg = colors.HexColor("#F8FAFC")
    border_color = colors.HexColor("#CBD5E1")

    title_style = ParagraphStyle(
        'DocTitle',
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=28,
        textColor=dark_slate,
        spaceAfter=6
    )

    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        fontName='Helvetica',
        fontSize=12,
        leading=16,
        textColor=primary_color,
        spaceAfter=14
    )

    h1_style = ParagraphStyle(
        'H1',
        fontName='Helvetica-Bold',
        fontSize=14,
        leading=18,
        textColor=dark_slate,
        spaceBefore=14,
        spaceAfter=8,
        keepWithNext=True
    )

    h2_style = ParagraphStyle(
        'H2',
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=15,
        textColor=primary_color,
        spaceBefore=10,
        spaceAfter=4,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'Body',
        fontName='Helvetica',
        fontSize=9.5,
        leading=13.5,
        textColor=dark_slate,
        spaceAfter=6
    )

    bullet_style = ParagraphStyle(
        'Bullet',
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=dark_slate,
        leftIndent=14,
        firstLineIndent=-10,
        spaceAfter=4
    )

    code_style = ParagraphStyle(
        'CodeSnippet',
        fontName='Courier',
        fontSize=8.5,
        leading=11,
        textColor=colors.HexColor("#1E293B"),
        backColor=colors.HexColor("#F1F5F9"),
        borderPadding=6,
        spaceAfter=6
    )

    table_cell_style = ParagraphStyle(
        'TableCell',
        fontName='Helvetica',
        fontSize=8.5,
        leading=11,
        textColor=dark_slate
    )

    table_header_style = ParagraphStyle(
        'TableHeader',
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=11,
        textColor=colors.white
    )

    story = []

    # Title Banner
    story.append(Paragraph("SiteSaathi — Mobile App Updates & Architecture", title_style))
    story.append(Paragraph("Official Engineering & Feature Release Documentation • Offline-First Android APK", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=primary_color, spaceBefore=2, spaceAfter=12))

    # Meta Info Card
    meta_data = [
        [
            Paragraph("<b>Version:</b> 1.0.0 (Capacitor Android)", table_cell_style),
            Paragraph("<b>Application Type:</b> 100% Offline Mobile App", table_cell_style)
        ],
        [
            Paragraph(f"<b>Build Date:</b> {datetime.now().strftime('%d %B %Y')}", table_cell_style),
            Paragraph("<b>Output Target:</b> standalone APK (4.68 MB)", table_cell_style)
        ],
        [
            Paragraph("<b>Technology Stack:</b> React 19, Vite 8, Dexie, Capacitor 8", table_cell_style),
            Paragraph("<b>Primary Theme:</b> Unified Cobalt Blue (#2563EB)", table_cell_style)
        ]
    ]
    meta_table = Table(meta_data, colWidths=[240, 264])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), card_bg),
        ('BOX', (0,0), (-1,-1), 1, border_color),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#E2E8F0")),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 12))

    # Section 1: Executive Overview
    story.append(Paragraph("1. Executive Overview & Transformation Goal", h1_style))
    story.append(Paragraph(
        "SiteSaathi has been completely re-architected from a promotional web showcase into a dedicated, "
        "<b>100% offline-first Android mobile application</b>. Construction sites and remote field locations frequently "
        "suffer from weak or nonexistent mobile network connectivity. With this update, <b>all data is stored and indexed "
        "locally on the user's mobile device</b> using Dexie (IndexedDB on Android WebView). The user incurs zero cloud costs, "
        "zero database hosting fees, and has guaranteed instant data access at all times.",
        body_style
    ))

    # Section 2: Key Updates Implemented
    story.append(Paragraph("2. Summary of Updates Implemented", h1_style))
    
    updates_table_data = [
        [
            Paragraph("<b>Module</b>", table_header_style),
            Paragraph("<b>Previous Web State</b>", table_header_style),
            Paragraph("<b>New Mobile App Implementation</b>", table_header_style)
        ],
        [
            Paragraph("<b>App Shell</b>", table_cell_style),
            Paragraph("Opened wide marketing landing page with 'Showcase' banners and 'Live Preview' links.", table_cell_style),
            Paragraph("Opens directly into the Mobile App. Marketing landing page permanently removed.", table_cell_style)
        ],
        [
            Paragraph("<b>Desktop / Laptop View</b>", table_cell_style),
            Paragraph("Stretched across wide 1920px screen like a desktop web SaaS dashboard.", table_cell_style),
            Paragraph("Renders a realistic Smartphone Device Simulator (Status Bar, Dynamic Island, 390px frame).", table_cell_style)
        ],
        [
            Paragraph("<b>Authentication & Trade Locking</b>", table_cell_style),
            Paragraph("Generic multi-trade switcher allowed live switching between trades on the header.", table_cell_style),
            Paragraph("Fixed trade binding upon registration/login (Civil, Plumbing, Electrical). Switcher removed.", table_cell_style)
        ],
        [
            Paragraph("<b>Top App Header</b>", table_cell_style),
            Paragraph("8 horizontal buttons crowded into header, overflowing and clipping off-screen.", table_cell_style),
            Paragraph("Streamlined 52px Mobile Top Bar with user avatar, trade badge, language, bell, and logout.", table_cell_style)
        ],
        [
            Paragraph("<b>Dashboard KPI Cards</b>", table_cell_style),
            Paragraph("4 columns squished into 80px cards with truncated labels ('Worke...', 'Overd...').", table_cell_style),
            Paragraph("Mobile-first 2x2 Grid (2 columns, 2 rows) with large readable stats and zero text truncation.", table_cell_style)
        ],
        [
            Paragraph("<b>Navigation Model</b>", table_cell_style),
            Paragraph("Horizontal desktop navigation tabs with hidden mobile elements on large screens.", table_cell_style),
            Paragraph("Native Mobile Bottom Navigation Bar (5 tabs) + Floating Action Button (+) always docked.", table_cell_style)
        ],
        [
            Paragraph("<b>Android Packaging</b>", table_cell_style),
            Paragraph("Browser web page only.", table_cell_style),
            Paragraph("Capacitor 8 Android native project with one-command debug APK compilation.", table_cell_style)
        ]
    ]

    updates_table = Table(updates_table_data, colWidths=[90, 195, 219])
    updates_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), primary_color),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('BOX', (0,0), (-1,-1), 1, border_color),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#CBD5E1")),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, card_bg]),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(updates_table)
    story.append(Spacer(1, 10))

    # Section 3: Technical Architecture & Offline Storage
    story.append(Paragraph("3. Technical Architecture & Offline Storage", h1_style))
    story.append(Paragraph(
        "<b>1. Local Persistence (IndexedDB on Android WebView):</b><br/>"
        "All data models—including Sites, Tools, Material Deliveries, Machinery Logs, Labour Registers, and Pending Dues—are "
        "managed through Dexie.js (IndexedDB). When compiled into an Android APK, Android's WebView persists IndexedDB directly "
        "into the device's private app sandbox (<code>/data/user/0/com.sitesaathi.app/app_webview/IndexedDB</code>). "
        "No network requests are ever required for CRUD operations.",
        body_style
    ))
    story.append(Paragraph(
        "<b>2. Capacitor Native Bridge:</b><br/>"
        "Capacitor packages the React/Vite production distribution bundle directly inside Android assets "
        "(<code>android/app/src/main/assets/public</code>). When the APK is opened, assets load locally with 0ms server latency. "
        "Mixed content and cleartext flags are explicitly configured in <code>capacitor.config.ts</code>.",
        body_style
    ))

    # Section 4: Workflow Instructions (Laptop Development & Mobile Testing)
    story.append(Paragraph("4. Operational Workflow for Field & Developer Testing", h1_style))
    story.append(Paragraph(
        "<b>A. Development on Laptop (Instant Live Updates):</b><br/>"
        "Run the development server on your laptop with hot module reloading. Open your browser to test updates instantly in the phone simulator:",
        body_style
    ))
    story.append(Paragraph("npm run dev   # Live at http://localhost:5173 with Phone Simulator", code_style))

    story.append(Paragraph(
        "<b>B. Compiling the Updated Android APK:</b><br/>"
        "Whenever updates are completed on the laptop and you wish to generate a fresh installable APK for your Android mobile phone, run:",
        body_style
    ))
    story.append(Paragraph("npm run apk:build", code_style))
    story.append(Paragraph(
        "<i>This automated command builds the React bundle, copies assets into the Android native directory, "
        "and executes Gradle to output the signed debug APK file.</i>",
        body_style
    ))

    story.append(Paragraph(
        "<b>C. Installing on a Connected Android Device:</b><br/>"
        "To push the freshly built APK directly to a USB-connected phone with developer mode enabled:",
        body_style
    ))
    story.append(Paragraph('& "C:\\Users\\vishu\\AppData\\Local\\Android\\Sdk\\platform-tools\\adb.exe" install -r "android\\app\\build\\outputs\\apk\\debug\\app-debug.apk"', code_style))

    # Section 5: Artifact Paths & Deliverables
    story.append(Paragraph("5. Deliverables & File Locations", h1_style))
    deliverables = [
        "<b>Android APK:</b> <code>android/app/build/outputs/apk/debug/app-debug.apk</code> (4.68 MB)",
        "<b>Capacitor Config:</b> <code>capacitor.config.ts</code> (App ID: <code>com.sitesaathi.app</code>)",
        "<b>Android Native Project:</b> <code>android/</code> (Gradle 8.14, SDK 36, Java 21)",
        "<b>Mobile Device Shell:</b> <code>src/components/common/MobileDeviceShell.tsx</code>",
        "<b>Mobile Header Bar:</b> <code>src/components/common/Header.tsx</code>",
        "<b>2x2 Mobile Dashboard:</b> <code>src/components/dashboard/DashboardOverview.tsx</code>",
        "<b>Touch Bottom Navigation:</b> <code>src/components/common/BottomNav.tsx</code>"
    ]
    for d in deliverables:
        story.append(Paragraph(f"• {d}", bullet_style))

    story.append(Spacer(1, 10))
    story.append(HRFlowable(width="100%", thickness=0.5, color=border_color, spaceBefore=4, spaceAfter=8))
    story.append(Paragraph("Report Generated Successfully • SiteSaathi Offline Mobile App Project", ParagraphStyle(
        'FooterNote',
        fontName='Helvetica-Oblique',
        fontSize=8,
        leading=10,
        textColor=muted_slate,
        alignment=1
    )))

    doc.build(story, canvasmaker=NumberedCanvas)
    print("PDF successfully generated:", pdf_filename)

if __name__ == "__main__":
    build_pdf()
