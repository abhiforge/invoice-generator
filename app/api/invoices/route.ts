import { NextResponse } from 'next/server';
import { query, initDb } from '@/lib/db';

// Ensure DB is ready on first load (naive approach for MVP)
initDb().catch(console.error);

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { sellerDetails, clientDetails, invoiceDetails, items, totalAmount } = body;

        const sql = `
      INSERT INTO invoices (
        invoice_no, date, billing_period, terms, 
        seller_details, client_details, items, total_amount
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;

        const values = [
            invoiceDetails.invoiceNo,
            invoiceDetails.date,
            invoiceDetails.billingPeriod,
            invoiceDetails.terms,
            JSON.stringify(sellerDetails),
            JSON.stringify(clientDetails),
            JSON.stringify(items),
            totalAmount
        ];

        const result = await query(sql, values);

        return NextResponse.json({ success: true, data: result.rows[0] }, { status: 201 });
    } catch (error: any) {
        console.error('Database Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function GET() {
    try {
        const result = await query('SELECT * FROM invoices ORDER BY created_at DESC');
        return NextResponse.json({ success: true, data: result.rows }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
