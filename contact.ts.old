type EnvKey = 'BREVO_API_KEY' | 'BREVO_FROM_EMAIL' | 'BREVO_FROM_NAME' | 'CONTACT_TO_EMAIL' | 'TURNSTILE_SECRET_KEY';

type Env = Partial<Record<EnvKey, string>>;

interface ProcessLike {
  env?: Partial<Record<EnvKey, string>>;
}

interface GlobalWithProcess {
  process?: ProcessLike;
}

interface ContactPayload {
  nom?: unknown;
  prenom?: unknown;
  email?: unknown;
  telephone?: unknown;
  message?: unknown;
  turnstileToken?: unknown;
}

interface TurnstileVerifyResponse {
  success?: boolean;
  'error-codes'?: string[];
}

interface PagesFunctionContext {
  request: Request;
  env: Env;
}

const jsonResponse = (body: Record<string, unknown>, init?: ResponseInit) =>
  new Response(JSON.stringify(body), {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  });

const toTrimmedString = (value: unknown) => (typeof value === 'string' ? value.trim() : '');

const getEnvValue = (env: Env, key: EnvKey) =>
  env[key] || (globalThis as GlobalWithProcess).process?.env?.[key] || '';

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

export async function onRequest({ request, env }: PagesFunctionContext) {
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

  let payload: ContactPayload;
  try {
    payload = (await request.json()) as ContactPayload;
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