# ConsoAlert

Site public statique construit avec Astro, hébergé sur Cloudflare Pages.

## Architecture

- Frontend statique Astro
- Cloudflare Turnstile pour protéger le formulaire de contact
- Cloudflare Pages Functions pour traiter le formulaire `/contact`
- Envoi d'email via l'API Brevo (`/v3/smtp/email`)
- Secrets stockés localement dans `.env` et en secret Cloudflare en production

## Stack

- Astro 5.x
- Cloudflare Pages
- Cloudflare Turnstile
- Brevo SMTP API
- JavaScript natif côté client

## Fonctionnement du formulaire

1. L'utilisateur remplit le formulaire de contact en français.
2. Cloudflare Turnstile vérifie qu'il ne s'agit pas d'un bot.
3. Le frontend envoie les données au point d'entrée `POST /contact`.
4. La fonction Cloudflare Pages (`functions/contact.ts`) :
   - vérifie le token Turnstile côté serveur
   - envoie l'email via Brevo
   - renvoie un statut clair au client

## Fichiers importants

- `src/pages/fr/contact.astro` : page de contact, validatons client, widget Turnstile
- `functions/contact.ts` : fonction serveur Cloudflare pour validation et envoi Brevo
- `.env.example` : exemples de variables d'environnement

## Variables d'environnement

Copiez `.env.example` en `.env` en local et définissez les vraies valeurs.

- `PUBLIC_TURNSTILE_SITE_KEY` : clé publique Cloudflare Turnstile exposée côté client
- `TURNSTILE_SECRET_KEY` : clé secrète Cloudflare Turnstile côté serveur
- `BREVO_API_KEY` : clé API Brevo
- `BREVO_FROM_EMAIL` : adresse expéditrice pour Brevo
- `BREVO_FROM_NAME` : nom de l'expéditeur Brevo
- `CONTACT_TO_EMAIL` : adresse destinataire des messages de contact

## Installation et développement

```sh
npm install
npm run dev
```

Le formulaire de contact fonctionne en local si vous avez défini les variables d'environnement nécessaires.

## Déploiement Cloudflare Pages

- Déployez le site sur Cloudflare Pages
- Ajoutez les variables d'environnement à la configuration de votre projet Cloudflare Pages
- `PUBLIC_TURNSTILE_SITE_KEY` doit être disponible côté build / client
- `TURNSTILE_SECRET_KEY`, `BREVO_API_KEY`, `BREVO_FROM_EMAIL`, `BREVO_FROM_NAME`, `CONTACT_TO_EMAIL` doivent être traitées comme des secrets

## Bonnes pratiques

- Ne jamais committer `.env`
- Préférer les secrets Cloudflare Pages en production
- Conserver `PUBLIC_TURNSTILE_SITE_KEY` uniquement sur les pages qui utilisent le widget
- Vérifier que l'expéditeur Brevo est bien autorisé pour `BREVO_FROM_EMAIL`

## Commandes utiles

| Command | Action |
| --- | --- |
| `npm install` | Installe les dépendances |
| `npm run dev` | Lance le serveur de développement |
| `npm run build` | Génère le site de production |
| `npm run preview` | Prévisualise le build localement |
