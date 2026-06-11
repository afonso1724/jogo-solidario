import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';
import { config } from '../config.js';

export async function gerarBilhetePDF({ nome, email, quantidade, hash, valorTotal }) {
  const validacaoUrl = `${config.adminFrontendUrl}/admin/validar/${hash}`;

  const qrDataUrl = await QRCode.toDataURL(validacaoUrl, {
    width: 200,
    margin: 2,
    color: { dark: '#0A0A0A', light: '#FFFFFF' },
  });

  const qrBase64 = qrDataUrl.replace(/^data:image\/png;base64,/, '');
  const qrBuffer = Buffer.from(qrBase64, 'base64');

  return new Promise((resolve, reject) => {
    const chunks = [];
    const doc = new PDFDocument({ size: 'A5', margin: 40 });

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    doc.rect(0, 0, doc.page.width, 60).fill('#FACC15');
    doc.fillColor('#0A0A0A').fontSize(18).font('Helvetica-Bold');
    doc.text('JOGO SOLIDÁRIO', 40, 22);

    doc.fillColor('#0A0A0A').fontSize(10).font('Helvetica');
    doc.y = 80;
    doc.text('BILHETE OFICIAL', { align: 'center' });
    doc.moveDown();

    doc.fontSize(9).fillColor('#404040');
    doc.text(`Titular: ${nome}`);
    doc.text(`E-mail: ${email}`);
    doc.text(`Quantidade: ${quantidade} ingresso(s)`);
    doc.text(`Valor: ${Number(valorTotal).toLocaleString('pt-AO')} Kz`);
    doc.text(`Código: ${hash}`);
    doc.moveDown();

    const qrX = (doc.page.width - 120) / 2;
    doc.image(qrBuffer, qrX, doc.y, { width: 120, height: 120 });
    doc.y += 130;

    doc.fontSize(8).fillColor('#737373').text(
      'Apresente este QR Code na portaria para entrada.',
      { align: 'center' }
    );
    doc.text('Desenvolvido com 💛 por SYNERTECH', { align: 'center' });

    doc.end();
  });
}
