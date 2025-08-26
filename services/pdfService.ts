
import { jsPDF } from 'jspdf';
import type { AnamnesisFormData } from '../types';

// FIX: Updated the type of the 't' function to allow an optional 'options' parameter for string interpolation.
// This is required for translating strings with placeholders, like the declaration text.
export const generateAnamnesisPDF = (formData: AnamnesisFormData, t: (key: string, options?: Record<string, string | number>) => string): void => {
    const doc = new jsPDF('p', 'mm', 'a4');
    const FONT = 'helvetica';
    let y = 10; // Start higher
    const MARGIN = 10;
    const WIDTH = doc.internal.pageSize.getWidth();

    // Helper to draw a section header (more compact)
    const drawSectionHeader = (title: string) => {
        y += 4;
        doc.setFont(FONT, 'bold');
        doc.setFillColor(230, 230, 230);
        doc.rect(MARGIN, y, WIDTH - (MARGIN * 2), 6, 'F'); // Reduced height
        doc.text(title, MARGIN + 2, y + 4.5); // Adjusted text position
        doc.setFont(FONT, 'normal');
        y += 8; // Reduced space after header
    };
    
    // Helper to draw a key-value pair, now accepts a `currentY` for precise positioning
    const drawField = (label: string, value: string, x: number, width: number, currentY: number) => {
        doc.setFontSize(8);
        doc.setTextColor(120, 120, 120);
        doc.text(label, x, currentY);
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.text(value || '-', x, currentY + 3.5); // Reduced space
        doc.setDrawColor(180, 180, 180);
        doc.line(x, currentY + 5, x + width, currentY + 5); // Reduced space
    };
    
    // Helper for table rendering (more compact)
    const drawTable = (headers: string[], rows: (string[])[], startY: number) => {
        const rowHeight = 6; // Reduced row height
        const startX = MARGIN;
        const tableWidth = WIDTH - (MARGIN * 2);
        const colWidths = headers.map(h => tableWidth / headers.length);
        
        // Header
        doc.setFont(FONT, 'bold');
        doc.setFillColor(240, 240, 240);
        doc.rect(startX, startY, tableWidth, rowHeight, 'F');
        headers.forEach((header, i) => {
            doc.text(header, startX + colWidths.slice(0, i).reduce((a, b) => a + b, 0) + colWidths[i] / 2, startY + 4, { align: 'center' });
        });

        // Rows
        doc.setFont(FONT, 'normal');
        rows.forEach((row, rowIndex) => {
            const currentY = startY + (rowIndex + 1) * rowHeight;
            doc.rect(startX, currentY, tableWidth, rowHeight);
            row.forEach((cell, i) => {
                 doc.text(cell || '-', startX + colWidths.slice(0, i).reduce((a, b) => a + b, 0) + colWidths[i] / 2, currentY + 4, { align: 'center' });
            });
        });

        return startY + (rows.length + 1) * rowHeight;
    };

    // --- PDF CONTENT ---

    // Title
    doc.setFont(FONT, 'bold');
    doc.setFontSize(12); // Reduced font size
    doc.text(t('pdf.title'), WIDTH / 2, y, { align: 'center' });
    y += 5; // Reduced space

    // --- Compact Patient Info Section ---
    const rowHeight = 8;
    
    // Row 1
    drawField(t('anamnese.form.name'), formData.nome, MARGIN, 120, y);
    drawField(t('anamnese.form.age'), formData.idade, MARGIN + 130, 20, y);
    drawField(t('anamnese.form.consultationDate'), formData.data_consulta, MARGIN + 160, 30, y);
    y += rowHeight;

    // Row 2
    const fullAddress = `${formData.endereco || ''}, ${formData.complemento || ''}`.replace(/^, |, $/g, '').trim();
    drawField(t('anamnese.form.address'), fullAddress, MARGIN, 100, y);
    drawField(t('anamnese.form.municipio'), formData.municipio, MARGIN + 110, 80, y);
    y += rowHeight;

    // Row 3
    drawField(t('anamnese.form.cep'), formData.cep, MARGIN, 30, y);
    drawField(t('anamnese.form.bairro'), formData.bairro, MARGIN + 40, 50, y);
    drawField(t('anamnese.form.birthDate'), formData.nascimento, MARGIN + 100, 30, y);
    y += rowHeight;
    
    // Row 4
    drawField(t('anamnese.form.phone'), formData.telefone, MARGIN, 40, y);
    drawField(t('anamnese.form.celular'), formData.celular, MARGIN + 50, 40, y);
    drawField(t('anamnese.form.hasExam'), formData.exame_vista, MARGIN + 100, 20, y);
    if (formData.exame_vista === 'Sim') {
        drawField(t('anamnese.form.lastConsultationDate'), formData.data_ultima, MARGIN + 130, 40, y);
    }
    y += rowHeight;


    // Reason for consultation
    drawSectionHeader(t('anamnese.motivoPrincipal'));
    doc.text((formData.motivo || []).join(', ') || '-', MARGIN, y, { maxWidth: WIDTH - (MARGIN * 2) });
    y+= 7; // Reduced space
    
    // History
    drawSectionHeader(t('anamnese.antecedentes.title'));
    doc.setFontSize(10);
    doc.setFont(FONT, 'bold');
    doc.text(t('anamnese.antecedentes.pessoal'), MARGIN, y);
    doc.setFont(FONT, 'normal');
    doc.text((formData.pessoal || []).join(', ') || '-', MARGIN + 40, y, { maxWidth: WIDTH - (MARGIN * 2) - 40 });
    y += 5; // Reduced space
    doc.setFont(FONT, 'bold');
    doc.text(t('anamnese.antecedentes.familiar'), MARGIN, y);
    doc.setFont(FONT, 'normal');
    doc.text((formData.familiar || []).join(', ') || '-', MARGIN + 40, y, { maxWidth: WIDTH - (MARGIN * 2) - 40 });
    y += 5; // Reduced space
    
    drawField(t('anamnese.form.eyeSurgery'), formData.cirurgia_olhos, MARGIN, 180, y);
    y += 8; // Advance y past the field

    // Lensometry
    drawSectionHeader(t('anamnese.lensometria'));
    const lensometryHeaders = ['', t('anamnese.table.spherical'), t('anamnese.table.cylindrical'), t('anamnese.table.axis'), t('anamnese.table.avcc'), t('anamnese.table.addition'), t('anamnese.table.avcc')];
    const lensometryRows = [
        [t('anamnese.table.od'), formData.ld_esf, formData.ld_cil, formData.ld_eixo, formData.ld_avcc, formData.ld_adicao, formData.ld_avcc2],
        [t('anamnese.table.oe'), formData.le_esf, formData.le_cil, formData.le_eixo, formData.le_avcc, formData.le_adicao, formData.le_avcc2],
    ];
    y = drawTable(lensometryHeaders, lensometryRows, y);
    y += 4; // Reduced space

    // Prescription
    drawSectionHeader(t('anamnese.prescricaoOptica'));
    const prescriptionHeaders = ['', t('anamnese.table.spherical'), t('anamnese.table.cylindrical'), t('anamnese.table.axis'), t('anamnese.table.avcc'), t('anamnese.table.addition'), t('anamnese.table.avcc')];
    const prescriptionRows = [
         [t('anamnese.table.od'), formData.ldp_esf, formData.ldp_cil, formData.ldp_eixo, formData.ldp_avcc, formData.ldp_adicao, formData.ldp_avcc2],
        [t('anamnese.table.oe'), formData.lep_esf, formData.lep_cil, formData.lep_eixo, formData.lep_avcc, formData.lep_adicao, formData.lep_avcc2],
    ];
    y = drawTable(prescriptionHeaders, prescriptionRows, y);
    y += 4; // Reduced space

    // Acuidade & Observacoes (more compact)
    const sectionTopY = y;
    
    // Acuidade
    doc.setFillColor(230, 230, 230);
    doc.rect(MARGIN, sectionTopY, 80, 6, 'F');
    doc.text(t('anamnese.acuidadeVisual'), MARGIN + 2, sectionTopY + 4.5);
    doc.rect(MARGIN, sectionTopY + 6, 80, 25); // Box (reduced height)
    doc.text(`${t('anamnese.acuidade.longe')}:`, MARGIN + 2, sectionTopY + 11);
    doc.text(`OD: ${formData.av_ld_longe_1 || '__'}/${formData.av_ld_longe_2 || '__'}`, MARGIN + 5, sectionTopY + 16);
    doc.text(`OE: ${formData.av_le_longe_1 || '__'}/${formData.av_le_longe_2 || '__'}`, MARGIN + 40, sectionTopY + 16);
    doc.text(`${t('anamnese.acuidade.perto')}:`, MARGIN + 2, sectionTopY + 23);
    doc.text(`OD: ${formData.av_ld_perto_1 || '__'}/${formData.av_ld_perto_2 || '__'}`, MARGIN + 5, sectionTopY + 28);
    doc.text(`OE: ${formData.av_le_perto_1 || '__'}/${formData.av_le_perto_2 || '__'}`, MARGIN + 40, sectionTopY + 28);

    
    // Observacoes
    doc.setFillColor(230, 230, 230);
    doc.rect(MARGIN + 90, sectionTopY, 100, 6, 'F');
    doc.text(t('anamnese.observacoes'), MARGIN + 92, sectionTopY + 4.5);
    doc.rect(MARGIN + 90, sectionTopY + 6, 100, 25); // Box (reduced height)
    doc.text(formData.observacao || '-', MARGIN + 92, sectionTopY + 11, { maxWidth: 96 });

    y = sectionTopY + 36; // Reduced space
    
    // Declaration
    drawSectionHeader(t('anamnese.declaration.title'));
    const declarationText = t('anamnese.declaration.text', { 
        name: formData.decl_nome || '___________________',
        rg: formData.decl_rg || '___________________'
    });
    doc.text(declarationText, MARGIN, y, { maxWidth: WIDTH - (MARGIN * 2) });
    y += 15; // Reduced space
    
    drawField(t('anamnese.declaration.signature'), formData.assinatura, MARGIN, 100, y);

    doc.save(`Anamnese_${formData.nome.replace(/\s/g, '_')}.pdf`);
};
