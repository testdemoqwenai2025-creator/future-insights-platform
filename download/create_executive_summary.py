#!/usr/bin/env python3
"""
Endeavor Science (AETH-1) - Executive Summary PDF Generator
Professional investor-grade 1-page executive summary with dark tech theme
"""

from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
)
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY

# ============================================================================
# COLOR PALETTE - Dark Tech Theme
# ============================================================================
DARK_BG = colors.HexColor('#0a0e27')
ACCENT_BLUE = colors.HexColor('#3b82f6')
WHITE = colors.white
LIGHT_GRAY = colors.HexColor('#94a3b8')
CARD_BG = colors.HexColor('#111833')
BORDER_COLOR = colors.HexColor('#1e293b')

# ============================================================================
# PAGE SETUP
# ============================================================================
PAGE_WIDTH, PAGE_HEIGHT = letter
MARGIN = 0.4 * inch
CONTENT_WIDTH = PAGE_WIDTH - 2*MARGIN

# ============================================================================
# STYLES
# ============================================================================
title_style = ParagraphStyle('Title', fontSize=18, textColor=WHITE, alignment=TA_CENTER,
                             fontName='Helvetica-Bold', leading=22, spaceAfter=0)
subtitle_style = ParagraphStyle('Subtitle', fontSize=11, textColor=ACCENT_BLUE, alignment=TA_CENTER,
                                fontName='Helvetica-Bold', leading=13, spaceAfter=1)
tagline_style = ParagraphStyle('Tagline', fontSize=9, textColor=LIGHT_GRAY, alignment=TA_CENTER,
                               fontName='Helvetica-Oblique', leading=11, spaceAfter=3)
meta_style = ParagraphStyle('Meta', fontSize=7.5, textColor=LIGHT_GRAY, alignment=TA_CENTER,
                            fontName='Helvetica', leading=9, spaceAfter=5)
section_style = ParagraphStyle('Section', fontSize=8.5, textColor=ACCENT_BLUE, alignment=TA_LEFT,
                               fontName='Helvetica-Bold', leading=10, spaceBefore=5, spaceAfter=2)
body_style = ParagraphStyle('Body', fontSize=7.5, textColor=WHITE, alignment=TA_JUSTIFY,
                            fontName='Helvetica', leading=10, spaceAfter=3)
bullet_style = ParagraphStyle('Bullet', fontSize=7.5, textColor=WHITE, alignment=TA_LEFT,
                              fontName='Helvetica', leading=9.5, leftIndent=6, spaceAfter=1.5)
stat_num_style = ParagraphStyle('StatNum', fontSize=12, textColor=ACCENT_BLUE, alignment=TA_CENTER,
                                fontName='Helvetica-Bold', leading=14)
stat_lbl_style = ParagraphStyle('StatLbl', fontSize=6, textColor=LIGHT_GRAY, alignment=TA_CENTER,
                                fontName='Helvetica', leading=7.5)
small_style = ParagraphStyle('Small', fontSize=6.5, textColor=LIGHT_GRAY, alignment=TA_LEFT,
                             fontName='Helvetica', leading=8)
contact_style = ParagraphStyle('Contact', fontSize=7.5, textColor=WHITE, alignment=TA_CENTER,
                               fontName='Helvetica', leading=10)


def make_section(title):
    """Create section header with underline"""
    return [
        Paragraph(title.upper(), section_style),
        HRFlowable(width="100%", thickness=0.5, color=ACCENT_BLUE, spaceBefore=0, spaceAfter=2)
    ]


def make_bullets(items):
    """Create bullet list paragraphs"""
    return [Paragraph(f"<font color='#3b82f6'>●</font> {item}", bullet_style) for item in items]


def make_stat_box(num, lbl):
    """Create statistics box"""
    data = [[Paragraph(num, stat_num_style)], [Paragraph(lbl, stat_lbl_style)]]
    t = Table(data, colWidths=[1.25*inch])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), CARD_BG),
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('BOX', (0,0), (-1,-1), 0.5, BORDER_COLOR),
    ]))
    return t


def build_pdf():
    """Build the PDF document"""
    
    doc = SimpleDocTemplate(
        "/home/z/my-project/download/Endeavor_Science_Executive_Summary.pdf",
        pagesize=letter,
        leftMargin=MARGIN, rightMargin=MARGIN,
        topMargin=0.35*inch, bottomMargin=0.3*inch
    )
    
    story = []
    half_col = (CONTENT_WIDTH - 8) / 2
    third_col = (CONTENT_WIDTH - 12) / 3
    
    # === HEADER ===
    story.append(Paragraph("ENDEAVOR SCIENCE (AETH-1)", title_style))
    story.append(Paragraph("EXECUTIVE SUMMARY", subtitle_style))
    story.append(Paragraph('"The GitHub for Scientific Computing"', tagline_style))
    story.append(Paragraph("TestDemo | testdemoqwenai2025@gmail.com | August 2026", meta_style))
    story.append(HRFlowable(width="100%", thickness=1.25, color=ACCENT_BLUE, spaceBefore=2, spaceAfter=5))
    
    # === VISION ===
    story.extend(make_section("Vision"))
    vision = "To become the definitive platform where every scientist, researcher, and student conducts computational research — making world-class scientific tools accessible to everyone, everywhere. We are building the infrastructure that will power the next century of scientific discovery."
    story.append(Paragraph(vision, body_style))
    story.append(Spacer(1, 3))
    
    # === PROBLEM & SOLUTION (side by side) ===
    prob_content = make_section("The Problem") + make_bullets([
        "Scientists use <b>15+ fragmented tools</b> that don't work together",
        "<b>$10K-$100K/license</b> annually; <b>60% time</b> fighting software",
        "<b>52% of researchers</b> can't reproduce their own work",
        "Total waste: <font color='#3b82f6'><b>$54 BILLION</b></font> globally"
    ])
    
    sol_content = make_section("Our Solution") + make_bullets([
        "<b>One unified platform</b> replacing 20+ fragmented tools",
        "<b>Free Community</b> + Enterprise paid tiers",
        "<b>Browser-based</b>, no installation, reproducibility by default"
    ])
    
    prob_tbl = Table([[p] for p in prob_content], colWidths=[half_col])
    sol_tbl = Table([[p] for p in sol_content], colWidths=[half_col])
    
    ps_table = Table([[prob_tbl, sol_tbl]], colWidths=[half_col+3, half_col+3])
    ps_table.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('BACKGROUND', (0,0), (0,0), CARD_BG),
        ('BACKGROUND', (1,0), (1,0), CARD_BG),
        ('BOX', (0,0), (0,0), 0.5, BORDER_COLOR),
        ('BOX', (1,0), (1,0), 0.5, BORDER_COLOR),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('LEFTPADDING', (0,0), (-1,-1), 5),
        ('RIGHTPADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(ps_table)
    story.append(Spacer(1, 4))
    
    # === MARKET OPPORTUNITY ===
    story.extend(make_section("Market Opportunity"))
    
    mkt_table = Table([[
        make_stat_box("$78B", "TAM by 2030 | CAGR 11.6%"),
        make_stat_box("$35B", "SAM: Cloud | CAGR 24%"),
        make_stat_box("$8.5B", "SOM: Initial Target")
    ]], colWidths=[third_col]*3)
    mkt_table.setStyle(TableStyle([
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(mkt_table)
    story.append(Spacer(1, 4))
    
    # === BUSINESS MODEL & FOUNDER ===
    bm_content = make_section("Business Model") + make_bullets([
        "<b>Freemium:</b> Free → Pro $29/mo → Team $149/mo → Enterprise Custom",
        "Target <b>5-10% conversion</b> from free to paid tiers",
        "<b>Year 5:</b> <font color='#3b82f6'>$228M ARR</font>, 480K paid users"
    ])
    
    founder_content = make_section("Founder Credentials") + make_bullets([
        "<b>Post-graduate:</b> Life Sciences, Chemistry, Physics expertise",
        "<b>Full-stack:</b> Assembly → C → Fortran → JVM → Modern Web",
        "<b>Rare combo:</b> <font color='#3b82f6'><b>TestDemo is BOTH</b></font> scientist AND engineer"
    ])
    
    bm_tbl = Table([[p] for p in bm_content], colWidths=[half_col])
    found_tbl = Table([[p] for p in founder_content], colWidths=[half_col])
    
    bf_table = Table([[bm_tbl, found_tbl]], colWidths=[half_col+3, half_col+3])
    bf_table.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('BACKGROUND', (0,0), (0,0), CARD_BG),
        ('BACKGROUND', (1,0), (1,0), CARD_BG),
        ('BOX', (0,0), (0,0), 0.5, BORDER_COLOR),
        ('BOX', (1,0), (1,0), 0.5, BORDER_COLOR),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('LEFTPADDING', (0,0), (-1,-1), 5),
        ('RIGHTPADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(bf_table)
    story.append(Spacer(1, 4))
    
    # === THE ASK ===
    story.extend(make_section("The Ask"))
    ask_text = Paragraph("<b>Raising $5M Seed Round</b> &nbsp;|&nbsp; 18-24 month runway to Series A",
                         ParagraphStyle('Ask', fontSize=8, textColor=ACCENT_BLUE, 
                                       alignment=TA_CENTER, fontName='Helvetica-Bold', leading=10))
    story.append(ask_text)
    story.append(Spacer(1, 2))
    
    # Use of funds
    funds_rows = []
    for cat, pct, bar in [('Engineering', '60%', '████████████████████'),
                          ('Operations', '15%', '████████'),
                          ('Design', '10%', '█████'),
                          ('Marketing', '10%', '█████'),
                          ('Legal', '5%', '███')]:
        funds_rows.append([
            Paragraph(cat, small_style),
            Paragraph(f"<font color='#3b82f6'><b>{pct}</b></font>", 
                     ParagraphStyle('Pct', parent=small_style, alignment=TA_CENTER)),
            Paragraph(bar, ParagraphStyle('Bar', fontName='Courier', fontSize=6, 
                                         textColor=ACCENT_BLUE, leading=8))
        ])
    
    funds_tbl = Table(funds_rows, colWidths=[0.9*inch, 0.5*inch, 2*inch])
    funds_tbl.setStyle(TableStyle([
        ('ALIGN', (0,0), (0,-1), 'LEFT'),
        ('ALIGN', (1,0), (1,-1), 'CENTER'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('BACKGROUND', (0,0), (-1,-1), CARD_BG),
        ('BOX', (0,0), (-1,-1), 0.5, BORDER_COLOR),
        ('LINEBELOW', (0,0), (-1,-2), 0.3, BORDER_COLOR),
        ('TOPPADDING', (0,0), (-1,-1), 1.5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 1.5),
        ('LEFTPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(funds_tbl)
    story.append(Spacer(1, 5))
    
    # === FOOTER ===
    story.append(HRFlowable(width="100%", thickness=0.5, color=ACCENT_BLUE, spaceBefore=1, spaceAfter=4))
    
    contact = "<b>TestDemo</b>, Founder & CEO &nbsp;&nbsp;|&nbsp;&nbsp;<font color='#3b82f6'>testdemoqwenai2025@gmail.com</font>&nbsp;&nbsp;|&nbsp;&nbsp;<font color='#94a3b8'>endeavorsci.com</font>"
    story.append(Paragraph(contact, contact_style))
    story.append(Paragraph("<font color='#64748b' size='6'>CONFIDENTIAL | For Investor Review Only | August 2026</font>",
                          ParagraphStyle('Conf', parent=meta_style, alignment=TA_CENTER, spaceBefore=3)))
    
    # Build with background
    doc.build(story, onFirstPage=add_bg, onLaterPages=add_bg)
    print("SUCCESS: PDF created at /home/z/my-project/download/Endeavor_Science_Executive_Summary.pdf")


def add_bg(canvas, doc):
    """Add dark background to page"""
    canvas.saveState()
    canvas.setFillColor(DARK_BG)
    canvas.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT, fill=True, stroke=False)
    canvas.restoreState()


if __name__ == "__main__":
    build_pdf()
