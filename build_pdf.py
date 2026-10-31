import os
import sys
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
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
        if self._pageNumber == 1:
            # Decorative border on cover page
            self.saveState()
            self.setStrokeColor(colors.HexColor('#1A365D')) # Navy
            self.setLineWidth(3)
            self.rect(36, 36, 8.5 * 72 - 72, 11 * 72 - 72)
            self.setStrokeColor(colors.HexColor('#D69E2E')) # Gold
            self.setLineWidth(1)
            self.rect(40, 40, 8.5 * 72 - 80, 11 * 72 - 80)
            self.restoreState()
            return

        self.saveState()
        self.setFont('Helvetica-Bold', 8)
        self.setFillColor(colors.HexColor('#1A365D'))

        # Running Header
        if self._pageNumber <= 28:
            self.drawString(54, 11 * 72 - 36, 'TALANTA STADIUM | SMART DIGITAL INFRASTRUCTURE PROPOSAL')
        else:
            self.drawString(54, 11 * 72 - 36, 'TALANTA STADIUM | TECHNICAL ANNEX & ENGINEERING REFERENCE')

        self.setFont('Helvetica', 8)
        self.setFillColor(colors.HexColor('#4A5568'))
        self.drawRightString(8.5 * 72 - 54, 11 * 72 - 36, 'ST-TECH ICT CONSULTANTS')

        self.setStrokeColor(colors.HexColor('#CBD5E0'))
        self.setLineWidth(0.75)
        self.line(54, 11 * 72 - 42, 8.5 * 72 - 54, 11 * 72 - 42)

        # Running Footer
        page_text = f'Page {self._pageNumber} of {page_count}'
        self.drawRightString(8.5 * 72 - 54, 36, page_text)
        self.drawString(54, 36, 'CONFIDENTIAL CONCEPT — FOR GOVERNMENT PROCUREMENT EVALUATION ONLY')
        self.line(54, 48, 8.5 * 72 - 54, 48)
        self.restoreState()

def create_proposal_pdf(output_filename):
    doc = SimpleDocTemplate(
        output_filename,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=50,
        bottomMargin=50
    )

    styles = getSampleStyleSheet()

    primary_color = colors.HexColor('#1A365D') # Deep Navy
    secondary_color = colors.HexColor('#2B6CB0') # Slate Blue
    accent_color = colors.HexColor('#D69E2E') # Warm Gold
    dark_neutral = colors.HexColor('#2D3748') # Off-black
    bg_light = colors.HexColor('#F7FAFC') # Light grey background

    styles.add(ParagraphStyle('CoverCountry', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=15, leading=19, textColor=primary_color, alignment=1, spaceAfter=4))
    styles.add(ParagraphStyle('CoverMinistry', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=12, leading=16, textColor=secondary_color, alignment=1, spaceAfter=15))
    styles.add(ParagraphStyle('CoverTitle', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=22, leading=26, textColor=primary_color, alignment=1, spaceAfter=10))
    styles.add(ParagraphStyle('CoverSubTitle', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=12, leading=16, textColor=secondary_color, alignment=1, spaceAfter=12))
    styles.add(ParagraphStyle('CoverMotto', parent=styles['Normal'], fontName='Helvetica-BoldOblique', fontSize=11, leading=15, textColor=accent_color, alignment=1, spaceAfter=20))

    styles.add(ParagraphStyle('SecHeading', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=12.5, leading=15.5, textColor=primary_color, spaceBefore=2, spaceAfter=3, keepWithNext=True))
    styles.add(ParagraphStyle('SubSecHeading', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=10, leading=13, textColor=secondary_color, spaceBefore=3, spaceAfter=3, keepWithNext=True))
    styles.add(ParagraphStyle('BodyTextCustom', parent=styles['Normal'], fontName='Helvetica', fontSize=8, leading=10.8, textColor=dark_neutral, spaceAfter=3))
    styles.add(ParagraphStyle('BulletCustom', parent=styles['Normal'], fontName='Helvetica', fontSize=8, leading=10.8, textColor=dark_neutral, leftIndent=10, spaceAfter=2))
    styles.add(ParagraphStyle('CalloutText', parent=styles['Normal'], fontName='Helvetica-Oblique', fontSize=7.5, leading=10, textColor=colors.HexColor('#1A202C')))

    styles.add(ParagraphStyle('TableHeader', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=7.5, leading=9.5, textColor=colors.white, alignment=0))
    styles.add(ParagraphStyle('TableCell', parent=styles['Normal'], fontName='Helvetica', fontSize=7, leading=9, textColor=dark_neutral, alignment=0))
    styles.add(ParagraphStyle('TableCellBold', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=7, leading=9, textColor=primary_color, alignment=0))

    # Helper function to add callout
    def add_callout(text_content):
        call_p = Paragraph(f"<b>IMPORTANT NOTICE:</b> {text_content}", styles['CalloutText'])
        t = Table([[call_p]], colWidths=[6.5 * inch])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#EBF8FF')),
            ('BOX', (0,0), (-1,-1), 0.75, secondary_color),
            ('PADDING', (0,0), (-1,-1), 4),
        ]))
        return t

    # Helper function for standardized page-aligned section rendering
    def make_page_section(title, num_str, body_paragraphs, callout_str=None, table_obj=None, is_last=False):
        flowables = []
        flowables.append(Paragraph(f"{num_str}. {title}", styles['SecHeading']))
        flowables.append(HRFlowable(width="100%", thickness=1, color=secondary_color, spaceAfter=4, spaceBefore=0))
        for bp in body_paragraphs:
            if bp.startswith('* '):
                flowables.append(Paragraph(f"• {bp[2:]}", styles['BulletCustom']))
            else:
                flowables.append(Paragraph(bp, styles['BodyTextCustom']))
        if callout_str:
            flowables.append(Spacer(1, 2))
            flowables.append(add_callout(callout_str))
        if table_obj:
            flowables.append(Spacer(1, 3))
            flowables.append(table_obj)
        if not is_last:
            flowables.append(PageBreak())
        return flowables

    # Table of Contents Data
    toc_data_1 = [
        [Paragraph('<b>Core Proposal Section Title</b>', styles['TableHeader']), Paragraph('<b>Target Page</b>', styles['TableHeader'])],
        [Paragraph('1. Proposal Overview and Commercial Basis', styles['TableCell']), Paragraph('Page 4', styles['TableCellBold'])],
        [Paragraph('2. Document Control, Purpose and How to Use This Proposal', styles['TableCell']), Paragraph('Page 5', styles['TableCellBold'])],
        [Paragraph('3. Executive Summary and Core Proposed Outcomes', styles['TableCell']), Paragraph('Page 6', styles['TableCellBold'])],
        [Paragraph('4. Public-Sector Case and Strategic Value Alignment', styles['TableCell']), Paragraph('Page 7', styles['TableCellBold'])],
        [Paragraph('5. Venue Context, Construction Background and Scope Boundaries', styles['TableCell']), Paragraph('Page 8', styles['TableCellBold'])],
        [Paragraph('6. Scope of Work and Workstream Deliverables Matrix', styles['TableCell']), Paragraph('Page 9', styles['TableCellBold'])],
        [Paragraph('7. Public Website Portal and Mobile User Experience', styles['TableCell']), Paragraph('Page 10', styles['TableCellBold'])],
        [Paragraph('8. Ticketing and Cashless Payment Order Workflow', styles['TableCell']), Paragraph('Page 11', styles['TableCellBold'])],
        [Paragraph('9. High-Level System Architecture and Design Principles', styles['TableCell']), Paragraph('Page 12', styles['TableCellBold'])],
        [Paragraph('10. Detailed Architecture, Tiers, Data Flow and Environments', styles['TableCell']), Paragraph('Page 13', styles['TableCellBold'])],
        [Paragraph('11. Core System Data Model and Primary Entities', styles['TableCell']), Paragraph('Page 14', styles['TableCellBold'])],
        [Paragraph('12. Gate Access Control, Ticket Validation and Crowd Operations', styles['TableCell']), Paragraph('Page 15', styles['TableCellBold'])],
        [Paragraph('13. Identity Verification and Optional Biometrics Framework', styles['TableCell']), Paragraph('Page 16', styles['TableCellBold'])],
        [Paragraph('14. Staff, Contractor and Accreditation Management System', styles['TableCell']), Paragraph('Page 17', styles['TableCellBold'])],
        [Paragraph('15. Matchday Command Centre, Dashboards and Analytics', styles['TableCell']), Paragraph('Page 18', styles['TableCellBold'])],
        [Paragraph('16. Cybersecurity, Data Privacy and Compliance Plan', styles['TableCell']), Paragraph('Page 19', styles['TableCellBold'])],
        [Paragraph('17. Hosting, Availability, Disaster Recovery and Support SLA', styles['TableCell']), Paragraph('Page 20', styles['TableCellBold'])],
        [Paragraph('18. Implementation Roadmap and 10-Month Phase Schedule', styles['TableCell']), Paragraph('Page 21', styles['TableCellBold'])],
        [Paragraph('19. Project Milestones, Dependencies and Acceptance Gates', styles['TableCell']), Paragraph('Page 22', styles['TableCellBold'])],
        [Paragraph('20. Testing, Quality Assurance and Go-Live Readiness Controls', styles['TableCell']), Paragraph('Page 23', styles['TableCellBold'])],
        [Paragraph('21. Project Team Roles, Responsibilities and Knowledge Transfer', styles['TableCell']), Paragraph('Page 24', styles['TableCellBold'])],
        [Paragraph('22. Detailed Indicative Budget and Itemised Cost Basis (KES 75M)', styles['TableCell']), Paragraph('Page 25', styles['TableCellBold'])],
        [Paragraph('23. Commercial Model, Payment Milestones and Total Cost of Ownership', styles['TableCell']), Paragraph('Page 26', styles['TableCellBold'])],
        [Paragraph('24. Benefits Measurement, Risk Register and Mitigation Strategy', styles['TableCell']), Paragraph('Page 27', styles['TableCellBold'])],
        [Paragraph('25. Governance Framework, Verified Sources and Final Submission Checklist', styles['TableCell']), Paragraph('Page 28', styles['TableCellBold'])],
    ]

    toc_data_2 = [
        [Paragraph('<b>Technical Annex Reference Section Title</b>', styles['TableHeader']), Paragraph('<b>Target Page</b>', styles['TableHeader'])],
        [Paragraph('26. Detailed Public Website Sitemap and User Journeys', styles['TableCell']), Paragraph('Page 29', styles['TableCellBold'])],
        [Paragraph('27. Seat Mapping, Ticket Categories and Inventory Rules', styles['TableCell']), Paragraph('Page 30', styles['TableCellBold'])],
        [Paragraph('28. API Design, Integration Contracts and Error Handling Specifications', styles['TableCell']), Paragraph('Page 31', styles['TableCellBold'])],
        [Paragraph('29. Database Architecture, Audit Trail and Data Lifecycle Management', styles['TableCell']), Paragraph('Page 32', styles['TableCellBold'])],
        [Paragraph('30. Hosting, DevSecOps and CI/CD Deployment Controls', styles['TableCell']), Paragraph('Page 33', styles['TableCellBold'])],
        [Paragraph('31. Event-Day Operations and Command-Centre Operational Runbook', styles['TableCell']), Paragraph('Page 34', styles['TableCellBold'])],
        [Paragraph('32. Load Planning, Performance Targets and Capacity Validation Streams', styles['TableCell']), Paragraph('Page 35', styles['TableCellBold'])],
        [Paragraph('33. Training Streams, Service Desk SLA and 12-Month Warranty Framework', styles['TableCell']), Paragraph('Page 36', styles['TableCellBold'])],
        [Paragraph('34. Procurement Evaluation Matrix, Acceptance Criteria and Change Control', styles['TableCell']), Paragraph('Page 37', styles['TableCellBold'])],
        [Paragraph('35. Final Technical Commitments, Client Assumptions and Recommended Next Steps', styles['TableCell']), Paragraph('Page 38', styles['TableCellBold'])],
    ]

    t_toc1 = Table(toc_data_1, colWidths=[5.4 * inch, 1.1 * inch])
    t_toc1.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), primary_color),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E0')),
        ('PADDING', (0,0), (-1,-1), 3),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, bg_light])
    ]))

    t_toc2 = Table(toc_data_2, colWidths=[5.4 * inch, 1.1 * inch])
    t_toc2.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), primary_color),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E0')),
        ('PADDING', (0,0), (-1,-1), 5),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, bg_light])
    ]))

    # All Body Texts
    s1_body = [
        "Target Venue: Talanta Sports City / Talanta Stadium (60,000-Seat Capacity), Nairobi, Kenya.",
        "Proposed Client: Ministry of Sports / Relevant Government Stadium Operating Authority.",
        "Proposing Firm: ST-Tech ICT Consultants.",
        "Proposal Status: Expanded Concept Proposal for Evaluation and Procurement Planning.",
        "Commercial Basis: Indicative Planning Envelope (Preliminary; Non-Binding Quotation).",
        "Reference Directive: Presidential Directive / Public Procurement Framework Context.",
        "This document presents a comprehensive, government-aligned technical and commercial proposal for an Integrated Smart Infrastructure System at Talanta Stadium. The proposed solution establishes an end-to-end digital operating framework encompassing public e-ticketing, secure payment gateways, gate validation, workforce accreditation, real-time command dashboards, and financial reconciliation."
    ]

    s2_body = [
        "This document describes a proposed digital platform that could be developed if ST-Tech ICT Consultants is selected through the applicable public procurement process. It supports stakeholder discussion and tender planning—not substituting for a formal tender response, signed contract, detailed design, or statutory approvals.",
        "Field Metadata Breakdown:",
        "* Document Title: Integrated Talanta Stadium Smart Digital Infrastructure Technical & Financial Proposal",
        "* Version Reference: Expanded Concept Proposal – Final Polish & Review Draft",
        "* Venue Context: Talanta Sports City / Talanta Stadium, Nairobi, Kenya (60,000 Capacity)",
        "* Proposer: ST-Tech ICT Consultants (Authorised Representative & Technical Lead)",
        "* Planning Envelope: KES 75,000,000 preliminary planning envelope carried forward from initial draft",
        "* Implementation Period: Indicative 10-month delivery roadmap post-contract execution and site access",
        "* Required Approvals: Client ICT, Venue Operations, Ministry of Finance, Office of the Data Protection Commissioner (ODPC), Communications Authority (CA), and Procurement Authorities"
    ]

    s3_body = [
        "Talanta Stadium is a flagship national infrastructure project designed to anchor major regional and international sporting events. The opportunity proposed by ST-Tech ICT Consultants is to build a unified digital operating layer surrounding event discovery, ticket issuance, cashless payment processing, gate entry validation, staff accreditation, matchday command operations, and automated financial settlement.",
        "The proposed Integrated Talanta Stadium Digital Infrastructure (ITSDI) utilizes a modular, micro-service-ready architecture. This enables the venue operator to deploy core ticketing, payment, and gate validation systems first, followed by incremental integration of advanced workforce, accreditation, and analytical modules once operational baseline stability is verified.",
        "Core Proposed Outcomes:",
        "* Official Public Channel: Unified mobile-first web portal for fixture discovery, ticket purchasing, matchday instructions, and customer service.",
        "* Financial Integrity & Settlement: Real-time M-PESA and card transaction verification, automated refund handling, and event-level revenue reconciliation.",
        "* High-Throughput Gate Control: Rapid ticket validation workflows backed by offline cached contingency rules and supervisor exception handling.",
        "* Workforce & Accreditation Management: Centralised role-based credentialing, shift scheduling, vendor attendance tracking, and zone access control.",
        "* Unified Command Centre: Real-time operational dashboards providing attendance counts, gate health metrics, queue warnings, and incident tracking.",
        "* Privacy & Security by Design: Strict compliance with Kenya's Data Protection Act 2019, TLS/AES encryption, MFA for administration, and full auditability.",
        "Formal Decision Sought: Approve a formal Discovery & Feasibility Phase to validate venue site readiness, existing infrastructure interfaces, network cabling, power distribution, data protection parameters, and public procurement requirements prior to finalizing a binding contract."
    ]

    s4_body = [
        "A government-grade digital infrastructure proposal must deliver tangible public value, financial accountability, and operational efficiency. The ITSDI platform directly aligns with national digital transformation priorities and stadium management objectives."
    ]
    s4_table_data = [
        [Paragraph('<b>Public Sector Objective</b>', styles['TableHeader']), Paragraph('<b>Proposed System Contribution</b>', styles['TableHeader']), Paragraph('<b>Target Evidence / KPI</b>', styles['TableHeader'])],
        [Paragraph('Financial Accountability', styles['TableCellBold']), Paragraph('Traceable transaction logs, automated M-PESA reconciliation, audit-ready revenue reports per event.', styles['TableCell']), Paragraph('Signed event reconciliation statement within 24 hours of match closeout.', styles['TableCell'])],
        [Paragraph('Safer Event Flow', styles['TableCellBold']), Paragraph('Live gate validation rates, density heatmaps, queue bottleneck alerts, and structured escalation.', styles['TableCell']), Paragraph('Median gate throughput <2.5 seconds; zero unhandled turnstile queues.', styles['TableCell'])],
        [Paragraph('Convenient Public Service', styles['TableCellBold']), Paragraph('Mobile-optimised booking, instant digital ticket delivery, self-service recovery, accessible seating.', styles['TableCell']), Paragraph('>90% checkout completion rate; customer support response <5 mins.', styles['TableCell'])],
        [Paragraph('Operational Efficiency', styles['TableCellBold']), Paragraph('Automated roster scheduling, zone-specific accreditation, shift timekeeping, vendor invoice verification.', styles['TableCell']), Paragraph('<2% variance between scheduled staff shifts and vendor billing claims.', styles['TableCell'])],
        [Paragraph('Local Capability Transfer', styles['TableCellBold']), Paragraph('Comprehensive technical training, operational runbooks, administrator handover, ongoing local IT support.', styles['TableCell']), Paragraph('100% pass rate on operator competency evaluations prior to go-live.', styles['TableCell'])],
        [Paragraph('Privacy & Digital Trust', styles['TableCellBold']), Paragraph('Data minimisation, clear privacy notices, role-based access restrictions, strict retention schedules.', styles['TableCell']), Paragraph('Zero non-compliant data disclosures; completed DPIA assessment.', styles['TableCell'])],
    ]
    s4_table = Table(s4_table_data, colWidths=[1.8 * inch, 2.7 * inch, 2.0 * inch])
    s4_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), primary_color),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E0')),
        ('PADDING', (0,0), (-1,-1), 3),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, bg_light])
    ]))

    s5_body = [
        "Publicly available reporting confirms that China Road and Bridge Corporation (CRBC) is the main engineering contractor for Talanta Sports City, with technical supervision and project execution oversight provided by the Kenya Defence Forces (KDF) Engineering Department. Architectural and design consultancies have been associated with University of Nairobi Enterprises and Services Limited (UNES) under Prof. Erastus Abonyo.",
        "Construction officially commenced in March 2024. A CRBC project update dated 10 February 2026 targeted substantial civil completion by late Q1 2026. The actual current status of structural handover, power connection, and site readiness must be formally confirmed with venue authorities before physical installation begins.",
        "Digital Project Boundaries:",
        "* Core Focus: Software platform, API integration layer, mobile scanner applications, data management, and operational dashboards.",
        "* Physical Hardware: Turnstile barriers, CCTV cameras, servers, network cabling, access gates, and power systems require independent procurement or integration with existing venue contracts.",
        "* Third-Party Approval: Integrations with external payment providers (Safaricom M-PESA) or government identity registers require formal legal authorization and technical interface documentation."
    ]

    s6_body = [
        "The proposed implementation is structured into eight core workstreams, ensuring full coverage from requirements gathering to post-launch hypercare."
    ]
    s6_table_data = [
        [Paragraph('<b>Workstream</b>', styles['TableHeader']), Paragraph('<b>Included Scope & Technical Capabilities</b>', styles['TableHeader']), Paragraph('<b>Key Deliverable / Acceptance Target</b>', styles['TableHeader'])],
        [Paragraph('1. Discovery & Design', styles['TableCellBold']), Paragraph('Workshops, requirements, service maps, site survey, system inventory, risk and dependency analysis.', styles['TableCell']), Paragraph('Approved requirements and solution design pack.', styles['TableCell'])],
        [Paragraph('2. Public Ticketing', styles['TableCellBold']), Paragraph('Fixture pages, ticket categories, booking, secure references, confirmation, support and refund workflows.', styles['TableCell']), Paragraph('Tested web application and admin workflow.', styles['TableCell'])],
        [Paragraph('3. Payments', styles['TableCellBold']), Paragraph('Approved provider integration, callback handling, transaction states and reconciliation.', styles['TableCell']), Paragraph('Sandbox evidence and production approval checklist.', styles['TableCell'])],
        [Paragraph('4. Gate Validation', styles['TableCellBold']), Paragraph('Ticket validation APIs, scanner workflows, exception queue and offline procedure.', styles['TableCell']), Paragraph('Test report against approved gate devices.', styles['TableCell'])],
        [Paragraph('5. Workforce', styles['TableCellBold']), Paragraph('Staff/vendor records, roles, accreditation, roster, attendance and expiry alerts.', styles['TableCell']), Paragraph('Working staff portal and exportable reports.', styles['TableCell'])],
        [Paragraph('6. Command Dashboard', styles['TableCellBold']), Paragraph('Event view, gate/device health, incident queue, attendance and revenue summaries.', styles['TableCell']), Paragraph('Role-based dashboards and audit exports.', styles['TableCell'])],
        [Paragraph('7. Security & Privacy', styles['TableCellBold']), Paragraph('Threat model, privacy review, access controls, test support, retention and incident playbooks.', styles['TableCell']), Paragraph('Review reports and remediation evidence.', styles['TableCell'])],
        [Paragraph('8. Training & Handover', styles['TableCellBold']), Paragraph('Admin/operator training, user guides, support model, recovery drill and documentation.', styles['TableCell']), Paragraph('Signed training and handover pack.', styles['TableCell'])],
    ]
    s6_table = Table(s6_table_data, colWidths=[1.5 * inch, 2.8 * inch, 2.2 * inch])
    s6_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), primary_color),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E0')),
        ('PADDING', (0,0), (-1,-1), 3),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, bg_light])
    ]))

    s7_body = [
        "The public web and mobile portal serves as the primary digital touchpoint for stadium patrons, offering a secure, accessible, and fast-loading experience across mobile networks.",
        "Core User Journeys:",
        "* Home & Fixture Discovery: Official notices, upcoming match details, venue guidelines, and service status alerts.",
        "* Event Selection & Booking: Interactive zone/seat selection, transparent pricing breakdowns, accessible seating options, and countdown hold timers.",
        "* Cashless Checkout: Seamless M-PESA STK Push prompt, card payment options, instant transaction verification, and downloadable PDF/digital wallet tickets.",
        "* Digital Ticket Wallet: Secure dynamic QR codes, offline ticket view capability, ticket transfer controls, and self-service support.",
        "* Help & Customer Care: Frequently asked questions, refund policies, lost ticket recovery, accessibility assistance, and contact forms.",
        "Design Standards: Target WCAG 2.2 Level AA accessibility compliance, mobile-first responsive design for 3G/4G networks, screen reader compatibility, and high-contrast visual modes."
    ]

    s8_body = [
        "To guarantee financial integrity and prevent fraudulent ticket generation, payment confirmation and ticket issuance are strictly decoupled and executed asynchronously."
    ]
    s8_table_data = [
        [Paragraph('<b>Order State</b>', styles['TableHeader']), Paragraph('<b>System Action & Behaviour</b>', styles['TableHeader']), Paragraph('<b>Control Safeguard</b>', styles['TableHeader'])],
        [Paragraph('Draft Order', styles['TableCellBold']), Paragraph('Hold selected seat/zone inventory for a defined configurable period.', styles['TableCell']), Paragraph('Expiry and inventory locking rules; concurrency locks.', styles['TableCell'])],
        [Paragraph('Payment Pending', styles['TableCellBold']), Paragraph('Show pending state and reference; allow safe status refresh.', styles['TableCell']), Paragraph('Idempotency and callback verification; polling limits.', styles['TableCell'])],
        [Paragraph('Paid / Confirmed', styles['TableCellBold']), Paragraph('Issue signed ticket reference, QR code, and e-receipt; notify user.', styles['TableCell']), Paragraph('Unique order ID, cryptographic signature, audit record.', styles['TableCell'])],
        [Paragraph('Failed / Timed Out', styles['TableCellBold']), Paragraph('Explain next step; do not issue paid ticket until confirmed.', styles['TableCell']), Paragraph('Re-query provider status; prevent duplicate charges.', styles['TableCell'])],
        [Paragraph('Refund / Cancellation', styles['TableCellBold']), Paragraph('Apply authorised rules, revoke ticket credentials, log status.', styles['TableCell']), Paragraph('Role-based approval, two-factor authorization, audit log.', styles['TableCell'])],
    ]
    s8_table = Table(s8_table_data, colWidths=[1.5 * inch, 2.8 * inch, 2.2 * inch])
    s8_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), primary_color),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E0')),
        ('PADDING', (0,0), (-1,-1), 3),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, bg_light])
    ]))

    s9_body = [
        "The ITSDI platform employs a modern multi-tier architecture designed for high availability, fast response times, and security.",
        "Architectural Principles:",
        "* Public Channel: Browser-based website, mobile web, and optional notifications.",
        "* API Layer: Authentication, authorisation, rate limiting, input validation, and central audit events.",
        "* Business Services: Ticket inventory, payments, ticket validation, accreditation, workforce, reports, and notifications.",
        "* Data Layer: Relational transactional data, controlled document/object storage, audit log store, and backups.",
        "* Venue Edge: Locally available validation data only where approved; synchronisation and documented offline rules.",
        "* External Services: Payment provider and any government identity services only after formal approval and interface confirmation."
    ]

    s10_body = [
        "System Tier Breakdown & Deployment Environments:"
    ]
    s10_table_data = [
        [Paragraph('<b>Layer</b>', styles['TableHeader']), Paragraph('<b>Responsibilities & Capabilities</b>', styles['TableHeader']), Paragraph('<b>Design Requirements & Safeguards</b>', styles['TableHeader'])],
        [Paragraph('Experience Tier', styles['TableCellBold']), Paragraph('Public site, staff portal, steward interface, admin console.', styles['TableCell']), Paragraph('Responsive, accessible, role-aware, safe session handling.', styles['TableCell'])],
        [Paragraph('Application / API Tier', styles['TableCellBold']), Paragraph('Ticketing, inventory, payments, event configuration, accreditation, reporting.', styles['TableCell']), Paragraph('Versioned APIs, validation, idempotency, audit hooks.', styles['TableCell'])],
        [Paragraph('Integration Tier', styles['TableCellBold']), Paragraph('Payment callbacks, scanners, SMS/email, approved external systems.', styles['TableCell']), Paragraph('Timeouts, retries, provider status checks, secret management.', styles['TableCell'])],
        [Paragraph('Persistence Tier', styles['TableCellBold']), Paragraph('Orders, ticket state, event inventory, roles, logs and reports.', styles['TableCell']), Paragraph('Backups, encryption, retention, and least privilege access.', styles['TableCell'])],
        [Paragraph('Operations Tier', styles['TableCellBold']), Paragraph('Monitoring, deployment, backups, alerting and incident response.', styles['TableCell']), Paragraph('Separate environments, controlled releases, automated rollback.', styles['TableCell'])],
    ]
    s10_table = Table(s10_table_data, colWidths=[1.5 * inch, 2.7 * inch, 2.3 * inch])
    s10_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), primary_color),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E0')),
        ('PADDING', (0,0), (-1,-1), 3),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, bg_light])
    ]))

    s11_body = [
        "A standardized relational data model prevents ticket duplication, inventory overselling, and financial discrepancies."
    ]
    s11_table_data = [
        [Paragraph('<b>Entity Name</b>', styles['TableHeader']), Paragraph('<b>Key Attributes & Relationships</b>', styles['TableHeader']), Paragraph('<b>Essential Governance Controls</b>', styles['TableHeader'])],
        [Paragraph('Event', styles['TableCellBold']), Paragraph('Event ID, venue, date/time, status, entry rules, ticket categories.', styles['TableCell']), Paragraph('Approved publishing; edit history audit log.', styles['TableCell'])],
        [Paragraph('Ticket Inventory', styles['TableCellBold']), Paragraph('Category, seat/zone, allocation, price, availability.', styles['TableCell']), Paragraph('Concurrency control; no overselling under load.', styles['TableCell'])],
        [Paragraph('Order / Payment', styles['TableCellBold']), Paragraph('Order ID, amount, currency, provider reference, status, timestamps.', styles['TableCell']), Paragraph('Idempotency; verified status; reconciliation.', styles['TableCell'])],
        [Paragraph('Ticket', styles['TableCellBold']), Paragraph('Ticket ID, order ID, event ID, status, validation events.', styles['TableCell']), Paragraph('Single-use rules; revocation; anti-replay.', styles['TableCell'])],
        [Paragraph('User / Role', styles['TableCellBold']), Paragraph('Account ID, role, permissions, contact preferences.', styles['TableCell']), Paragraph('MFA for privileged users; periodic access reviews.', styles['TableCell'])],
        [Paragraph('Accreditation', styles['TableCellBold']), Paragraph('Person/organisation reference, role, zone, validity period.', styles['TableCell']), Paragraph('Purpose limitation; expiry; approval log.', styles['TableCell'])],
        [Paragraph('Audit Event', styles['TableCellBold']), Paragraph('Actor, action, object, timestamp, result, correlation ID.', styles['TableCell']), Paragraph('Tamper-resistant write-once storage; restricted access.', styles['TableCell'])],
        [Paragraph('Incident / Device', styles['TableCellBold']), Paragraph('Gate/device identifier, status, event, assigned responder.', styles['TableCell']), Paragraph('Severity, escalation and closure record.', styles['TableCell'])],
    ]
    s11_table = Table(s11_table_data, colWidths=[1.4 * inch, 2.8 * inch, 2.3 * inch])
    s11_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), primary_color),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E0')),
        ('PADDING', (0,0), (-1,-1), 3),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, bg_light])
    ]))

    s12_body = [
        "Gate validation must be fast, observable and safe. The precise validation method depends on existing devices and the operator's security model.",
        "Proposed Validation Sequence:",
        "* Scanner reads the ticket token and verifies signature/status through the approved validation service.",
        "* System checks event, entry window, ticket category, revocation and prior-use rules.",
        "* Approved result returns clear accept/reject/exception status with minimal personal data displayed.",
        "* A successful entry is recorded with gate/device, event, timestamp and ticket reference.",
        "* An exception routes to a trained supervisor rather than forcing an unsafe decision.",
        "* If network connectivity is lost, operators follow a rehearsed fallback with post-event reconciliation."
    ]

    s13_body = [
        "Biometric facial recognition is a sensitive, high-impact option—not a default requirement. It should be considered only if the stadium operator demonstrates a specific need that cannot be reasonably met by less intrusive methods, and after legal, privacy, accuracy, bias, accessibility and security review.",
        "Required Decision Gates Before Deployment:",
        "* Define precise purpose and lawful basis; obtain legal and data-protection review.",
        "* Complete a Data Protection Impact Assessment (DPIA) and consult the relevant authority.",
        "* Assess whether QR/NFC credentials or visual ID checks can achieve the purpose with less risk.",
        "* Define enrollment, consent, retention, deletion, access, breach handling and vendor restrictions.",
        "* Test false acceptance/rejection, demographic performance, lighting, and environmental conditions.",
        "* Provide an accessible, staffed non-biometric alternative and appeal process for failed matches.",
        "* Prohibit secondary use or surveillance expansion without a new approved assessment."
    ]

    s14_body = [
        "The workforce module coordinates internal stadium staff, security personnel, contractors, catering vendors, media, and VIP guests."
    ]
    s14_table_data = [
        [Paragraph('<b>Capability</b>', styles['TableHeader']), Paragraph('<b>Operational Workflow</b>', styles['TableHeader']), Paragraph('<b>Administrative Control</b>', styles['TableHeader'])],
        [Paragraph('Onboarding', styles['TableCellBold']), Paragraph('Create record, organisation, role, approved documents and validity dates.', styles['TableCell']), Paragraph('Authorised approver; minimum necessary data.', styles['TableCell'])],
        [Paragraph('Shift Planning', styles['TableCellBold']), Paragraph('Assign event, shift, supervisor and duty location.', styles['TableCell']), Paragraph('Conflict checks and version history.', styles['TableCell'])],
        [Paragraph('Accreditation', styles['TableCellBold']), Paragraph('Issue credential with permitted zones and active time window.', styles['TableCell']), Paragraph('Least privilege; expiry and revocation.', styles['TableCell'])],
        [Paragraph('Attendance', styles['TableCellBold']), Paragraph('Record check-in/out by approved method and flag exceptions.', styles['TableCell']), Paragraph('Supervisor review; no automatic payroll approval.', styles['TableCell'])],
        [Paragraph('Vendor Reporting', styles['TableCellBold']), Paragraph('Compare approved rosters, attendance and submitted service records.', styles['TableCell']), Paragraph('Finance approval and audit trail.', styles['TableCell'])],
        [Paragraph('Offboarding', styles['TableCellBold']), Paragraph('Expire credential and remove account access at end of assignment.', styles['TableCell']), Paragraph('Revocation confirmation.', styles['TableCell'])],
    ]
    s14_table = Table(s14_table_data, colWidths=[1.5 * inch, 2.7 * inch, 2.3 * inch])
    s14_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), primary_color),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E0')),
        ('PADDING', (0,0), (-1,-1), 3),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, bg_light])
    ]))

    s15_body = [
        "A command-centre dashboard provides role-specific views rather than a single screen containing every sensitive detail. Priority is clear, timely operational information and actionable alerts."
    ]
    s15_table_data = [
        [Paragraph('<b>Dashboard View</b>', styles['TableHeader']), Paragraph('<b>Indicative Information Displayed</b>', styles['TableHeader']), Paragraph('<b>Authorised Users</b>', styles['TableHeader'])],
        [Paragraph('Event Overview', styles['TableCellBold']), Paragraph('Event status, scan counts, gate health, service alerts and incident queue.', styles['TableCell']), Paragraph('Event control / venue management.', styles['TableCell'])],
        [Paragraph('Gate Operations', styles['TableCellBold']), Paragraph('Validation rates, rejects, device heartbeat and exception trends.', styles['TableCell']), Paragraph('Gate supervisors / technical support.', styles['TableCell'])],
        [Paragraph('Finance Console', styles['TableCellBold']), Paragraph('Orders, paid/failed/pending, refunds, payment settlements and variances.', styles['TableCell']), Paragraph('Authorised finance / audit.', styles['TableCell'])],
        [Paragraph('Workforce Console', styles['TableCellBold']), Paragraph('Shift coverage, attendance exceptions, accreditation expiry and vendor rosters.', styles['TableCell']), Paragraph('Operations / HR / contract managers.', styles['TableCell'])],
        [Paragraph('Security / Incident', styles['TableCellBold']), Paragraph('Approved incident records, escalation status and response owner.', styles['TableCell']), Paragraph('Authorised security personnel.', styles['TableCell'])],
        [Paragraph('Technical Health', styles['TableCellBold']), Paragraph('Application errors, latency, queue depth, storage, network and backup status.', styles['TableCell']), Paragraph('ICT and support team.', styles['TableCell'])],
    ]
    s15_table = Table(s15_table_data, colWidths=[1.5 * inch, 2.8 * inch, 2.2 * inch])
    s15_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), primary_color),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E0')),
        ('PADDING', (0,0), (-1,-1), 3),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, bg_light])
    ]))

    s16_body = [
        "Security and data privacy are embedded into every layer of the platform architecture in compliance with Kenyan laws and global standards."
    ]
    s16_table_data = [
        [Paragraph('<b>Control Domain</b>', styles['TableHeader']), Paragraph('<b>Proposed Technical Implementation</b>', styles['TableHeader']), Paragraph('<b>Compliance Evidence</b>', styles['TableHeader'])],
        [Paragraph('Identity & Access', styles['TableCellBold']), Paragraph('Role-based access, MFA for privileged users, session controls and account lifecycle.', styles['TableCell']), Paragraph('Access review report.', styles['TableCell'])],
        [Paragraph('Encryption', styles['TableCellBold']), Paragraph('TLS for data in transit; encryption at rest and managed keys where supported.', styles['TableCell']), Paragraph('Configuration review.', styles['TableCell'])],
        [Paragraph('Secure Development', styles['TableCellBold']), Paragraph('Code review, dependency scanning, secrets scanning, input validation and security tests.', styles['TableCell']), Paragraph('Build pipeline evidence.', styles['TableCell'])],
        [Paragraph('Monitoring', styles['TableCellBold']), Paragraph('Centralised application/security logs, alerting, time synchronisation and incident runbooks.', styles['TableCell']), Paragraph('Alert and incident drill.', styles['TableCell'])],
        [Paragraph('Resilience', styles['TableCellBold']), Paragraph('Backups, restore testing, recovery targets and controlled failover.', styles['TableCell']), Paragraph('Restore test report.', styles['TableCell'])],
        [Paragraph('Independent Assurance', styles['TableCellBold']), Paragraph('Third-party penetration test and remediation before production approval.', styles['TableCell']), Paragraph('Report and closure evidence.', styles['TableCell'])],
        [Paragraph('Data Protection', styles['TableCellBold']), Paragraph('Data mapping, lawful basis review, privacy notices, retention and DPIA assessment.', styles['TableCell']), Paragraph('Signed privacy decision record.', styles['TableCell'])],
    ]
    s16_table = Table(s16_table_data, colWidths=[1.5 * inch, 2.8 * inch, 2.2 * inch])
    s16_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), primary_color),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E0')),
        ('PADDING', (0,0), (-1,-1), 3),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, bg_light])
    ]))

    s17_body = [
        "Hosting design should be selected after confirming government hosting policy, data residency needs, traffic assumptions, recovery requirements and total cost."
    ]
    s17_table_data = [
        [Paragraph('<b>Operational Area</b>', styles['TableHeader']), Paragraph('<b>Recommended Technical Approach</b>', styles['TableHeader']), Paragraph('<b>Decision to Confirm</b>', styles['TableHeader'])],
        [Paragraph('Hosting', styles['TableCellBold']), Paragraph('Approved cloud or data-centre environment with monitored resources and separated environments.', styles['TableCell']), Paragraph('Hosting policy, region and recurring cost.', styles['TableCell'])],
        [Paragraph('Backups', styles['TableCellBold']), Paragraph('Encrypted scheduled backups, separate credentials and periodic restore tests.', styles['TableCell']), Paragraph('Retention and recovery point objective (RPO).', styles['TableCell'])],
        [Paragraph('Recovery', styles['TableCellBold']), Paragraph('Documented recovery runbook, named incident roles and rehearsed restore procedure.', styles['TableCell']), Paragraph('Recovery time objective (RTO) and priorities.', styles['TableCell'])],
        [Paragraph('Offline Entry', styles['TableCellBold']), Paragraph('Approved cached validation or controlled manual fallback, with post-event reconciliation.', styles['TableCell']), Paragraph('Device support and security risk.', styles['TableCell'])],
        [Paragraph('Monitoring', styles['TableCellBold']), Paragraph('Application, infrastructure, payment callback, queue and device-health alerts.', styles['TableCell']), Paragraph('On-call coverage and escalation route.', styles['TableCell'])],
        [Paragraph('Service Desk', styles['TableCellBold']), Paragraph('Ticketed support, severity levels, known-error database and event-day escalation.', styles['TableCell']), Paragraph('Support hours, SLA and service credits.', styles['TableCell'])],
    ]
    s17_table = Table(s17_table_data, colWidths=[1.5 * inch, 2.7 * inch, 2.3 * inch])
    s17_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), primary_color),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E0')),
        ('PADDING', (0,0), (-1,-1), 3),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, bg_light])
    ]))

    s18_body = [
        "The project is structured across seven phases spanning an estimated 10-month delivery timeline."
    ]
    s18_table_data = [
        [Paragraph('<b>Phase</b>', styles['TableHeader']), Paragraph('<b>Duration</b>', styles['TableHeader']), Paragraph('<b>Key Activities & Technical Work</b>', styles['TableHeader']), Paragraph('<b>Gate Deliverable</b>', styles['TableHeader'])],
        [Paragraph('1. Discovery', styles['TableCellBold']), Paragraph('4 weeks', styles['TableCell']), Paragraph('Workshops, site survey, integrations baseline, risk & requirements.', styles['TableCell']), Paragraph('Signed requirements baseline.', styles['TableCell'])],
        [Paragraph('2. Design', styles['TableCellBold']), Paragraph('4 weeks', styles['TableCell']), Paragraph('UX prototypes, architecture, data model, threat model, DPIA.', styles['TableCell']), Paragraph('Design and privacy gate.', styles['TableCell'])],
        [Paragraph('3. Core Build', styles['TableCellBold']), Paragraph('12 weeks', styles['TableCell']), Paragraph('Website, event catalogue, orders, ticket wallet, admin & reports.', styles['TableCell']), Paragraph('Staging release.', styles['TableCell'])],
        [Paragraph('4. Integrations', styles['TableCellBold']), Paragraph('8 weeks', styles['TableCell']), Paragraph('Payment sandbox, approved scanners, notification & data exchange.', styles['TableCell']), Paragraph('Interface test evidence.', styles['TableCell'])],
        [Paragraph('5. Pilot / QA', styles['TableCellBold']), Paragraph('6 weeks', styles['TableCell']), Paragraph('User acceptance, accessibility, load, security, recovery & simulation.', styles['TableCell']), Paragraph('Pilot acceptance / remediation.', styles['TableCell'])],
        [Paragraph('6. Deployment', styles['TableCellBold']), Paragraph('4 weeks', styles['TableCell']), Paragraph('Production setup, training, operational readiness & launch support.', styles['TableCell']), Paragraph('Go-live approval.', styles['TableCell'])],
        [Paragraph('7. Hypercare', styles['TableCellBold']), Paragraph('4 weeks', styles['TableCell']), Paragraph('Enhanced monitoring, issue closure, handover & service review.', styles['TableCell']), Paragraph('Signed handover certificate.', styles['TableCell'])],
    ]
    s18_table = Table(s18_table_data, colWidths=[1.2 * inch, 0.8 * inch, 2.7 * inch, 1.8 * inch])
    s18_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), primary_color),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E0')),
        ('PADDING', (0,0), (-1,-1), 3),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, bg_light])
    ]))

    s19_body = [
        "Milestones, Dependencies and Acceptance Gates:"
    ]
    s19_table_data = [
        [Paragraph('<b>Target Point</b>', styles['TableHeader']), Paragraph('<b>Milestone / Deliverable</b>', styles['TableHeader']), Paragraph('<b>Client Dependency</b>', styles['TableHeader']), Paragraph('<b>Acceptance Evidence</b>', styles['TableHeader'])],
        [Paragraph('End Month 1', styles['TableCellBold']), Paragraph('Discovery report, user journeys, existing inventory & requirements.', styles['TableCell']), Paragraph('Stakeholder access & available drawings.', styles['TableCell']), Paragraph('Signed scope baseline.', styles['TableCell'])],
        [Paragraph('End Month 2', styles['TableCellBold']), Paragraph('Architecture, UX, data model, risk register, privacy decision.', styles['TableCell']), Paragraph('Legal, ICT, ops & data protection review.', styles['TableCell']), Paragraph('Approved design pack.', styles['TableCell'])],
        [Paragraph('End Month 4', styles['TableCellBold']), Paragraph('Core website, admin, ticket lifecycle & reporting in staging.', styles['TableCell']), Paragraph('Fixture rules, pricing & content approvals.', styles['TableCell']), Paragraph('Demo & test results.', styles['TableCell'])],
        [Paragraph('End Month 6', styles['TableCellBold']), Paragraph('Payment sandbox & device integrations; workforce beta.', styles['TableCell']), Paragraph('Provider credentials & vendor cooperation.', styles['TableCell']), Paragraph('Interface test report.', styles['TableCell'])],
        [Paragraph('End Month 7', styles['TableCellBold']), Paragraph('Pilot simulation, load/security/accessibility tests & training draft.', styles['TableCell']), Paragraph('Pilot users & representative test env.', styles['TableCell']), Paragraph('Defect log & risk sign-off.', styles['TableCell'])],
        [Paragraph('End Month 9', styles['TableCellBold']), Paragraph('Production readiness, support rota, recovery & rollback rehearsal.', styles['TableCell']), Paragraph('Production access & formal go-live window.', styles['TableCell']), Paragraph('Readiness checklist signed.', styles['TableCell'])],
        [Paragraph('Month 10+', styles['TableCellBold']), Paragraph('Go-live support, documentation, knowledge transfer & review.', styles['TableCell']), Paragraph('Named operators & support leads.', styles['TableCell']), Paragraph('Handover certificate.', styles['TableCell'])],
    ]
    s19_table = Table(s19_table_data, colWidths=[1.1 * inch, 2.0 * inch, 1.8 * inch, 1.6 * inch])
    s19_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), primary_color),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E0')),
        ('PADDING', (0,0), (-1,-1), 3),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, bg_light])
    ]))

    s20_body = [
        "A multi-tiered testing strategy guarantees platform reliability, speed, and security prior to public release."
    ]
    s20_table_data = [
        [Paragraph('<b>Test Stream</b>', styles['TableHeader']), Paragraph('<b>Scope of Testing</b>', styles['TableHeader']), Paragraph('<b>Exit Criteria / Evidence</b>', styles['TableHeader'])],
        [Paragraph('Functional', styles['TableCellBold']), Paragraph('Ticket lifecycle, pricing, refunds, user roles, event setup, edge cases.', styles['TableCell']), Paragraph('Passed agreed acceptance cases.', styles['TableCell'])],
        [Paragraph('Payment', styles['TableCellBold']), Paragraph('Pending/failed/success callbacks, duplicate callbacks, timeouts, reconciliation.', styles['TableCell']), Paragraph('Provider sandbox evidence & zero discrepancy.', styles['TableCell'])],
        [Paragraph('Load / Perf', styles['TableCellBold']), Paragraph('Peak ticket sales, concurrent sessions, gate validation load, database contention.', styles['TableCell']), Paragraph('Results against agreed workload profile.', styles['TableCell'])],
        [Paragraph('Security', styles['TableCellBold']), Paragraph('Authentication, authorisation, injection, dependencies, secrets, pen testing.', styles['TableCell']), Paragraph('Remediation of Critical/High findings.', styles['TableCell'])],
        [Paragraph('Accessibility', styles['TableCellBold']), Paragraph('Keyboard, screen reader, contrast, focus order, error messages, mobile layout.', styles['TableCell']), Paragraph('Accessibility report & fix log.', styles['TableCell'])],
        [Paragraph('Recovery', styles['TableCellBold']), Paragraph('Backup restore, outage simulation, offline procedure, data reconciliation.', styles['TableCell']), Paragraph('Successful recovery drill.', styles['TableCell'])],
        [Paragraph('Operational', styles['TableCellBold']), Paragraph('Staff roles, escalation, event simulation, support desk, manual exception workflow.', styles['TableCell']), Paragraph('Signed operational readiness review.', styles['TableCell'])],
    ]
    s20_table = Table(s20_table_data, colWidths=[1.3 * inch, 2.9 * inch, 2.3 * inch])
    s20_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), primary_color),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E0')),
        ('PADDING', (0,0), (-1,-1), 3),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, bg_light])
    ]))

    s21_body = [
        "Supplier Team Roles & Knowledge Transfer Deliverables:"
    ]
    s21_table_data = [
        [Paragraph('<b>Role</b>', styles['TableHeader']), Paragraph('<b>Indicative Involvement</b>', styles['TableHeader']), Paragraph('<b>Primary Governance Responsibility</b>', styles['TableHeader'])],
        [Paragraph('Project Manager', styles['TableCellBold']), Paragraph('Across all phases', styles['TableCell']), Paragraph('Schedule, risks, decisions, status and change control.', styles['TableCell'])],
        [Paragraph('Business Analyst', styles['TableCellBold']), Paragraph('Discovery and acceptance', styles['TableCell']), Paragraph('Requirements, workflows, user journeys and KPIs.', styles['TableCell'])],
        [Paragraph('Solution Architect', styles['TableCellBold']), Paragraph('Design through handover', styles['TableCell']), Paragraph('Architecture, interfaces, quality and technical decisions.', styles['TableCell'])],
        [Paragraph('Full-Stack Engineers', styles['TableCellBold']), Paragraph('Build and stabilisation', styles['TableCell']), Paragraph('Portal, APIs, data model and integrations.', styles['TableCell'])],
        [Paragraph('QA Engineer', styles['TableCellBold']), Paragraph('Build through acceptance', styles['TableCell']), Paragraph('Test plans, regression, performance and acceptance evidence.', styles['TableCell'])],
        [Paragraph('Security / Privacy', styles['TableCellBold']), Paragraph('Design gates and testing', styles['TableCell']), Paragraph('Threat model, privacy review, security tests and remediation.', styles['TableCell'])],
        [Paragraph('DevOps Engineer', styles['TableCellBold']), Paragraph('Environments through support', styles['TableCell']), Paragraph('Deployment, monitoring, backup, recovery and release controls.', styles['TableCell'])],
        [Paragraph('Training / Support Lead', styles['TableCellBold']), Paragraph('Pilot through handover', styles['TableCell']), Paragraph('Training, user manuals, helpdesk and knowledge transfer.', styles['TableCell'])],
    ]
    s21_table = Table(s21_table_data, colWidths=[1.6 * inch, 1.8 * inch, 3.1 * inch])
    s21_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), primary_color),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E0')),
        ('PADDING', (0,0), (-1,-1), 3),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, bg_light])
    ]))

    s22_body = [
        "The supplied proposal's KES 75,000,000 total is retained as a preliminary planning envelope for continuity. It has not been independently costed against a final bill of quantities, technical survey, vendor quotations, taxes or tender terms. It must not be represented as a binding price until the scope and exclusions are confirmed."
    ]
    s22_table_data = [
        [Paragraph('<b>No.</b>', styles['TableHeader']), Paragraph('<b>Work Package / Deliverable Module</b>', styles['TableHeader']), Paragraph('<b>Indicative KES</b>', styles['TableHeader']), Paragraph('<b>Cost Basis / Inclusions Note</b>', styles['TableHeader'])],
        [Paragraph('1', styles['TableCell']), Paragraph('Public ticketing website and mobile web', styles['TableCellBold']), Paragraph('18,500,000', styles['TableCellBold']), Paragraph('UX, booking workflow, admin, ticket wallet and payment interfaces.', styles['TableCell'])],
        [Paragraph('2', styles['TableCell']), Paragraph('Access validation and identity integration', styles['TableCellBold']), Paragraph('14,000,000', styles['TableCellBold']), Paragraph('Software and approved interfaces; hardware qty to confirm.', styles['TableCell'])],
        [Paragraph('3', styles['TableCell']), Paragraph('Staff / contractor accreditation', styles['TableCellBold']), Paragraph('8,500,000', styles['TableCellBold']), Paragraph('Profiles, roles, roster, attendance, expiry and reporting.', styles['TableCell'])],
        [Paragraph('4', styles['TableCell']), Paragraph('Command dashboard and audit analytics', styles['TableCellBold']), Paragraph('7,000,000', styles['TableCellBold']), Paragraph('Operational, gate, finance and exception dashboards.', styles['TableCell'])],
        [Paragraph('5', styles['TableCell']), Paragraph('Cybersecurity and privacy assurance', styles['TableCellBold']), Paragraph('4,500,000', styles['TableCellBold']), Paragraph('Assessment, test support and remediation allowance.', styles['TableCell'])],
        [Paragraph('6', styles['TableCell']), Paragraph('Device middleware and system interfaces', styles['TableCellBold']), Paragraph('9,500,000', styles['TableCellBold']), Paragraph('Depends on device models and interface documentation.', styles['TableCell'])],
        [Paragraph('7', styles['TableCell']), Paragraph('Training, documentation and knowledge transfer', styles['TableCellBold']), Paragraph('3,500,000', styles['TableCellBold']), Paragraph('Training sessions, manuals, administrator handover.', styles['TableCell'])],
        [Paragraph('<b>SUB</b>', styles['TableCellBold']), Paragraph('<b>Indicative Engineering Subtotal</b>', styles['TableCellBold']), Paragraph('<b>65,500,000</b>', styles['TableCellBold']), Paragraph('<b>Engineering, Software & Delivery Subtotal</b>', styles['TableCellBold'])],
        [Paragraph('8', styles['TableCell']), Paragraph('First-year hosting / support allowance', styles['TableCellBold']), Paragraph('9,500,000', styles['TableCellBold']), Paragraph('Cloud, monitoring, patching and event support assumptions.', styles['TableCell'])],
        [Paragraph('<b>TOT</b>', styles['TableCellBold']), Paragraph('<b>Indicative Total Planning Envelope</b>', styles['TableCellBold']), Paragraph('<b>75,000,000</b>', styles['TableCellBold']), Paragraph('<b>Preliminary Planning Envelope (Non-binding estimate)</b>', styles['TableCellBold'])],
    ]
    s22_table = Table(s22_table_data, colWidths=[0.4 * inch, 2.3 * inch, 1.3 * inch, 2.5 * inch])
    s22_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), primary_color),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E0')),
        ('PADDING', (0,0), (-1,-1), 3),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('BACKGROUND', (0,8), (-1,8), colors.HexColor('#E2E8F0')),
        ('BACKGROUND', (0,10), (-1,10), colors.HexColor('#FEFCBF')), # Highlight total
    ]))

    s23_body = [
        "A government-facing commercial offer separates one-off delivery costs from recurring service costs."
    ]
    s23_table_data = [
        [Paragraph('<b>Payment Milestone Trigger</b>', styles['TableHeader']), Paragraph('<b>Fee Share %</b>', styles['TableHeader']), Paragraph('<b>Acceptance Verification Deliverable</b>', styles['TableHeader'])],
        [Paragraph('Mobilisation / Approved Inception', styles['TableCellBold']), Paragraph('10%', styles['TableCellBold']), Paragraph('Contract, mobilisation plan, governance & approved inception pack.', styles['TableCell'])],
        [Paragraph('Requirements & Design Approval', styles['TableCellBold']), Paragraph('15%', styles['TableCellBold']), Paragraph('Signed requirements, architecture, risk & privacy decision pack.', styles['TableCell'])],
        [Paragraph('Core Platform Staging Release', styles['TableCellBold']), Paragraph('25%', styles['TableCellBold']), Paragraph('Demonstrable core modules and agreed staging test evidence.', styles['TableCell'])],
        [Paragraph('Integration & Pilot Acceptance', styles['TableCellBold']), Paragraph('20%', styles['TableCellBold']), Paragraph('Integration tests, pilot report and agreed remediation status.', styles['TableCell'])],
        [Paragraph('Production Readiness / Deployment', styles['TableCellBold']), Paragraph('20%', styles['TableCellBold']), Paragraph('Go-live checklist, security sign-off and operational rehearsal.', styles['TableCell'])],
        [Paragraph('Handover & Documentation', styles['TableCellBold']), Paragraph('10%', styles['TableCellBold']), Paragraph('Signed training, documentation, handover and support transition.', styles['TableCell'])],
    ]
    s23_table = Table(s23_table_data, colWidths=[2.2 * inch, 0.9 * inch, 3.4 * inch])
    s23_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), primary_color),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E0')),
        ('PADDING', (0,0), (-1,-1), 3),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, bg_light])
    ]))

    s24_body = [
        "Risk Register and Mitigation Matrix:"
    ]
    s24_table_data = [
        [Paragraph('<b>Risk Description</b>', styles['TableHeader']), Paragraph('<b>Likelihood / Impact</b>', styles['TableHeader']), Paragraph('<b>Proposed Mitigation Strategy</b>', styles['TableHeader']), Paragraph('<b>Owner</b>', styles['TableHeader'])],
        [Paragraph('Unclear existing interfaces', styles['TableCellBold']), Paragraph('Medium / High', styles['TableCell']), Paragraph('Site survey, vendor workshops, interface proof-of-concept, explicit exclusions.', styles['TableCell']), Paragraph('Client ICT / Lead', styles['TableCell'])],
        [Paragraph('Privacy / biometric challenge', styles['TableCellBold']), Paragraph('Medium / High', styles['TableCell']), Paragraph('Necessity test, legal review, DPIA where required, alternative entry.', styles['TableCell']), Paragraph('Client DPO / Legal', styles['TableCell'])],
        [Paragraph('Payment callback mismatch', styles['TableCellBold']), Paragraph('Medium / High', styles['TableCell']), Paragraph('Sandbox tests, idempotency, provider status checks, daily reconciliation.', styles['TableCell']), Paragraph('Finance Lead', styles['TableCell'])],
        [Paragraph('Connectivity / power outage', styles['TableCellBold']), Paragraph('Medium / High', styles['TableCell']), Paragraph('Tested offline procedure, power/network monitoring, recovery drill.', styles['TableCell']), Paragraph('Venue ICT / Ops', styles['TableCell'])],
        [Paragraph('Scope growth / cost overrun', styles['TableCellBold']), Paragraph('High / High', styles['TableCell']), Paragraph('Baseline scope, change requests, assumptions register, itemised pricing.', styles['TableCell']), Paragraph('Steering Committee', styles['TableCell'])],
        [Paragraph('User adoption issues', styles['TableCellBold']), Paragraph('Medium / Medium', styles['TableCell']), Paragraph('Usability tests, clear signage, staff training, support desk.', styles['TableCell']), Paragraph('Service Lead', styles['TableCell'])],
        [Paragraph('Vendor lock-in', styles['TableCellBold']), Paragraph('Medium / Medium', styles['TableCell']), Paragraph('Open interfaces, data export format, documentation, exit plan.', styles['TableCell']), Paragraph('Client Procurement', styles['TableCell'])],
        [Paragraph('Schedule conflict with events', styles['TableCellBold']), Paragraph('Medium / High', styles['TableCell']), Paragraph('Critical-path plan, event calendar, pilot windows, go/no-go gates.', styles['TableCell']), Paragraph('Project Manager', styles['TableCell'])],
    ]
    s24_table = Table(s24_table_data, colWidths=[1.6 * inch, 1.1 * inch, 2.6 * inch, 1.2 * inch])
    s24_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), primary_color),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E0')),
        ('PADDING', (0,0), (-1,-1), 3),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, bg_light])
    ]))

    s25_body = [
        "Governance Accountabilities & Final Submission Checklist:"
    ]
    s25_table_data = [
        [Paragraph('<b>Stakeholder Group</b>', styles['TableHeader']), Paragraph('<b>Primary Role & Governance Accountability</b>', styles['TableHeader'])],
        [Paragraph('Government / Venue Sponsor', styles['TableCellBold']), Paragraph('Scope, funding pathway, major decisions and formal acceptance authority.', styles['TableCell'])],
        [Paragraph('Venue Operations', styles['TableCellBold']), Paragraph('Matchday workflows, safety coordination, gate procedures and operational acceptance.', styles['TableCell'])],
        [Paragraph('ICT / Cybersecurity', styles['TableCellBold']), Paragraph('Architecture, hosting, interfaces, security assurance and continuity approval.', styles['TableCell'])],
        [Paragraph('Data Protection / Legal', styles['TableCellBold']), Paragraph('Lawful basis, privacy notices, DPIA decision, retention and biometric review.', styles['TableCell'])],
        [Paragraph('Finance / Internal Audit', styles['TableCellBold']), Paragraph('Reconciliation definitions, reporting and audit access.', styles['TableCell'])],
        [Paragraph('ST-Tech ICT Consultants (Supplier)', styles['TableCellBold']), Paragraph('Deliver, test, document, train and support approved scope under contract.', styles['TableCell'])],
    ]
    s25_table = Table(s25_table_data, colWidths=[2.0 * inch, 4.5 * inch])
    s25_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), primary_color),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E0')),
        ('PADDING', (0,0), (-1,-1), 3),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, bg_light])
    ]))
    s25_checklist = [
        "* Confirm actual recipient, tender reference, submission format, deadline and mandatory forms.",
        "* Verify current venue handover status and confirm site access and system inventory.",
        "* Obtain vendor quotes and validate taxes, hardware, licences, hosting, connectivity and support assumptions.",
        "* Attach genuine company registration, tax compliance, experience references, CVs and certifications.",
        "* Obtain qualified technical, legal, data-protection, cybersecurity and procurement review.",
        "* Verified public context sources: CRBC update dated 10 Feb 2026; Presidential inspection report dated 11 April 2025."
    ]

    s26_body = [
        "This annex turns the public-facing concept into a buildable information structure."
    ]
    s26_table_data = [
        [Paragraph('<b>Page / Area</b>', styles['TableHeader']), Paragraph('<b>Key Functional Features</b>', styles['TableHeader']), Paragraph('<b>Acceptance Verification Checks</b>', styles['TableHeader'])],
        [Paragraph('Home Page', styles['TableCellBold']), Paragraph('Official notices, fixtures, venue guide, ticket call-to-action, support status.', styles['TableCell']), Paragraph('Mobile layout, accessible headings, approved content.', styles['TableCell'])],
        [Paragraph('Events Page', styles['TableCellBold']), Paragraph('Search/filter events, date pickers, event status, ticket availability.', styles['TableCell']), Paragraph('Correct timezone, closed/sold-out states.', styles['TableCell'])],
        [Paragraph('Event Details', styles['TableCellBold']), Paragraph('Venue map, entry rules, category pricing, refund terms, accessibility.', styles['TableCell']), Paragraph('Terms visible before payment.', styles['TableCell'])],
        [Paragraph('Checkout', styles['TableCellBold']), Paragraph('Order summary, contact details, provider handoff, payment status, retry.', styles['TableCell']), Paragraph('No duplicate order or false paid status.', styles['TableCell'])],
        [Paragraph('Ticket Wallet', styles['TableCellBold']), Paragraph('Confirmed ticket, reference, resend/recovery, support link.', styles['TableCell']), Paragraph('Ticket privacy and revocation behaviour.', styles['TableCell'])],
        [Paragraph('Help / Policies', styles['TableCellBold']), Paragraph('FAQ, refunds, privacy notice, fraud warning, accessibility support.', styles['TableCell']), Paragraph('Contacts and policies approved.', styles['TableCell'])],
    ]
    s26_table = Table(s26_table_data, colWidths=[1.5 * inch, 2.7 * inch, 2.3 * inch])
    s26_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), primary_color),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E0')),
        ('PADDING', (0,0), (-1,-1), 3),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, bg_light])
    ]))

    s27_body = [
        "Seat maps shown are conceptual zones, not a surveyed seating plan. Production inventory must reflect approved seating charts.",
        "Inventory Rules to Implement:",
        "* Create event-specific inventory; never assume every physical seat is saleable for every event.",
        "* Represent seats, blocks, standing zones, accessible allocations, restricted seats and sponsor holds separately.",
        "* Use transactional locking or equivalent concurrency control to prevent overselling under high traffic.",
        "* Apply temporary holds only for a defined time and release expired holds automatically.",
        "* Record every manual allocation, price change, refund, complimentary ticket and inventory override in an audit trail.",
        "* Support staged releases of ticket allocations where approved, without exposing restricted inventory.",
        "* Offer a clear seat/zone description and accessible alternative when a section is unavailable."
    ]

    s28_body = [
        "API Design, Integration Contracts and Error Handling Specifications:"
    ]
    s28_table_data = [
        [Paragraph('<b>Interface Endpoint</b>', styles['TableHeader']), Paragraph('<b>Primary Purpose</b>', styles['TableHeader']), Paragraph('<b>Essential Security Safeguards</b>', styles['TableHeader'])],
        [Paragraph('Event API', styles['TableCellBold']), Paragraph('Read published events, categories, sale windows and venue notices.', styles['TableCell']), Paragraph('Role-based writes, validation, public caching.', styles['TableCell'])],
        [Paragraph('Order API', styles['TableCellBold']), Paragraph('Create order, reserve inventory, query order status, cancel draft.', styles['TableCell']), Paragraph('Idempotency keys, expiry and concurrency locks.', styles['TableCell'])],
        [Paragraph('Payment Adapter', styles['TableCellBold']), Paragraph('Initiate approved provider flow and receive status callbacks.', styles['TableCell']), Paragraph('Signature check, authentication, retries, reconciliation.', styles['TableCell'])],
        [Paragraph('Validation API', styles['TableCellBold']), Paragraph('Check ticket validity and record gate entry result.', styles['TableCell']), Paragraph('Replay protection, device auth, rate limits.', styles['TableCell'])],
        [Paragraph('Workforce API', styles['TableCellBold']), Paragraph('Read approved roster and credential permissions.', styles['TableCell']), Paragraph('Minimal data, permission checks and expiry.', styles['TableCell'])],
        [Paragraph('Reporting API', styles['TableCellBold']), Paragraph('Provide approved event, finance and operations reports.', styles['TableCell']), Paragraph('Export authorisation, filtering and audit trail.', styles['TableCell'])],
    ]
    s28_table = Table(s28_table_data, colWidths=[1.5 * inch, 2.7 * inch, 2.3 * inch])
    s28_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), primary_color),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E0')),
        ('PADDING', (0,0), (-1,-1), 3),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, bg_light])
    ]))

    s29_body = [
        "Database Architecture, Audit Trail and Data Lifecycle:"
    ]
    s29_table_data = [
        [Paragraph('<b>Data Group</b>', styles['TableHeader']), Paragraph('<b>Examples</b>', styles['TableHeader']), Paragraph('<b>Lifecycle & Protection Standard</b>', styles['TableHeader'])],
        [Paragraph('Operational', styles['TableCellBold']), Paragraph('Events, ticket categories, orders, validation records, staff assignments.', styles['TableCell']), Paragraph('Retention by approved operational and legal schedule.', styles['TableCell'])],
        [Paragraph('Payment References', styles['TableCellBold']), Paragraph('Provider transaction IDs, amount, currency, state, outcome.', styles['TableCell']), Paragraph('Do not store unnecessary payment credentials.', styles['TableCell'])],
        [Paragraph('Identity / Contact', styles['TableCellBold']), Paragraph('Account identifier, contact details and preferences.', styles['TableCell']), Paragraph('Purpose limitation, access controls, deletion process.', styles['TableCell'])],
        [Paragraph('Security Audit', styles['TableCellBold']), Paragraph('Administrator action, actor, timestamp, object, result.', styles['TableCell']), Paragraph('Restricted write access, monitored integrity, retention.', styles['TableCell'])],
        [Paragraph('Sensitive / Biometric', styles['TableCellBold']), Paragraph('Only if separately approved and strictly necessary.', styles['TableCell']), Paragraph('Separate legal gate, minimal retention, access logging.', styles['TableCell'])],
    ]
    s29_table = Table(s29_table_data, colWidths=[1.5 * inch, 2.7 * inch, 2.3 * inch])
    s29_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), primary_color),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E0')),
        ('PADDING', (0,0), (-1,-1), 3),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, bg_light])
    ]))

    s30_body = [
        "Proposed Deployment Workflow:",
        "* Commit code to source control with mandatory peer review and branch protections.",
        "* Run automated unit, integration, lint, dependency and secret-scanning checks in CI/CD pipeline.",
        "* Build versioned release container artefact and record provenance.",
        "* Deploy to staging; run automated acceptance tests against representative dataset.",
        "* Approve production change with rollback and database migration plan.",
        "* Deploy gradually where possible; verify health checks, payment callbacks and ticket validation.",
        "* Monitor errors and latency; rollback or disable feature if anomalies detected.",
        "Environment Rules: Production credentials must be stored in a managed secret vault, never in source code. Development, staging, training, and production environments are logically isolated."
    ]

    s31_body = [
        "Event-Day Operations and Command-Centre Runbook:"
    ]
    s31_table_data = [
        [Paragraph('<b>Timing Phase</b>', styles['TableHeader']), Paragraph('<b>Operational Action Required</b>', styles['TableHeader']), Paragraph('<b>Responsible Owner / Evidence</b>', styles['TableHeader'])],
        [Paragraph('Before Event', styles['TableCellBold']), Paragraph('Confirm event config, categories, approved roster, scanner health, network/power, support contacts.', styles['TableCell']), Paragraph('Event lead signs readiness checklist.', styles['TableCell'])],
        [Paragraph('Gate Opening', styles['TableCellBold']), Paragraph('Verify sample tickets, watch rejects and device heartbeat, confirm supervisor escalation route.', styles['TableCell']), Paragraph('Gate supervisor records checks.', styles['TableCell'])],
        [Paragraph('During Event', styles['TableCellBold']), Paragraph('Monitor queues, incidents, system health, payment and customer support escalations.', styles['TableCell']), Paragraph('Command lead tracks incidents.', styles['TableCell'])],
        [Paragraph('After Event', styles['TableCellBold']), Paragraph('Close sales as approved, export attendance/finance reports, reconcile exceptions, secure devices.', styles['TableCell']), Paragraph('Operations and finance sign closeout.', styles['TableCell'])],
        [Paragraph('Post-Event Review', styles['TableCellBold']), Paragraph('Review defects, customer complaints, gate throughput, outages, and corrective action log.', styles['TableCell']), Paragraph('Lessons-learned action log.', styles['TableCell'])],
    ]
    s31_table = Table(s31_table_data, colWidths=[1.4 * inch, 2.9 * inch, 2.2 * inch])
    s31_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), primary_color),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E0')),
        ('PADDING', (0,0), (-1,-1), 3),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, bg_light])
    ]))

    s32_body = [
        "Capacity must be engineered from an agreed demand model, not headline stadium seating numbers."
    ]
    s32_table_data = [
        [Paragraph('<b>Workload Stream</b>', styles['TableHeader']), Paragraph('<b>What to Model & Stress Test</b>', styles['TableHeader']), Paragraph('<b>Evidence Required</b>', styles['TableHeader'])],
        [Paragraph('Ticket Release', styles['TableCellBold']), Paragraph('Concurrent sessions, seat/zone contention, cart holds and checkout conversion.', styles['TableCell']), Paragraph('Load-test report with assumptions.', styles['TableCell'])],
        [Paragraph('Payment Callbacks', styles['TableCellBold']), Paragraph('Provider latency, callback retries, status queries and queue backlog.', styles['TableCell']), Paragraph('Duplicate/delayed callback scenarios.', styles['TableCell'])],
        [Paragraph('Gate Validation', styles['TableCellBold']), Paragraph('Peak scan rate per lane, offline behaviour and sync after outage.', styles['TableCell']), Paragraph('Representative device and network test.', styles['TableCell'])],
        [Paragraph('Reports & Dashboards', styles['TableCellBold']), Paragraph('Concurrent dashboard refreshes, exports and large event history queries.', styles['TableCell']), Paragraph('Query performance and access tests.', styles['TableCell'])],
        [Paragraph('System Recovery', styles['TableCellBold']), Paragraph('Restore duration, data recovery point and failover behaviour.', styles['TableCell']), Paragraph('Observed restore/failover exercise.', styles['TableCell'])],
    ]
    s32_table = Table(s32_table_data, colWidths=[1.5 * inch, 2.7 * inch, 2.3 * inch])
    s32_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), primary_color),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E0')),
        ('PADDING', (0,0), (-1,-1), 3),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, bg_light])
    ]))

    s33_body = [
        "Training Streams and Warranty Support Framework:"
    ]
    s33_table_data = [
        [Paragraph('<b>Training Stream</b>', styles['TableHeader']), Paragraph('<b>Target Audience</b>', styles['TableHeader']), Paragraph('<b>Core Topics Covered</b>', styles['TableHeader']), Paragraph('<b>Proof of Readiness</b>', styles['TableHeader'])],
        [Paragraph('Event Administrators', styles['TableCellBold']), Paragraph('Event Admins', styles['TableCell']), Paragraph('Event setup, categories, sale windows, notices, approvals.', styles['TableCell']), Paragraph('Practical event setup exercise.', styles['TableCell'])],
        [Paragraph('Gate Supervisors', styles['TableCellBold']), Paragraph('Supervisors / Stewards', styles['TableCell']), Paragraph('Scanner workflow, exceptions, offline procedure, escalation.', styles['TableCell']), Paragraph('Simulated gate scenario.', styles['TableCell'])],
        [Paragraph('Finance / Audit', styles['TableCellBold']), Paragraph('Finance Officers', styles['TableCell']), Paragraph('Settlement reconciliation, refunds, exports, audit trail.', styles['TableCell']), Paragraph('Sample event reconciliation signed.', styles['TableCell'])],
        [Paragraph('ICT / Security', styles['TableCellBold']), Paragraph('IT & Security Staff', styles['TableCell']), Paragraph('Monitoring, access reviews, releases, backup/restore, incidents.', styles['TableCell']), Paragraph('Recovery and incident drill.', styles['TableCell'])],
        [Paragraph('Helpdesk', styles['TableCellBold']), Paragraph('Support Agents', styles['TableCell']), Paragraph('Ticket recovery, customer comms, escalation, verification.', styles['TableCell']), Paragraph('Role-played support cases.', styles['TableCell'])],
    ]
    s33_table = Table(s33_table_data, colWidths=[1.3 * inch, 1.2 * inch, 2.4 * inch, 1.6 * inch])
    s33_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), primary_color),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E0')),
        ('PADDING', (0,0), (-1,-1), 3),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, bg_light])
    ]))

    s34_body = [
        "Procurement Evaluation Matrix and Acceptance Controls:"
    ]
    s34_table_data = [
        [Paragraph('<b>Evaluation Area</b>', styles['TableHeader']), Paragraph('<b>Evidence Required to Prepare</b>', styles['TableHeader']), Paragraph('<b>Responsible Owner</b>', styles['TableHeader'])],
        [Paragraph('Technical Compliance', styles['TableCellBold']), Paragraph('Requirement-by-requirement response, architecture, security, accessibility, integrations.', styles['TableCell']), Paragraph('Technical Lead', styles['TableCell'])],
        [Paragraph('Delivery Capacity', styles['TableCellBold']), Paragraph('Named CVs, realistic schedule, project governance and resource plan.', styles['TableCell']), Paragraph('Bid Manager', styles['TableCell'])],
        [Paragraph('Relevant Experience', styles['TableCellBold']), Paragraph('Verifiable references, signed completion certificates, client contacts where permitted.', styles['TableCell']), Paragraph('Authorised Representative', styles['TableCell'])],
        [Paragraph('Financial Offer', styles['TableCellBold']), Paragraph('Itemised pricing, taxes, recurring fees, assumptions, exclusions, payment terms.', styles['TableCell']), Paragraph('Finance Lead', styles['TableCell'])],
        [Paragraph('Legal / Eligibility', styles['TableCellBold']), Paragraph('Registration, tax status, declarations and other documents explicitly requested by tender.', styles['TableCell']), Paragraph('Compliance Lead', styles['TableCell'])],
        [Paragraph('Implementation Assurance', styles['TableCellBold']), Paragraph('Testing plan, privacy decision, support plan, acceptance gates, risk register.', styles['TableCell']), Paragraph('Delivery Lead', styles['TableCell'])],
    ]
    s34_table = Table(s34_table_data, colWidths=[1.6 * inch, 3.4 * inch, 1.5 * inch])
    s34_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), primary_color),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E0')),
        ('PADDING', (0,0), (-1,-1), 3),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, bg_light])
    ]))

    s35_body = [
        "What the proposed system is intended to provide:",
        "* An official, mobile-friendly event and ticketing website with clear prices and terms.",
        "* Secure order and payment-state handling with reconciliation and support workflows.",
        "* Ticket validation and authorised staff accreditation, with tested exception procedures.",
        "* Role-based operational, gate-health, workforce and financial dashboards.",
        "* Documented cybersecurity, privacy, backup, incident, release and support controls.",
        "* Training, manuals, source/configuration documentation and a planned handover.",
        "* A modular foundation that can be extended only through approved scope and change control.",
        "Assumptions that must be confirmed:",
        "* The client will identify the authorised sponsor, operator, product owner and acceptance authority.",
        "* Current venue handover, site access, equipment inventory and existing vendor interfaces will be confirmed.",
        "* The client will provide approved event rules, ticket policies, price rules and content.",
        "* Payment providers, messaging providers, hosting arrangements and third-party costs will be selected and priced.",
        "* Any biometric processing remains out of scope unless separately justified, approved, priced and contracted.",
        "* The KES 75 million planning envelope and 10-month timeline are indicative, not binding commitments.",
        "Recommended immediate next steps: 1. Confirm legal proposer and procurement route. 2. Obtain official tender requirements. 3. Run a discovery/site survey. 4. Verify vendor and payment interfaces. 5. Complete technical, legal, privacy and security reviews. 6. Produce a priced bill of quantities and compliance matrix. 7. Submit only verified documents and evidence."
    ]

    # Build Story
    story = []

    # Cover Page (Page 1)
    story.append(Spacer(1, 0.2 * inch))
    story.append(Paragraph('REPUBLIC OF KENYA', styles['CoverCountry']))
    story.append(Paragraph('MINISTRY OF SPORTS', styles['CoverMinistry']))
    story.append(HRFlowable(width="65%", thickness=1.5, color=accent_color, spaceAfter=20, spaceBefore=0))
    story.append(Paragraph('TALANTA STADIUM SMART INFRASTRUCTURE SYSTEM', styles['CoverTitle']))
    story.append(Paragraph('Integrated Digital Ticketing | Biometric Access Control<br/>Venue & Workforce Management | Real-time Operations', styles['CoverSubTitle']))
    story.append(Paragraph('— "A Smarter Stadium. A Safer Nation." —', styles['CoverMotto']))
    story.append(Spacer(1, 0.3 * inch))

    cover_meta_data = [
        [Paragraph('<b>DOCUMENT TYPE:</b>', styles['TableCellBold']), Paragraph('Government-Focused Technical & Financial Proposal', styles['TableCell'])],
        [Paragraph('<b>PROPOSING ENTITY:</b>', styles['TableCellBold']), Paragraph('ST-Tech ICT Consultants', styles['TableCell'])],
        [Paragraph('<b>TARGET VENUE:</b>', styles['TableCellBold']), Paragraph('Talanta Sports City / Talanta Stadium (60,000 Capacity), Nairobi, Kenya', styles['TableCell'])],
        [Paragraph('<b>PROPOSED CLIENT:</b>', styles['TableCellBold']), Paragraph('Ministry of Sports / Relevant Government Stadium Operating Authority', styles['TableCell'])],
        [Paragraph('<b>INDICATIVE BUDGET:</b>', styles['TableCellBold']), Paragraph('KES 75,000,000 preliminary planning envelope (subject to scope validation)', styles['TableCell'])],
        [Paragraph('<b>TIMELINE:</b>', styles['TableCellBold']), Paragraph('Indicative 10-month delivery roadmap post-contract execution', styles['TableCell'])],
        [Paragraph('<b>REFERENCE BASIS:</b>', styles['TableCellBold']), Paragraph('Presidential Directive / Public Procurement Framework Context', styles['TableCell'])],
    ]
    meta_table = Table(cover_meta_data, colWidths=[2.1 * inch, 4.4 * inch])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), bg_light),
        ('BOX', (0,0), (-1,-1), 1, secondary_color),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
        ('PADDING', (0,0), (-1,-1), 6),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(meta_table)
    story.append(PageBreak())

    # TOC 1 (Page 2)
    story.append(Paragraph('Table of Contents — Core Proposal (Pages 4–28)', styles['SecHeading']))
    story.append(HRFlowable(width="100%", thickness=1, color=primary_color, spaceAfter=8, spaceBefore=0))
    story.append(t_toc1)
    story.append(PageBreak())

    # TOC 2 (Page 3)
    story.append(Paragraph('Table of Contents — Technical Annex (Pages 29–38)', styles['SecHeading']))
    story.append(HRFlowable(width="100%", thickness=1, color=primary_color, spaceAfter=8, spaceBefore=0))
    story.append(t_toc2)
    story.append(Spacer(1, 15))
    story.append(Paragraph('<b>DOCUMENT NAVIGATION GUIDANCE:</b><br/>This proposal is organized into 35 numbered sections across a 38-page structure. Pages 4 through 28 deliver the core technical and financial proposal, while Pages 29 through 38 contain the Technical Annex with buildable engineering blueprints, API contracts, data lifecycles, and procurement matrices.', styles['BodyTextCustom']))
    story.append(PageBreak())

    # Core Sections (Pages 4 to 28)
    story.extend(make_page_section("Proposal Overview and Commercial Basis", "1", s1_body, "Prepared as an expanded concept proposal. No formal government endorsement, contract award, construction partnership, or live system deployment is implied. All technical scope, financial figures, integration interfaces, and performance statements remain subject to formal site survey, client verification, and public procurement procedures."))
    story.extend(make_page_section("Document Control, Purpose and How to Use This Proposal", "2", s2_body, "All visual mockups, architectural diagrams, and flowcharts presented in this document are illustrative concepts created to communicate system layout and functional relationships. They do not represent installed hardware, active software instances, or pre-approved branding."))
    story.extend(make_page_section("Executive Summary", "3", s3_body))
    story.extend(make_page_section("Public-Sector Case and Strategic Alignment", "4", s4_body, "System performance improvements and risk reductions must be measured against verified venue baseline metrics established during the Discovery Phase.", s4_table))
    story.extend(make_page_section("Venue Context, Construction Background and Boundaries", "5", s5_body))
    story.extend(make_page_section("Scope of Work and Deliverables", "6", s6_body, "Turnstile barriers, optical cameras, network cabling, power UPS systems, SMS telecom charges, and payment gateway fees require separate commercial confirmation.", s6_table))
    story.extend(make_page_section("Public Website and Mobile Experience", "7", s7_body))
    story.extend(make_page_section("Ticketing and Payment Workflow", "8", s8_body, "A user should never receive a confirmed ticket solely because a browser displayed a success screen; the backend must verify the provider callback or status before confirming the order.", s8_table))
    story.extend(make_page_section("High-Level System Architecture", "9", s9_body))
    story.extend(make_page_section("Detailed Architecture, Data Flow and Environments", "10", s10_body, "Deployments are segregated into Development, Staging/Test, Production, and Training environments. Secrets must never be committed to source code.", s10_table))
    story.extend(make_page_section("Core Data Model and System Entities", "11", s11_body, "Do not collect a data field merely because it may be useful later. Define the purpose, lawful basis, access roles, retention period, deletion procedure, and breach response for each category.", s11_table))
    story.extend(make_page_section("Gate Access, Ticket Validation and Crowd Operations", "12", s12_body, "Digital access control systems strictly serve venue operations and must NEVER impair physical emergency egress. All turnstiles and gates must incorporate hardware-level fail-safe mechanical overrides compliant with national safety standards."))
    story.extend(make_page_section("Identity Verification and Optional Biometrics", "13", s13_body, "No performance figures in this proposal should be treated as a vendor-certified biometric guarantee. Any accuracy or speed target must be specified, independently tested in representative conditions, and contractually defined before deployment."))
    story.extend(make_page_section("Staff, Contractor and Accreditation Management", "14", s14_body, "The platform assists—does not unilaterally determine—employment, payroll, police clearance, or medical decisions.", s14_table))
    story.extend(make_page_section("Command Centre, Dashboards and Reporting", "15", s15_body, "Reporting principles require displaying timestamps, separating confirmed counts from estimates, and enforcing export controls for sensitive identity data.", s15_table))
    story.extend(make_page_section("Cybersecurity, Privacy and Compliance Plan", "16", s16_body, "The project is evaluated against Kenya Data Protection Act 2019, ISO/IEC 27001, and PCI DSS. Compliance certifications are claimed only where scope and independent evidence support them.", s16_table))
    story.extend(make_page_section("Hosting, Availability, Disaster Recovery and Support", "17", s17_body, "Service level framework includes defined response targets for Critical incidents, High incidents, Routine requests, and Planned maintenance.", s17_table))
    story.extend(make_page_section("Implementation Roadmap and Duration by Part", "18", s18_body, "Indicative elapsed duration is approximately 10 months. Schedule contingency is required for procurement, device lead times, and venue readiness.", s18_table))
    story.extend(make_page_section("Milestones, Dependencies and Acceptance Gates", "19", s19_body, "Critical dependencies include tender contract execution, venue site access, payment provider onboarding, hardware vendor cooperation, and safety review sign-offs.", s19_table))
    story.extend(make_page_section("Testing, Quality Assurance and Go-Live Readiness", "20", s20_body, "Go-live conditions require zero unresolved critical security issues, verified payment reconciliation, accepted operational runbooks, and formal venue operator sign-off.", s20_table))
    story.extend(make_page_section("Project Team, Responsibilities and Knowledge Transfer", "21", s21_body, "Essential client-side roles include Product Owner, Operations Lead, Finance Lead, ICT/Security Lead, DPO, and Procurement Representative.", s21_table))
    story.extend(make_page_section("Detailed Indicative Budget and Cost Basis", "22", s22_body, "The table does not confirm that turnstiles, cameras, switches, cabling, civil works, SMS fees, payment gateway fees, taxes, or third-party licences are included. The final offer must explicitly state each inclusion and exclusion.", s22_table))
    story.extend(make_page_section("Commercial Model, Payment Milestones and Total Cost of Ownership", "23", s23_body, "Total Cost of Ownership (TCO) items to price separately include annual hosting, payment provider transaction fees, SMS delivery, hardware maintenance, security re-testing, and event-day support coverage.", s23_table))
    story.extend(make_page_section("Benefits Measurement, Risk Register and Mitigation", "24", s24_body, "Monthly benefit measurement tracks financial reconciliation, checkout completion rate, median validation speed, system uptime, and roster compliance.", s24_table))
    story.extend(make_page_section("Governance, Acceptance, Sources and Final Submission Checklist", "25", s25_body + s25_checklist, None, s25_table))

    # Technical Annex (Pages 29 to 38)
    story.extend(make_page_section("Detailed Public Website Sitemap and User Journeys", "26", s26_body, None, s26_table))
    story.extend(make_page_section("Seat Mapping, Ticket Categories and Inventory Rules", "27", s27_body, "High-impact changes to event sale windows or pricing require dual-approver administrative authorization."))
    story.extend(make_page_section("API Design, Integration Contracts and Error Handling", "28", s28_body, "Failure patterns planned for include duplicate provider callbacks, slow payment gateway retries, offline scanner operation, and degraded external services.", s28_table))
    story.extend(make_page_section("Database, Audit Trail and Data Lifecycle", "29", s29_body, "Database operational controls require tracked schema migrations, encrypted backups, separation of prod/dev environments, and transactional inventory locks.", s29_table))
    story.extend(make_page_section("Hosting, DevSecOps and Deployment Controls", "30", s30_body))
    story.extend(make_page_section("Event-Day Operations and Command-Centre Runbook", "31", s31_body, "The platform supports the event command structure; it does not replace emergency plans, safety officers, police, medical teams or venue life-safety systems.", s31_table))
    story.extend(make_page_section("Load Planning, Performance Targets and Capacity Validation", "32", s32_body, "Discovery phase targets to agree include peak sales load profiles, max acceptable API response latency, RTO/RPO objectives, and monitoring alert thresholds.", s32_table))
    story.extend(make_page_section("Training, Service Desk and Warranty Framework", "33", s33_body, "Support model includes defined contract hours, ticketed severity escalation, known-error database maintenance, and a 12-month defect warranty.", s33_table))
    story.extend(make_page_section("Procurement Evaluation, Acceptance Matrix and Change Control", "34", s34_body, "Material change requests must log reason, options, cost/schedule impact, risk impact, and formal client approval before execution.", s34_table))
    story.extend(make_page_section("Final Technical Commitments, Assumptions and Next Actions", "35", s35_body, "A successful stadium digital platform is more than a website: it is a tested operating service with accountable ownership, transparent finance, resilient gate operations, and clear governance.", None, is_last=True))

    # Build Document
    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"PDF successfully built: {output_filename}")

if __name__ == '__main__':
    downloads_pdf = r'C:\Users\stephen\Downloads\Talanta_Stadium_Proposal_Professional_Enhanced.pdf'
    local_pdf = r'C:\Users\stephen\Desktop\SSP IO\Talanta_Stadium_Proposal_Professional_Enhanced.pdf'

    create_proposal_pdf(local_pdf)
    create_proposal_pdf(downloads_pdf)
