import { toast } from 'sonner';
import type { AnalysisData } from '../component/AnalysisReport';

/**
 * Builds the PDF report. Previously duplicated verbatim in the explanation and
 * share pages, which meant a fix to one silently left the other behind.
 */
export async function exportAnalysisPdf(data: AnalysisData) {
  try {
    const { default: jsPDF } = await import('jspdf');

    const doc = new jsPDF();
    const margin = 15;
    const pageWidth = doc.internal.pageSize.getWidth();
    const maxLineWidth = pageWidth - margin * 2;
    const lineHeight = 6;
    let yPos = margin;

    const checkPageBreak = (spaceNeeded: number) => {
      if (yPos + spaceNeeded >= doc.internal.pageSize.getHeight() - margin) {
        doc.addPage();
        yPos = margin;
      }
    };

    const addSection = (title: string, body: string) => {
      checkPageBreak(15);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(40, 40, 40);
      doc.text(title, margin, yPos);
      yPos += 8;

      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(60, 60, 60);

      const lines = doc.splitTextToSize(body || 'N/A', maxLineWidth);
      checkPageBreak(lines.length * lineHeight);
      doc.text(lines, margin, yPos);
      yPos += lines.length * lineHeight + 10;
    };

    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('Analysis Report', margin, yPos);
    yPos += 10;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text(`File: ${data.fileName || 'snippet'}`, margin, yPos);
    yPos += 5;
    doc.text(`Language: ${data.language}`, margin, yPos);
    yPos += 15;

    addSection('1. Overview', data.explanationDoc?.overview ?? '');

    const keyPointsText = (data.keyPoints ?? [])
      .map((p) => `• ${p.replace(/^- /, '')}`)
      .join('\n');
    addSection('2. Key takeaways', keyPointsText);

    addSection('3. Logic flow', data.explanationDoc?.logicFlow ?? '');
    addSection('4. Function breakdown', data.explanationDoc?.functionBreakdown ?? '');
    addSection('5. Complexity', data.complexity ?? '');

    const improvementsText = (data.improvements ?? []).map((i) => `• ${i}`).join('\n');
    addSection('6. Improvements', improvementsText);

    doc.save(`${data.fileName ? data.fileName.split('.')[0] : 'analysis'}_report.pdf`);
    toast.success('PDF downloaded');
  } catch (err) {
    console.error(err);
    toast.error('Could not build the PDF. Please try again.');
  }
}
