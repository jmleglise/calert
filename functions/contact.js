const ENV_KEYS = [
  'BREVO_API_KEY',
  'BREVO_FROM_EMAIL',
  'BREVO_FROM_NAME',
  'CONTACT_TO_EMAIL',
  'TURNSTILE_SECRET_KEY',
];

const jsonResponse = (body, init = {}) =>
  new Response(JSON.stringify(body), {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  });

const toTrimmedString = (value) => (typeof value === 'string' ? value.trim() : '');

const getEnvValue = (env, key) => {
  if (!ENV_KEYS.includes(key)) return '';

  return env?.[key] || globalThis.process?.env?.[key] || '';
};

const escapeHtml = (value) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const readResponseBody = async (response) => {
  const text = await response.text();

  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};

export async function onRequest({ request, env = {} }) {
  if (request.method !== 'POST') {
    return jsonResponse(
      { error: 'Méthode non autorisée' },
      {
        status: 405,
        headers: { Allow: 'POST' },
      },
    );
  }

  const BREVO_API_KEY = getEnvValue(env, 'BREVO_API_KEY');
  const BREVO_FROM_EMAIL = getEnvValue(env, 'BREVO_FROM_EMAIL');
  const BREVO_FROM_NAME = getEnvValue(env, 'BREVO_FROM_NAME') || 'ConsoAlert';
  const CONTACT_TO_EMAIL = getEnvValue(env, 'CONTACT_TO_EMAIL');
  const TURNSTILE_SECRET_KEY = getEnvValue(env, 'TURNSTILE_SECRET_KEY');

  if (!BREVO_API_KEY || !BREVO_FROM_EMAIL || !CONTACT_TO_EMAIL || !TURNSTILE_SECRET_KEY) {
    return jsonResponse({ error: 'Configuration manquante sur le serveur.' }, { status: 500 });
  }

  let payload;
  try {
    payload = await request.json();
  } catch {
    return jsonResponse({ error: 'Requête JSON invalide.' }, { status: 400 });
  }

  const nom = toTrimmedString(payload.nom);
  const prenom = toTrimmedString(payload.prenom);
  const email = toTrimmedString(payload.email);
  const telephone = toTrimmedString(payload.telephone);
  const message = toTrimmedString(payload.message);
  const turnstileToken = toTrimmedString(payload.turnstileToken);

  if (!nom || !prenom || !email || !message || !turnstileToken) {
    return jsonResponse({ error: 'Tous les champs obligatoires doivent être remplis.' }, { status: 422 });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return jsonResponse({ error: 'Adresse email invalide.' }, { status: 422 });
  }

  let verifyResponse;
  try {
    verifyResponse = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ secret: TURNSTILE_SECRET_KEY, response: turnstileToken }).toString(),
    });
  } catch (error) {
    console.error('Turnstile verification request failed', error);
    return jsonResponse({ error: 'Validation Turnstile indisponible.' }, { status: 502 });
  }

  const verifyData = await readResponseBody(verifyResponse);

  if (!verifyData || typeof verifyData !== 'object') {
    return jsonResponse({ error: 'Validation Turnstile indisponible.' }, { status: 502 });
  }

  if (!verifyResponse.ok || !verifyData.success) {
    return jsonResponse(
      {
        error: 'Validation Turnstile échouée.',
        details: verifyData['error-codes'] || [],
      },
      { status: 400 },
    );
  }

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

  let brevoResponse;
  try {
    brevoResponse = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'api-key': BREVO_API_KEY,
      },
      body: JSON.stringify({
        sender: { email: BREVO_FROM_EMAIL, name: BREVO_FROM_NAME },
        to: [{ email: CONTACT_TO_EMAIL }],
        replyTo: { email, name: `${prenom} ${nom}` },
        subject: `Nouveau message de contact ConsoAlert - ${prenom} ${nom}`,
        htmlContent,
        textContent,
      }),
    });
  } catch (error) {
    console.error('Brevo email request failed', error);
    return jsonResponse({ error: 'Service d’envoi indisponible. Merci de réessayer plus tard.' }, { status: 502 });
  }

  if (!brevoResponse.ok) {
    const details = await readResponseBody(brevoResponse);

    console.error('Brevo email send failed', details);
    return jsonResponse({ error: 'Impossible d’envoyer le message pour le moment.' }, { status: 502 });
  }

  return jsonResponse({ success: true });
}