"use client";

import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Trash2, Plus, Download, Save, Building2, User2, ReceiptText, Landmark } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface LineItem {
    description: string;
    uom: string;
    qty: number;
    unitPrice: number;
    amount: number;
}

export default function InvoiceForm() {
    const [seller, setSeller] = useState({
        name: 'MAKSUDAN SINGH & ABHISHEK KUMAR',
        address: '222, Hawai Nagar, Road No. 5, Khunti Road,\nBirsa Chowk, Ranchi, Jharkhand - 834003',
        phone: '9955159071',
        pan: 'BJIPS6351J',
        email: 'abhiexo@gmail.com',
        logoBase64: '',
        supportPhone: '9955159071',
        supportEmail: 'abhiexo@gmail.com',
    });

    const [client, setClient] = useState({
        name: 'M/s MYRA SALONS/Geetanjali Salons',
        address: 'Shop No 215-220, FF block B, Indirapuram Habitat Centre (IHC)\nPlot no. 16 Ahinsa Khand\nIndirapuram Ghaziabad UP-201014',
        gstin: '09ABCFM2079G2Z6',
        state: 'UTTAR PRADESH',
    });

    const [invoice, setInvoice] = useState({
        number: 'MSA/25-26/01',
        date: '2026-01-31',
        billingPeriod: '1.1.2026 to 31.1.2026',
        terms: 'Due upon receipt',
        noOfDays: '31',
        monthDays: '31',
    });

    const [items, setItems] = useState<LineItem[]>([
        { description: 'Lease Rent', uom: 'SFT.', qty: 643.18, unitPrice: 152.09, amount: 0 },
    ]);

    const [bank, setBank] = useState({
        beneficiary: 'MAKSUDAN SINGH / ABHISHEK KUMAR',
        bankName: 'Canara Bank, Birsa Chowk Branch, Ranchi',
        accountNo: '5362101001525, IFSC Code: CNRB0005362',
    });

    useEffect(() => {
        const newItems = items.map(item => ({
            ...item,
            amount: parseFloat((item.qty * item.unitPrice).toFixed(2))
        }));

        const isChanged = newItems.some((item, index) => item.amount !== items[index].amount);
        if (isChanged) {
            setItems(newItems);
        }
    }, [items]);

    const subTotal = items.reduce((acc, item) => acc + item.amount, 0);
    const total = subTotal;

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setSeller({ ...seller, logoBase64: reader.result as string });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleItemChange = (index: number, field: keyof LineItem, value: string | number) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], [field]: value };
        setItems(newItems);
    };

    const addItem = () => {
        setItems([...items, { description: '', uom: '', qty: 0, unitPrice: 0, amount: 0 }]);
    };

    const removeItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const saveInvoice = async () => {
        try {
            const res = await fetch('/api/invoices', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sellerDetails: seller,
                    clientDetails: client,
                    invoiceDetails: {
                        invoiceNo: invoice.number,
                        date: invoice.date,
                        billingPeriod: invoice.billingPeriod,
                        terms: invoice.terms,
                    },
                    items,
                    totalAmount: total,
                }),
            });
            if (res.ok) {
                alert('Invoice Saved Successfully!');
            } else {
                alert('Failed to save invoice');
            }
        } catch (error) {
            console.error(error);
            alert('Error saving invoice');
        }
    };

    const generatePDF = () => {
        const doc = new jsPDF();
        const blueColor = '#003366';

        doc.setFontSize(20);
        doc.setTextColor(blueColor);
        doc.setFont('helvetica', 'bold');
        doc.text(seller.name, 15, 20);

        doc.setFontSize(24);
        doc.text('INVOICE', 160, 20);

        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'bold');

        let yPos = 30;
        const addressLines = doc.splitTextToSize(seller.address, 90);
        doc.text(addressLines, 15, yPos);
        yPos += addressLines.length * 5;

        doc.text(`Phone: ${seller.phone}`, 15, yPos);
        yPos += 5;
        doc.text(`PAN No.: ${seller.pan}`, 15, yPos);
        yPos += 10;

        doc.setFillColor(blueColor);
        doc.rect(15, yPos, 90, 7, 'F');
        doc.rect(115, yPos, 40, 7, 'F');
        doc.rect(155, yPos, 40, 7, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(9);
        doc.text("BILL TO", 17, yPos + 5);
        doc.text("INVOICE #", 117, yPos + 5);
        doc.text("DATE", 157, yPos + 5);

        yPos += 12;
        doc.setTextColor(0, 0, 0);
        doc.text(client.name, 15, yPos);
        doc.text(invoice.number, 115, yPos);
        doc.text(invoice.date, 155, yPos);

        yPos += 5;
        const clientAddressLines = doc.splitTextToSize(client.address, 90);
        doc.setFont('helvetica', 'normal');
        doc.text(clientAddressLines, 15, yPos);

        const secondRowY = yPos + 8;
        doc.setFillColor(blueColor);
        doc.rect(115, secondRowY, 40, 7, 'F');
        doc.rect(155, secondRowY, 40, 7, 'F');

        doc.setTextColor(255, 255, 255);
        doc.text("BILLING PERIOD", 117, secondRowY + 5);
        doc.text("TERMS", 157, secondRowY + 5);

        const secondRowValY = secondRowY + 12;
        doc.setTextColor(0, 0, 0);
        doc.text(invoice.billingPeriod, 115, secondRowValY);
        doc.text(invoice.terms, 155, secondRowValY);

        const thirdRowY = secondRowValY + 3;
        doc.setFillColor(blueColor);
        doc.rect(115, thirdRowY, 40, 7, 'F');
        doc.rect(155, thirdRowY, 40, 7, 'F');

        doc.setTextColor(255, 255, 255);
        doc.text("NO. OF DAYS", 117, thirdRowY + 5);
        doc.text("MONTH DAYS", 157, thirdRowY + 5);

        const thirdRowValY = thirdRowY + 12;
        doc.setTextColor(0, 0, 0);
        doc.text(invoice.noOfDays, 115, thirdRowValY);
        doc.text(invoice.monthDays, 155, thirdRowValY);

        let clientY = yPos + (clientAddressLines.length * 5);
        doc.text(`GSTIN: ${client.gstin}`, 15, clientY);
        clientY += 5;
        doc.text(`State: ${client.state}`, 15, clientY);

        const tableStartY = Math.max(clientY, thirdRowValY) + 10;

        autoTable(doc, {
            startY: tableStartY,
            head: [['DESCRIPTION', 'UOM', 'QTY', 'UNIT PRICE', 'AMOUNT']],
            body: items.map(item => [
                item.description,
                item.uom,
                item.qty.toString(),
                item.unitPrice.toFixed(2),
                item.amount.toFixed(2)
            ]),
            headStyles: { fillColor: blueColor, textColor: 255, fontStyle: 'bold' },
            theme: 'grid',
            styles: { fontSize: 10, cellPadding: 2 },
            columnStyles: {
                0: { cellWidth: 90 },
                3: { halign: 'right' },
                4: { halign: 'right' }
            }
        });

        const finalY = (doc as any).lastAutoTable.finalY + 10;

        doc.setFontSize(9);
        doc.setTextColor(blueColor);
        doc.setFont('helvetica', 'italic');
        doc.text("Thank you for your business!", 50, finalY);

        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 0, 0);
        doc.text("Bank Details:", 15, finalY + 10);

        doc.setFont('helvetica', 'normal');
        doc.text(`Beneficiary Name: ${bank.beneficiary}`, 15, finalY + 17);
        doc.text(`Bank Name: ${bank.bankName}`, 15, finalY + 24);
        doc.text(`Account No: ${bank.accountNo}`, 15, finalY + 31);

        let totalY = finalY;
        doc.text("SUBTOTAL", 120, totalY);
        doc.text(subTotal.toFixed(2), 190, totalY, { align: 'right' });

        totalY += 7;
        doc.text("TAX RATE (N.A)", 120, totalY);
        doc.text("0.000%", 190, totalY, { align: 'right' });

        totalY += 7;
        doc.text("TAX", 120, totalY);
        doc.text("-", 190, totalY, { align: 'right' });

        totalY += 7;
        doc.setFillColor(blueColor);
        doc.rect(115, totalY - 5, 80, 10, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text("TOTAL", 120, totalY + 2);
        doc.text(`Rs. ${total.toFixed(2)}`, 190, totalY + 2, { align: 'right' });

        const footerY = 280;
        doc.setFontSize(8);
        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'normal');
        doc.text("If you have any questions about this invoice, please contact", 15, footerY - 5);
        doc.setFont('helvetica', 'bold');
        doc.text(`Phone No.${seller.supportPhone}, Email ID: ${seller.supportEmail}`, 15, footerY);

        doc.setDrawColor(150);
        doc.rect(120, totalY + 10, 75, 25);
        doc.setFontSize(8);
        doc.text(seller.name, 157.5, totalY + 32, { align: 'center' });

        doc.save(`${invoice.number.replace(/\//g, '_')}.pdf`);
    };

    return (
        <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 no-print">
                <div className="space-y-1">
                    <h1 className="text-3xl font-extrabold tracking-tight">Invoice Editor</h1>
                    <p className="text-muted-foreground">Create and manage your professional invoices with ease.</p>
                </div>
                <div className="flex gap-2">
                    <Button onClick={saveInvoice} variant="secondary">
                        <Save /> Save Draft
                    </Button>
                    <Button onClick={generatePDF} className="bg-primary hover:bg-primary/90">
                        <Download /> Download PDF
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {/* Seller / Header Card */}
                    <Card>
                        <CardHeader className="flex flex-row items-center gap-4 space-y-0">
                            <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                <Building2 size={24} />
                            </div>
                            <CardTitle>Seller Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="seller-name">Business Name</Label>
                                    <Input id="seller-name" value={seller.name} onChange={e => setSeller({ ...seller, name: e.target.value })} placeholder="e.g. Acme Corp" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="seller-logo">Company Logo</Label>
                                    <Input id="seller-logo" type="file" accept="image/*" onChange={handleLogoUpload} className="cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="seller-address">Address</Label>
                                <Textarea id="seller-address" value={seller.address} onChange={e => setSeller({ ...seller, address: e.target.value })} placeholder="Business street address..." className="min-h-[100px]" />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="seller-phone">Phone (Business)</Label>
                                    <Input id="seller-phone" value={seller.phone} onChange={e => setSeller({ ...seller, phone: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="seller-pan">PAN No.</Label>
                                    <Input id="seller-pan" value={seller.pan} onChange={e => setSeller({ ...seller, pan: e.target.value })} />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="seller-email">Email (Business)</Label>
                                    <Input id="seller-email" type="email" value={seller.email} onChange={e => setSeller({ ...seller, email: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="seller-logo">Company Logo</Label>
                                    <Input id="seller-logo" type="file" accept="image/*" onChange={handleLogoUpload} className="cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20" />
                                </div>
                            </div>
                            <div className="p-4 bg-muted/30 rounded-lg space-y-4">
                                <h4 className="text-sm font-semibold flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-primary" />
                                    PDF Footer Contact Details
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="support-phone">Support Phone</Label>
                                        <Input id="support-phone" value={seller.supportPhone} onChange={e => setSeller({ ...seller, supportPhone: e.target.value })} placeholder="Phone shown in PDF footer" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="support-email">Support Email</Label>
                                        <Input id="support-email" type="email" value={seller.supportEmail} onChange={e => setSeller({ ...seller, supportEmail: e.target.value })} placeholder="Email shown in PDF footer" />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Client Card */}
                    <Card>
                        <CardHeader className="flex flex-row items-center gap-4 space-y-0">
                            <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                <User2 size={24} />
                            </div>
                            <CardTitle>Client / Bill To</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="client-name">Client Name</Label>
                                    <Input id="client-name" value={client.name} onChange={e => setClient({ ...client, name: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="client-gstin">GSTIN</Label>
                                    <Input id="client-gstin" value={client.gstin} onChange={e => setClient({ ...client, gstin: e.target.value })} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="client-address">Address</Label>
                                <Textarea id="client-address" value={client.address} onChange={e => setClient({ ...client, address: e.target.value })} className="min-h-[100px]" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="client-state">State</Label>
                                <Input id="client-state" value={client.state} onChange={e => setClient({ ...client, state: e.target.value })} />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Invoice Info Card - Right Sidebar */}
                <div className="space-y-8">
                    <Card className="bg-muted/30">
                        <CardHeader className="flex flex-row items-center gap-4 space-y-0">
                            <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                <ReceiptText size={20} />
                            </div>
                            <CardTitle className="text-lg">Invoice Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-4">
                            <div className="space-y-2">
                                <Label htmlFor="invoice-no">Invoice Number</Label>
                                <Input id="invoice-no" value={invoice.number} onChange={e => setInvoice({ ...invoice, number: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="invoice-date">Invoice Date</Label>
                                <Input id="invoice-date" type="date" value={invoice.date} onChange={e => setInvoice({ ...invoice, date: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="billing-period">Billing Period</Label>
                                <Input id="billing-period" value={invoice.billingPeriod} onChange={e => setInvoice({ ...invoice, billingPeriod: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="terms">Terms</Label>
                                <Input id="terms" value={invoice.terms} onChange={e => setInvoice({ ...invoice, terms: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="days">No. of Days</Label>
                                    <Input id="days" value={invoice.noOfDays} onChange={e => setInvoice({ ...invoice, noOfDays: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="month-days">Month Days</Label>
                                    <Input id="month-days" value={invoice.monthDays} onChange={e => setInvoice({ ...invoice, monthDays: e.target.value })} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-primary/5 border-primary/20">
                        <CardHeader className="flex flex-row items-center gap-4 space-y-0">
                            <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                <Landmark size={20} />
                            </div>
                            <CardTitle className="text-lg">Bank Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-4">
                            <div className="space-y-2">
                                <Label>Beneficiary</Label>
                                <Input value={bank.beneficiary} onChange={e => setBank({ ...bank, beneficiary: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label>Bank Name</Label>
                                <Input value={bank.bankName} onChange={e => setBank({ ...bank, bankName: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label>Account / IFSC</Label>
                                <Input value={bank.accountNo} onChange={e => setBank({ ...bank, accountNo: e.target.value })} />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Line Items Card */}
            <Card className="overflow-hidden">
                <CardHeader className="bg-muted/50">
                    <CardTitle>Line Items</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-muted border-b">
                                <tr>
                                    <th className="p-4 text-left font-semibold">Description</th>
                                    <th className="p-4 text-left font-semibold w-24">UOM</th>
                                    <th className="p-4 text-left font-semibold w-24">Qty</th>
                                    <th className="p-4 text-left font-semibold w-32">Unit Price</th>
                                    <th className="p-4 text-right font-semibold w-40">Amount</th>
                                    <th className="p-4 w-16"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {items.map((item, index) => (
                                    <tr key={index} className="hover:bg-muted/30 transition-colors">
                                        <td className="p-4">
                                            <Input value={item.description} onChange={e => handleItemChange(index, 'description', e.target.value)} variant="ghost" className="h-8 border-none focus-visible:ring-0 px-0" />
                                        </td>
                                        <td className="p-4">
                                            <Input value={item.uom} onChange={e => handleItemChange(index, 'uom', e.target.value)} variant="ghost" className="h-8 border-none focus-visible:ring-0 px-0" />
                                        </td>
                                        <td className="p-4">
                                            <Input type="number" value={item.qty} onChange={e => handleItemChange(index, 'qty', parseFloat(e.target.value) || 0)} variant="ghost" className="h-8 border-none focus-visible:ring-0 px-0" />
                                        </td>
                                        <td className="p-4">
                                            <Input type="number" value={item.unitPrice} onChange={e => handleItemChange(index, 'unitPrice', parseFloat(e.target.value) || 0)} variant="ghost" className="h-8 border-none focus-visible:ring-0 px-0" />
                                        </td>
                                        <td className="p-4 text-right font-bold tabular-nums">
                                            {item.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                        </td>
                                        <td className="p-4 text-center">
                                            <Button size="icon" variant="ghost" onClick={() => removeItem(index)} className="text-destructive hover:text-destructive hover:bg-destructive/10">
                                                <Trash2 size={16} />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="p-4 border-t">
                        <Button onClick={addItem} variant="outline" size="sm" className="gap-2">
                            <Plus size={16} /> Add New Item
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Summary Section */}
            <div className="flex flex-col md:flex-row justify-end gap-8 pt-8 border-t">
                <div className="w-full md:w-80 space-y-4">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span className="font-semibold tabular-nums">{subTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Tax (0%)</span>
                        <span className="font-semibold">-</span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-primary text-primary-foreground rounded-xl shadow-lg shadow-primary/20">
                        <span className="text-lg font-bold">Total</span>
                        <span className="text-2xl font-black tabular-nums">Rs. {total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
