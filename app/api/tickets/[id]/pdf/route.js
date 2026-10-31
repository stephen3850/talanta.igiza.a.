import { NextResponse } from 'next/server';
import { initialOrders } from '../../../../../lib/mockData';
import { authorizeRole } from '../../../../../lib/auth';
import { prisma } from '../../../../../lib/prisma';

export async function GET(req, { params }) {
  const auth = authorizeRole(req, ['CUSTOMER', 'SYSTEM_ADMIN', 'VENUE_MANAGER', 'FINANCE_OFFICER']);
  if (!auth.authorized) return NextResponse.json({ success: false, message: 'Authentication required.' }, { status: auth.status });
  const { id } = await params;
  const isStaff = auth.user.role !== 'CUSTOMER';
  let ticket;
  let eventTitle;
  let categoryName;
  let bookingRef;
  let receipt;
  let userName;
  if (process.env.DATABASE_URL && prisma?.ticket) {
    const record = await prisma.ticket.findFirst({
      where: { ticketNumber: id, ...(isStaff ? {} : { userId: auth.user.id }) },
      include: { event: { select: { title: true } }, category: { select: { categoryName: true } }, booking: { select: { bookingRef: true, mpesaReceipt: true } }, user: { select: { fullName: true } } },
    });
    if (!record) return NextResponse.json({ success: false, message: 'Ticket not found.' }, { status: 404 });
    ticket = record;
    eventTitle = record.event.title;
    categoryName = record.category.categoryName;
    bookingRef = record.booking?.bookingRef;
    receipt = record.booking?.mpesaReceipt;
    userName = isStaff ? record.user.fullName : auth.user.fullName;
  } else if (process.env.NODE_ENV === 'development' && auth.user.isDemo) {
    const order = initialOrders.find((item) => item.userEmail === auth.user.email && item.tickets.some((entry) => entry.ticketNumber === id));
    ticket = order?.tickets.find((entry) => entry.ticketNumber === id);
    if (ticket) {
      eventTitle = order.eventTitle;
      categoryName = order.categoryName;
      bookingRef = order.bookingRef || order.orderRef;
      receipt = order.mpesaReceipt;
      userName = auth.user.fullName;
    }
  } else {
    return NextResponse.json({ success: false, message: 'Ticket service is unavailable.' }, { status: 503 });
  }
  if (!ticket) return NextResponse.json({ success: false, message: 'Ticket not found.' }, { status: 404 });

  const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[character]));
  const safeTicketNumber = escapeHtml(ticket.ticketNumber);
  const filenameTicketNumber = String(ticket.ticketNumber).replace(/[^A-Za-z0-9_-]/g, '_');

  const pdfHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Talanta Stadium Printable Ticket - ${safeTicketNumber}</title>
  <style>
    body { font-family: 'Segoe UI', Helvetica, Arial, sans-serif; background: #060B1E; color: #ffffff; margin: 0; padding: 40px; }
    .ticket-card { max-width: 650px; margin: 0 auto; background: #0B132B; border: 2px solid #10B981; border-radius: 20px; padding: 30px; box-shadow: 0 20px 40px rgba(0,0,0,0.5); }
    .header { text-align: center; border-bottom: 1px solid #1e293b; padding-bottom: 20px; margin-bottom: 20px; }
    .badge { background: #10B981; color: #060B1E; font-weight: bold; padding: 4px 12px; border-radius: 12px; font-size: 11px; text-transform: uppercase; }
    .title { font-size: 22px; font-weight: 800; color: #ffffff; margin: 15px 0 5px 0; }
    .subtitle { font-size: 12px; color: #94a3b8; }
    .qr-container { text-align: center; background: #ffffff; padding: 20px; border-radius: 16px; margin: 20px auto; width: 180px; }
    .ticket-ref { font-family: monospace; font-size: 16px; font-weight: bold; color: #10B981; text-align: center; margin-top: 10px; }
    .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; background: #060B1E; padding: 15px; border-radius: 12px; border: 1px solid #1e293b; font-size: 12px; }
    .detail-label { color: #64748b; font-size: 10px; text-transform: uppercase; }
    .detail-val { font-weight: bold; color: #ffffff; }
    .footer-rules { font-size: 10px; color: #64748b; margin-top: 20px; line-height: 1.5; text-align: center; }
    @media print {
      body { background: #ffffff; color: #000000; }
      .ticket-card { border-color: #000000; background: #ffffff; color: #000000; }
      .details-grid { background: #f8fafc; color: #000000; border-color: #cbd5e1; }
      .detail-val { color: #000000; }
    }
  </style>
</head>
<body>
  <div class="ticket-card">
    <div class="header">
      <span class="badge">TALANTA STADIUM • PRINTABLE TICKET</span>
      <div class="title">${escapeHtml(eventTitle)}</div>
      <div class="subtitle">Present this credential to an authorized gate operator for verification.</div>
    </div>

    <div class="qr-container">
      <div style="font-size:12px;color:#0B132B">QR barcode rendering is not configured; verify the signed credential in the secure ticket wallet.</div>
    </div>

    <div class="ticket-ref">${safeTicketNumber}</div>
    <div style="text-align: center; font-size: 11px; color: #94a3b8; margin-bottom: 20px;">
      Seat: <strong>${escapeHtml(ticket.seatNumber || 'Not assigned')}</strong>
    </div>

    <div class="details-grid">
      <div>
        <div class="detail-label">Booking Reference</div>
        <div class="detail-val">${escapeHtml(bookingRef)}</div>
      </div>
      <div>
        <div class="detail-label">M-PESA Receipt</div>
        <div class="detail-val">${escapeHtml(receipt || 'Not available')}</div>
      </div>
      <div>
        <div class="detail-label">Category</div>
        <div class="detail-val">${escapeHtml(categoryName)}</div>
      </div>
      <div>
        <div class="detail-label">Ticket Holder</div>
        <div class="detail-val">${escapeHtml(userName)}</div>
      </div>
    </div>

    <div class="footer-rules">
      <strong>Important:</strong><br>
      This printable view does not contain a scannable QR barcode and is not proof of admission. Present your secure wallet credential for validation.
    </div>
  </div>

  <script>
    window.onload = function() {
      // Auto-trigger print dialog for PDF conversion
      window.print();
    };
  </script>
</body>
</html>
  `;

  return new NextResponse(pdfHtml, {
    headers: {
      'Content-Type': 'text/html',
      'Content-Disposition': `inline; filename="Talanta_Stadium_Ticket_${filenameTicketNumber}.html"`,
    },
  });
}
