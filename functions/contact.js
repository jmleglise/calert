const ENV_KEYS = [
  'BREVO_API_KEY',
  'BREVO_FROM_EMAIL',
  'BREVO_FROM_NAME',
  'CONTACT_TO_EMAIL',
  'TURNSTILE_SECRET_KEY',
];

const PUBLIC_ERROR_MESSAGE = 'Impossible d’envoyer le message pour le moment. Merci de réessayer plus tard.';

const ERROR_DEFINITIONS = {
  METHOD_NOT_ALLOWED: {
    status: 405,
    publicMessage: 'Méthode non autorisée.',
    diagnostic: 'La route /contact accepte uniquement les requêtes POST.',
  },
  MISSING_SERVER_CONFIG: {
    status: 500,
    publicMessage: 'Configuration du formulaire indisponible.',
    diagnostic: 'Une ou plusieurs variables Cloudflare Pages sont absentes.',
  },
  INVALID_JSON: {
    status: 400,
    publicMessage: 'Le formulaire envoyé est invalide.',
    diagnostic: 'Le corps de la requête n’est pas un JSON valide.',
  },
  MISSING_REQUIRED_FIELDS: {
    status: 422,
    publicMessage: 'Merci de remplir tous les champs obligatoires.',
    diagnostic: 'Un ou plusieurs champs obligatoires sont vides.',
  },
  INVALID_EMAIL: {
    status: 422,
    publicMessage: 'Merci de saisir une adresse email valide.',
    diagnostic: 'Le champ email ne respecte pas le format attendu.',
  },
  TURNSTILE_NETWORK_ERROR: {
    status: 502,
    publicMessage: PUBLIC_ERROR_MESSAGE,
    diagnostic: 'Impossible de joindre l’API de vérification Cloudflare Turnstile.',
  },
  TURNSTILE_INVALID_RESPONSE: {
    status: 502,
    publicMessage: PUBLIC_ERROR_MESSAGE,
    diagnostic: 'Cloudflare Turnstile a renvoyé une réponse vide, non JSON ou inattendue.',
  },
  TURNSTILE_FAILED: {
    status: 400,
    publicMessage: 'La vérification anti-robot a échoué. Merci de réessayer.',
    diagnostic: 'Cloudflare Turnstile a refusé le jeton envoyé par le navigateur.',
  },
  BREVO_NETWORK_ERROR: {
    status: 502,
    publicMessage: PUBLIC_ERROR_MESSAGE,
    diagnostic: 'Impossible de joindre l’API Brevo Transactional Email.',
  },
  BREVO_SMTP_NOT_ACTIVATED: {
    status: 502,
    publicMessage: PUBLIC_ERROR_MESSAGE,
    diagnostic: 'Le compte transactionnel Brevo n’est pas activé. Brevo appelle ce module “SMTP” même quand l’envoi passe par l’API /v3/smtp/email.',
  },
  BREVO_PERMISSION_DENIED: {
    status: 502,
    publicMessage: PUBLIC_ERROR_MESSAGE,
    diagnostic: 'Brevo refuse l’envoi: clé API sans droit suffisant, compte transactionnel inactif, expéditeur non validé ou domaine non authentifié.',
  },
  BREVO_UNAUTHORIZED: {
    status: 502,
    publicMessage: PUBLIC_ERROR_MESSAGE,
    diagnostic: 'Brevo refuse l’authentification: BREVO_API_KEY absente, invalide, révoquée ou issue du mauvais compte.',
  },
  BREVO_BAD_REQUEST: {
    status: 502,
    publicMessage: PUBLIC_ERROR_MESSAGE,
    diagnostic: 'Brevo refuse le payload: expéditeur, destinataire, replyTo, sujet ou contenu invalide.',
  },
  BREVO_RATE_LIMITED: {
    status: 502,
    publicMessage: PUBLIC_ERROR_MESSAGE,
    diagnostic: 'Brevo limite temporairement les envois: quota, crédits, débit ou politique anti-abus.',
  },
  BREVO_SERVER_ERROR: {
    status: 502,
    publicMessage: PUBLIC_ERROR_MESSAGE,
    diagnostic: 'Brevo rencontre une erreur temporaire côté serveur.',
  },
  BREVO_SEND_FAILED: {
    status: 502,
    publicMessage: PUBLIC_ERROR_MESSAGE,
    diagnostic: 'Brevo a refusé l’envoi pour une raison non catégorisée.',
  },
};

const createRequestId = () =>
  globalThis.crypto?.randomUUID?.() || `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;

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

const getBrevoMessage = (details) => {
  if (typeof details === 'string') return details;
  if (details && typeof details === 'object') return [details.message, details.code].filter(Boolean).join(' ');
  return '';
};

const classifyBrevoError = (response, details) => {
  const message = getBrevoMessage(details).toLowerCase();

  if (response.status === 401 || response.status === 403 && message.includes('unauthorized')) {
    return 'BREVO_UNAUTHORIZED';
  }

  if (message.includes('smtp account is not yet activated') || message.includes('transactional emails') && message.includes('not activated')) {
    return 'BREVO_SMTP_NOT_ACTIVATED';
  }

  if (response.status === 401) return 'BREVO_UNAUTHORIZED';
  if (response.status === 403 || message.includes('permission_denied') || message.includes('permission denied')) {
    return 'BREVO_PERMISSION_DENIED';
  }
  if (response.status === 400 || response.status === 422) return 'BREVO_BAD_REQUEST';
  if (response.status === 429) return 'BREVO_RATE_LIMITED';
  if (response.status >= 500) return 'BREVO_SERVER_ERROR';

  return 'BREVO_SEND_FAILED';
};

const logFailure = ({ requestId, code, detail, error }) => {
  const definition = ERROR_DEFINITIONS[code] || ERROR_DEFINITIONS.BREVO_SEND_FAILED;

  console.error('Contact form failed', {
    requestId,
    code,
    diagnostic: definition.diagnostic,
    detail,
    error: error instanceof Error ? { name: error.name, message: error.message, stack: error.stack } : error,
  });
};

const errorResponse = ({ requestId, code, detail, headers }) => {
  const definition = ERROR_DEFINITIONS[code] || ERROR_DEFINITIONS.BREVO_SEND_FAILED;

  return jsonResponse(
    {
      success: false,
      error: definition.publicMessage,
      code,
      requestId,
      diagnostic: definition.diagnostic,
      detail,
    },
    {
      status: definition.status,
      headers: {
        'X-Contact-Request-Id': requestId,
        ...headers,
      },
    },
  );
};

export async function onRequest({ request, env = {} }) {
  const requestId = createRequestId();

  if (request.method !== 'POST') {
    return errorResponse({ requestId, code: 'METHOD_NOT_ALLOWED', headers: { Allow: 'POST' } });
  }

  const BREVO_API_KEY = getEnvValue(env, 'BREVO_API_KEY');
  const BREVO_FROM_EMAIL = getEnvValue(env, 'BREVO_FROM_EMAIL');
  const BREVO_FROM_NAME = getEnvValue(env, 'BREVO_FROM_NAME') || 'ConsoAlert';
  const CONTACT_TO_EMAIL = getEnvValue(env, 'CONTACT_TO_EMAIL');
  const TURNSTILE_SECRET_KEY = getEnvValue(env, 'TURNSTILE_SECRET_KEY');
  const missingEnvKeys = [
    ['BREVO_API_KEY', BREVO_API_KEY],
    ['BREVO_FROM_EMAIL', BREVO_FROM_EMAIL],
    ['CONTACT_TO_EMAIL', CONTACT_TO_EMAIL],
    ['TURNSTILE_SECRET_KEY', TURNSTILE_SECRET_KEY],
  ]
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missingEnvKeys.length > 0) {
    const detail = { missingEnvKeys };
    logFailure({ requestId, code: 'MISSING_SERVER_CONFIG', detail });
    return errorResponse({ requestId, code: 'MISSING_SERVER_CONFIG', detail });
  }

  let payload;
  try {
    payload = await request.json();
  } catch (error) {
    logFailure({ requestId, code: 'INVALID_JSON', error });
    return errorResponse({ requestId, code: 'INVALID_JSON' });
  }

  const nom = toTrimmedString(payload.nom);
  const prenom = toTrimmedString(payload.prenom);
  const email = toTrimmedString(payload.email);
  const telephone = toTrimmedString(payload.telephone);
  const message = toTrimmedString(payload.message);
  const turnstileToken = toTrimmedString(payload.turnstileToken);

  const missingFields = [
    ['nom', nom],
    ['prenom', prenom],
    ['email', email],
    ['message', message],
    ['turnstileToken', turnstileToken],
  ]
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missingFields.length > 0) {
    const detail = { missingFields };
    logFailure({ requestId, code: 'MISSING_REQUIRED_FIELDS', detail });
    return errorResponse({ requestId, code: 'MISSING_REQUIRED_FIELDS', detail });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    logFailure({ requestId, code: 'INVALID_EMAIL', detail: { email } });
    return errorResponse({ requestId, code: 'INVALID_EMAIL' });
  }

  let verifyResponse;
  try {
    verifyResponse = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ secret: TURNSTILE_SECRET_KEY, response: turnstileToken }).toString(),
    });
  } catch (error) {
    logFailure({ requestId, code: 'TURNSTILE_NETWORK_ERROR', error });
    return errorResponse({ requestId, code: 'TURNSTILE_NETWORK_ERROR' });
  }

  const verifyData = await readResponseBody(verifyResponse);

  if (!verifyData || typeof verifyData !== 'object') {
    const detail = { status: verifyResponse.status, body: verifyData };
    logFailure({ requestId, code: 'TURNSTILE_INVALID_RESPONSE', detail });
    return errorResponse({ requestId, code: 'TURNSTILE_INVALID_RESPONSE', detail });
  }

  if (!verifyResponse.ok || !verifyData.success) {
    const detail = { status: verifyResponse.status, errors: verifyData['error-codes'] || [] };
    logFailure({ requestId, code: 'TURNSTILE_FAILED', detail });
    return errorResponse({ requestId, code: 'TURNSTILE_FAILED', detail });
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
    logFailure({ requestId, code: 'BREVO_NETWORK_ERROR', error });
    return errorResponse({ requestId, code: 'BREVO_NETWORK_ERROR' });
  }

  const brevoDetails = await readResponseBody(brevoResponse);

  if (!brevoResponse.ok) {
    const code = classifyBrevoError(brevoResponse, brevoDetails);
    const detail = { status: brevoResponse.status, response: brevoDetails };

    logFailure({ requestId, code, detail });
    return errorResponse({ requestId, code, detail });
  }

  return jsonResponse(
    {
      success: true,
      requestId,
      brevo: brevoDetails,
    },
    {
      headers: { 'X-Contact-Request-Id': requestId },
    },
  );
}
