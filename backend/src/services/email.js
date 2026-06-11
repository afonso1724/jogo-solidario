import nodemailer from 'nodemailer';
import { config } from '../config.js';

let transporter = null;

function getTransporter() {
  if (!config.smtp.host || !config.smtp.user) {
    return null;
  }
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: config.smtp.host,
      port: config.smtp.port,
      secure: config.smtp.port === 465,
      auth: {
        user: config.smtp.user,
        pass: config.smtp.pass,
      },
    });
  }
  return transporter;
}

export async function enviarEmail({ para, assunto, html, anexos = [] }) {
  const transport = getTransporter();
  if (!transport) {
    console.warn('[email] SMTP não configurado — e-mail não enviado:', assunto);
    return { skipped: true };
  }

  await transport.sendMail({
    from: config.smtp.from,
    to: para,
    subject: assunto,
    html,
    attachments: anexos,
  });

  return { sent: true };
}

export function templateConfirmacao({ nome, tipo, status, quantidade, valorTotal, referencia }) {
  const tipoLabel = tipo === 'reserva' ? 'Reserva' : 'Compra';
  return `
    <div style="font-family:Segoe UI,sans-serif;max-width:560px;margin:0 auto;background:#0A0A0A;color:#fff;padding:32px;border-radius:12px;">
      <h1 style="color:#FACC15;margin:0;">Jogo Solidário</h1>
      <p style="color:#a3a3a3;">Olá <strong>${nome}</strong>,</p>
      <p>A sua ${tipoLabel.toLowerCase()} foi registada com sucesso.</p>
      <table style="width:100%;margin:24px 0;border-collapse:collapse;">
        <tr><td style="padding:8px 0;color:#a3a3a3;">Referência</td><td style="color:#FACC15;font-weight:bold;">${referencia}</td></tr>
        <tr><td style="padding:8px 0;color:#a3a3a3;">Quantidade</td><td>${quantidade} ingresso(s)</td></tr>
        <tr><td style="padding:8px 0;color:#a3a3a3;">Valor total</td><td>${Number(valorTotal).toLocaleString('pt-AO')} Kz</td></tr>
        <tr><td style="padding:8px 0;color:#a3a3a3;">Estado</td><td>${status}</td></tr>
      </table>
      ${
        tipo === 'reserva'
          ? '<p style="color:#a3a3a3;">Pague em dinheiro no local antes do prazo de expiração da reserva.</p>'
          : '<p style="color:#a3a3a3;">Aguarde a validação do comprovativo. Receberá o bilhete em PDF após aprovação.</p>'
      }
      <p style="margin-top:32px;font-size:12px;color:#525252;">Desenvolvido com 💛 por SYNERTECH</p>
    </div>
  `;
}

export function templateBilheteAprovado({ nome, hash }) {
  return `
    <div style="font-family:Segoe UI,sans-serif;max-width:560px;margin:0 auto;background:#0A0A0A;color:#fff;padding:32px;">
      <h1 style="color:#FACC15;">Ingresso Aprovado!</h1>
      <p>Olá <strong>${nome}</strong>, o seu pagamento foi validado.</p>
      <p>Encontre o bilhete em PDF em anexo. Apresente o QR Code na portaria.</p>
      <p style="color:#525252;font-size:12px;">Hash: ${hash}</p>
    </div>
  `;
}
