export const config = {
  path: '/api/send'
};

export default async (request) => {
  const jsonHeaders = {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store'
  };

  if (request.method === 'GET') {
    return Response.json(
      { ok: true, message: 'Fikadoo mail API działa.' },
      { status: 200, headers: jsonHeaders }
    );
  }

  if (request.method !== 'POST') {
    return Response.json(
      { ok: false, message: `Metoda ${request.method} nie jest obsługiwana.` },
      { status: 405, headers: jsonHeaders }
    );
  }

  try {
    const resendApiKey = process.env.RESEND_API_KEY;
    const mailTo = 'kamileq51@gmail.com';

    if (!resendApiKey) {
      throw new Error('Brakuje zmiennej RESEND_API_KEY w Netlify.');
    }

    const data = await request.json();

    const {
      name,
      phone,
      email,
      date,
      time,
      package: selectedPackage,
      duration,
      event_type: eventType,
      children,
      people,
      location,
      message,
      source
    } = data || {};

    if (!name || !phone || !email || !date || !time) {
      return Response.json(
        { ok: false, message: 'Uzupełnij wszystkie wymagane pola.' },
        { status: 400, headers: jsonHeaders }
      );
    }

    const safe = value =>
      String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');

    const mailRow = (label, value) => `
      <tr>
        <td style="width:42%;padding:12px 14px;background:#f7f9fd;border-bottom:9px solid #fff;color:#718096;font-size:13px;font-weight:700;">${label}</td>
        <td style="padding:12px 14px;background:#f7f9fd;border-bottom:9px solid #fff;color:#0b2b57;font-size:15px;">${value}</td>
      </tr>`;

    const origin = new URL(request.url).origin;
    const logoUrl = `${origin}/assets/logo.png`;

    const html = `<!doctype html>
<html lang="pl">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f7fb;font-family:Arial,Helvetica,sans-serif;color:#0b2b57;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f4f7fb;padding:30px 12px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:640px;background:#ffffff;border-radius:22px;overflow:hidden;">
        <tr><td align="center" style="padding:28px 30px 12px;"><img src="${logoUrl}" alt="Fikadoo" style="display:block;width:240px;max-width:80%;height:auto;margin:0 auto;"></td></tr>
        <tr><td align="center" style="padding:8px 30px 28px;">
          <div style="display:inline-block;background:#fff0f7;color:#ff2f8b;font-size:12px;font-weight:700;letter-spacing:1px;padding:8px 14px;border-radius:999px;">NOWE ZAPYTANIE</div>
          <h1 style="margin:14px 0 8px;font-size:28px;color:#0b2b57;">Nowe zapytanie Fikadoo</h1>
          <p style="margin:0;color:#718096;font-size:15px;">Klient wysłał formularz ze strony internetowej.</p>
        </td></tr>
        <tr><td style="padding:0 30px 8px;"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
          ${mailRow('Imię i nazwisko', safe(name))}
          ${mailRow('Telefon', `<a href="tel:${safe(phone)}" style="color:#1685ef;text-decoration:none;font-weight:700;">${safe(phone)}</a>`)}
          ${mailRow('E-mail', `<a href="mailto:${safe(email)}" style="color:#1685ef;text-decoration:none;font-weight:700;">${safe(email)}</a>`)}
          ${mailRow('Data imprezy', safe(date))}
          ${mailRow('Godzina', safe(time))}
          ${mailRow('Rodzaj wydarzenia', safe(eventType || '-'))}
          ${mailRow('Liczba dzieci', safe(children || '-'))}
          ${mailRow('Liczba wszystkich osób', safe(people || '-'))}
          ${mailRow('Miejsce wydarzenia', safe(location || '-'))}
          ${mailRow('Pakiet', safe(selectedPackage || '-'))}
          ${mailRow('Czas animacji', safe(duration || '-'))}
          ${mailRow('Źródło zapytania', safe(source || '-'))}
        </table></td></tr>
        <tr><td style="padding:15px 30px 6px;">
          <div style="background:#fff3f8;border:1px solid #ffd5e6;border-radius:16px;padding:20px;">
            <div style="font-size:12px;font-weight:800;color:#ff2f8b;letter-spacing:1px;margin-bottom:9px;">DODATKOWE INFORMACJE</div>
            <div style="font-size:15px;line-height:1.65;color:#37475a;">${safe(message || '-').replace(/\n/g, '<br>')}</div>
          </div>
        </td></tr>
        <tr><td align="center" style="padding:25px 30px 34px;"><a href="mailto:${safe(email)}" style="display:inline-block;background:#ff2f8b;color:#fff;text-decoration:none;padding:14px 26px;border-radius:999px;font-weight:800;">Odpowiedz klientowi</a></td></tr>
        <tr><td><table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"><tr><td width="33%" height="8" style="background:#1685ef;font-size:0;">&nbsp;</td><td width="34%" height="8" style="background:#ff2f8b;font-size:0;">&nbsp;</td><td width="33%" height="8" style="background:#ffd21c;font-size:0;">&nbsp;</td></tr></table></td></tr>
        <tr><td align="center" style="padding:18px 25px 22px;color:#9aa5b5;font-size:12px;">Fikadoo • formularz kontaktowy</td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Fikadoo <onboarding@resend.dev>',
        to: [mailTo],
        reply_to: String(email),
        subject: `Nowe zapytanie Fikadoo - ${String(name)}`,
        html
      })
    });

    const result = await resendResponse.json().catch(() => ({}));

    if (!resendResponse.ok) {
      console.error('Resend error:', result);
      throw new Error(result?.message || `Resend zwrócił błąd HTTP ${resendResponse.status}.`);
    }

    return Response.json(
      { ok: true, message: 'Zapytanie zostało wysłane.' },
      { status: 200, headers: jsonHeaders }
    );
  } catch (error) {
    console.error('Fikadoo send error:', error);
    return Response.json(
      { ok: false, message: error?.message || 'Nie udało się wysłać wiadomości.' },
      { status: 500, headers: jsonHeaders }
    );
  }
};
