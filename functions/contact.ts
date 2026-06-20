export async function onRequest({ request }) {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Méthode non autorisée' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json', Allow: 'POST' },
    });
  }

  const BREVO_API_KEY = process.env.BREVO_API_KEY;
  const BREVO_FROM_EMAIL = process.env.BREVO_FROM_EMAIL;
  const BREVO_FROM_NAME = process.env.BREVO_FROM_NAME || 'ConsoAlert';
  const CONTACT_TO_EMAIL = process.env.CONTACT_TO_EMAIL;
  const TURNSTILE_SECRET_KEY = process.env.TURNSTILE_SECRET_KEY;

  if (!BREVO_API_KEY || !BREVO_FROM_EMAIL || !CONTACT_TO_EMAIL || !TURNSTILE_SECRET_KEY) {
    return new Response(JSON.stringify({ error: 'Configuration manquante sur le serveur.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let payload;
  try {
    payload = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Requête JSON invalide.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const nom = String(payload.nom || '').trim();
  const prenom = String(payload.prenom || '').trim();
  const email = String(payload.email || '').trim();
  const telephone = String(payload.telephone || '').trim();
  const message = String(payload.message || '').trim();
  const turnstileToken = String(payload.turnstileToken || '').trim();

  if (!nom || !prenom || !email || !message || !turnstileToken) {
    return new Response(JSON.stringify({ error: 'Tous les champs obligatoires doivent être remplis.' }), {
      status: 422,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return new Response(JSON.stringify({ error: 'Adresse email invalide.' }), {
      status: 422,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const verifyResponse = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ secret: TURNSTILE_SECRET_KEY, response: turnstileToken }).toString(),
  });

  const verifyData = await verifyResponse.json();
  if (!verifyData.success) {
    return new Response(JSON.stringify({ error: 'Validation Turnstile échouée.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const escapeHtml = (value) =>
    value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');

  const htmlContent = `
    <h1>Nouveau message de contact ConsoAlert</h1>
    <p><strong>Nom :</strong> ${escapeHtml(nom)}</p>
    <p><strong>Prénom :</strong> ${escapeHtml(prenom)}</p>
    <p><strong>Email :</strong> ${escapeHtml(email)}</p>
    <p><strong>Téléphone :</strong> ${escapeHtml(telephone) || 'Non fourni'}</p>
    <p><strong>Message :</strong></p>
    <pre style="white-space: pre-wrap; font-family: inherit;">${escapeHtml(message)}</pre>
  `;

  const textContent = `Nouveau message de contact ConsoAlert\n\nNom: ${nom}\nPrénom: ${prenom}\nEmail: ${email}\nTéléphone: ${telephone || 'Non fourni'}\n\nMessage:\n${message}`;

  const brevoResponse = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': BREVO_API_KEY,
    },
    body: JSON.stringify({
      sender: { name: BREVO_FROM_NAME, email: BREVO_FROM_EMAIL },
      to: [{ email: CONTACT_TO_EMAIL }],
      subject: `Nouveau message ConsoAlert de ${prenom} ${nom}`,
      htmlContent,
      textContent,
      replyTo: { email, name: `${prenom} ${nom}` },
    }),
  });

  if (!brevoResponse.ok) {
    const errorPayload = await brevoResponse.text();
    return new Response(JSON.stringify({ error: 'Envoi Brevo échoué.', details: errorPayload }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
