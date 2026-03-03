export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { rateLimit, rateLimitByUser, getClientIp } from '@/lib/rate-limit';
import { exportSchema } from '@/lib/validations';
import { jsPDF } from 'jspdf';

/**
 * Strip HTML tags and convert to structured text for PDF rendering.
 * Preserves headings, paragraphs, and list structure.
 */
function stripHTML(html: string): Array<{ type: 'h2' | 'h3' | 'p' | 'li'; text: string }> {
    const blocks: Array<{ type: 'h2' | 'h3' | 'p' | 'li'; text: string }> = [];

    // Normalize whitespace and line breaks
    let cleaned = html
        .replace(/\r\n/g, '\n')
        .replace(/<br\s*\/?>/gi, '\n');

    // Extract blocks by tag type
    const blockRegex = /<(h2|h3|p|li)[^>]*>([\s\S]*?)<\/\1>/gi;
    let match: RegExpExecArray | null;

    while ((match = blockRegex.exec(cleaned)) !== null) {
        const tag = match[1].toLowerCase() as 'h2' | 'h3' | 'p' | 'li';
        // Strip remaining inline tags
        const text = match[2]
            .replace(/<[^>]+>/g, '')
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&#039;/g, "'")
            .replace(/&nbsp;/g, ' ')
            .trim();

        if (text) {
            blocks.push({ type: tag, text });
        }
    }

    // Fallback: if no blocks found, treat entire content as a single paragraph
    if (blocks.length === 0) {
        const plainText = html
            .replace(/<[^>]+>/g, ' ')
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&#039;/g, "'")
            .replace(/&nbsp;/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
        if (plainText) {
            blocks.push({ type: 'p', text: plainText });
        }
    }

    return blocks;
}

function escapeHTML(str: string): string {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function generatePDF(
    title: string,
    content: string,
    type: string,
    metadata?: Record<string, string>
): ArrayBuffer {
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - margin * 2;
    let y = 0;

    // Norwegian date formatting
    const now = new Date();
    const timestamp = now.toLocaleDateString('nb-NO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });

    // ── Header bar ──
    doc.setFillColor(160, 113, 79); // #A0714F
    doc.rect(0, 0, pageWidth, 18, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Vocura AI', margin, 12);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(type.toUpperCase(), pageWidth - margin, 12, { align: 'right' });

    y = 30;

    // ── Title ──
    doc.setTextColor(30, 25, 20); // #1E1914
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    const titleLines = doc.splitTextToSize(title, contentWidth);
    doc.text(titleLines, margin, y);
    y += titleLines.length * 8 + 4;

    // ── Date line ──
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(107, 114, 128); // #6b7280
    doc.text(timestamp, margin, y);
    y += 6;

    // ── Separator ──
    doc.setDrawColor(229, 231, 235);
    doc.setLineWidth(0.3);
    doc.line(margin, y, pageWidth - margin, y);
    y += 8;

    // ── Content blocks ──
    const blocks = stripHTML(content);

    const addPageIfNeeded = (requiredSpace: number) => {
        if (y + requiredSpace > pageHeight - 25) {
            // Footer on current page
            addFooter(doc, pageWidth, pageHeight, margin, timestamp);
            doc.addPage();
            y = 20;
        }
    };

    for (const block of blocks) {
        switch (block.type) {
            case 'h2': {
                addPageIfNeeded(16);
                y += 4;
                doc.setFontSize(13);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(30, 25, 20);
                const h2Lines = doc.splitTextToSize(block.text, contentWidth);
                doc.text(h2Lines, margin, y);
                y += h2Lines.length * 6 + 3;
                break;
            }
            case 'h3': {
                addPageIfNeeded(14);
                y += 3;
                doc.setFontSize(11);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(55, 65, 81);
                const h3Lines = doc.splitTextToSize(block.text, contentWidth);
                doc.text(h3Lines, margin, y);
                y += h3Lines.length * 5.5 + 2;
                break;
            }
            case 'li': {
                doc.setFontSize(10);
                doc.setFont('helvetica', 'normal');
                doc.setTextColor(55, 65, 81);
                const liLines = doc.splitTextToSize(block.text, contentWidth - 8);
                addPageIfNeeded(liLines.length * 5 + 2);
                doc.text('\u2022', margin + 2, y);
                doc.text(liLines, margin + 8, y);
                y += liLines.length * 5 + 2;
                break;
            }
            default: { // 'p'
                doc.setFontSize(10);
                doc.setFont('helvetica', 'normal');
                doc.setTextColor(55, 65, 81);
                const pLines = doc.splitTextToSize(block.text, contentWidth);
                addPageIfNeeded(pLines.length * 5 + 3);
                doc.text(pLines, margin, y);
                y += pLines.length * 5 + 3;
                break;
            }
        }
    }

    // ── Metadata table ──
    if (metadata && Object.keys(metadata).length > 0) {
        addPageIfNeeded(30);
        y += 6;
        doc.setDrawColor(229, 231, 235);
        doc.setLineWidth(0.5);
        doc.line(margin, y, pageWidth - margin, y);
        y += 8;

        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(107, 114, 128);
        doc.text('DOKUMENTINFORMASJON', margin, y);
        y += 6;

        for (const [key, value] of Object.entries(metadata)) {
            addPageIfNeeded(8);
            doc.setFontSize(9);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(75, 85, 99);
            doc.text(key, margin, y);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(55, 65, 81);
            const valLines = doc.splitTextToSize(String(value), contentWidth - 60);
            doc.text(valLines, margin + 55, y);
            y += Math.max(valLines.length * 4.5, 6);
        }
    }

    // ── Footer on last page ──
    addFooter(doc, pageWidth, pageHeight, margin, timestamp);

    return doc.output('arraybuffer');
}

function addFooter(
    doc: jsPDF,
    pageWidth: number,
    pageHeight: number,
    margin: number,
    timestamp: string
) {
    const footerY = pageHeight - 12;
    doc.setDrawColor(229, 231, 235);
    doc.setLineWidth(0.3);
    doc.line(margin, footerY - 4, pageWidth - margin, footerY - 4);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(107, 114, 128);
    doc.text('Generert av Vocura AI', margin, footerY);
    doc.setFont('helvetica', 'normal');
    doc.text(timestamp, pageWidth - margin, footerY, { align: 'right' });

    // Page number
    const pageCount = doc.getNumberOfPages();
    const currentPage = doc.getCurrentPageInfo().pageNumber;
    doc.text(`Side ${currentPage} av ${pageCount}`, pageWidth / 2, footerY, { align: 'center' });
}

export async function POST(req: Request) {
    const limited = await rateLimit(getClientIp(req), 'export:post', { limit: 20 });
    if (limited) return limited;

    try {
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json(
                { error: 'Ikke autorisert' },
                { status: 401 }
            );
        }

        const userLimited = await rateLimitByUser(user.id, 'export-pdf:post', { limit: 20 });
        if (userLimited) return userLimited;

        const body = await req.json();
        const parsed = exportSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { error: parsed.error.issues[0]?.message || 'Ugyldig data' },
                { status: 400 }
            );
        }

        const { title, content, type, metadata } = parsed.data as { title: string; content: string; type: string; metadata?: Record<string, string> };

        const pdfBuffer = generatePDF(title, content, type, metadata);

        const filename = `${title.replace(/[^a-zA-Z0-9æøåÆØÅ\s-]/g, '').replace(/\s+/g, '_')}.pdf`;

        return new Response(pdfBuffer, {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="${filename}"`,
            },
        });
    } catch (error: unknown) {
        console.error('Export error:', error);
        return NextResponse.json(
            { error: 'Kunne ikke eksportere dokument. Prøv igjen senere.' },
            { status: 500 }
        );
    }
}
