# Audit UX / UI : charte, typographie, espacements

Site : consoalert.com (Astro, `src/`). Date : 2026-09-25.
Destinataire : développeur front.

## 0. Méthode

- Lecture intégrale de `src/styles/global.css`, `src/layouts/`, `src/components/`, `src/pages/fr/`, `src/i18n/fr.json`.
- Build local (`npm run build` + `astro preview`) et rendu Chromium via Playwright à 1440×900 et 390×844.
- Mesures automatiques sur le DOM rendu : tailles de police calculées, position horizontale des blocs, débordement horizontal, contraste WCAG 2.1 (formule de luminance relative).
- Comptages statiques par `grep` sur les fichiers `.astro`.

Chaque constat est marqué **[mesuré]** (valeur relevée), **[code]** (lu dans le source) ou **[avis]** (jugement de direction artistique). Niveaux : **bloquant / élevé / moyen / faible**.

Limite : le widget Turnstile n'est pas configuré en local. Les captures de la page contact affichent donc des messages d'erreur absents en production.

---

## 1. Synthèse

| # | Constat | Niveau | Effort |
|---|---|---|---|
| T1 | Titres des cards de l'accueil rendus en police de repli (`'Inter'` au lieu de `'Inter Variable'`) | élevé | 1 ligne |
| L1 | Blog mobile : les cartes d'articles débordent de 62 px et sont coupées à droite | bloquant | 1 ligne |
| L2 | Trois bords gauches différents selon la page (104 / 128 / 130 px à 1440 px) | élevé | faible |
| C1 | 30+ textes sous le seuil de contraste AA (gris `slate-400`, rouge, orange, vert) | élevé | faible |
| C2 | Survol des boutons primaires : texte blanc sur `#7C7AF5` = 3,5:1 (AA non atteint) | élevé | 1 token |
| V1 | Les visuels de 4 cards sur 10 ne correspondent pas à leur titre | élevé | moyen |
| F1 | Champs du formulaire à 15 px : iOS Safari zoome au focus | élevé | 1 ligne |
| T2 | 24 tailles de police différentes, dont 14 en px en dur | moyen | moyen |
| B1 | 5 styles de bouton primaire (2 formes, 4 paddings, 3 tailles de texte) | moyen | moyen |
| R1 | Rayons de carte incohérents : 6 / 14 / 20 / 28 px | moyen | faible |
| X1 | Coquilles et formats numériques non français visibles dans l'interface | moyen | faible |
| I1 | Iconographie mixte : emojis et pictos SVG au trait | moyen | moyen |
| K1 | Tokens contournés : 45 hex, 63 rgba, 162 espacements en px, 22 ombres en dur | moyen | élevé |
| D1 | CSS mort et classes Tailwind orphelines | faible | faible |

Ordre de correction recommandé : section 11.

---

## Statut des corrections

Tous les constats sont traités dans la même PR que ce rapport. Mesures refaites après correction, avec le même script, sur 8 pages (accueil, tarifs, contact, mentions, blog, tag, 2 articles), à 1440 et 390 px.

| Contrôle | Avant | Après |
|---|---|---|
| Débordement horizontal à 390 px | +62 px (blog, tags), +42 px (article théorie), +2 px (article) | 0 sur les 8 pages |
| Bord gauche du contenu à 1440 px | 104 / 128 / 130 px | 128 px partout (header, contenu, footer) |
| Textes sous 4,5:1 (3:1 si grand) | 30+ | 0 |
| Tailles de police calculées (accueil) | 15 | 8, toutes issues de l'échelle |
| `font-size` en px dans les `.astro` | 95 | 0 |
| Polices rendues | Inter Variable + repli système + `system-ui` | Inter Variable (+ mono pour l'URL factice) |
| Emojis affichés dans l'interface | 13 | 0 |
| `box-shadow` en dur | 22 | 5, toutes des anneaux de focus sur tokens |
| Erreurs JS (menu, FAQ, modale, sélecteur, formulaire) | — | 0 |

Correspondance constat → correction :

- **L1, L2, L3, L4** : grilles en `minmax(0, 1fr)`, conteneur unique `.container`, tokens `--header-height`, `--section-y`, `--section-y-sm`. Styles du blog regroupés dans `src/styles/blog.css`.
- **T1 à T5** : échelle unique dans `global.css`, classes `.page-title`, `.section-heading`, `.section-lead`, `.eyebrow` utilisées partout, `--measure` sur les textes longs.
- **C1 à C4** : tokens `--color-text-muted/danger/warning/success/link`, `--color-blurple-hover` → `primary-600`, `--gradient-accent` unique, bouton de don en style secondaire.
- **B1, B2** : composant `.btn` (`--primary`, `--secondary`, `--ghost`, tailles `sm` / `lg` / `block`), focus visible global.
- **R1, R2** : rayons `lg` pour les cartes, `xl` pour modale et formulaire, ombres sur tokens, cartes en `min-height`, lien « En savoir plus » en pied de carte, bouton d'agrandissement neutre.
- **V1** : visuels réaffectés (résidence secondaire → climatisation, VE → recharge nocturne, anomalies → pics anormaux), visuel budget refait (répartition des usages), nouveau visuel « 3 étapes » pour l'activation.
- **V2, V3** : carte du hero réalignée, formats français, bandeau partenaires lisible et libellé corrigé.
- **L6** : carte orpheline en pleine largeur (texte à gauche, visuel à droite), question orpheline de la FAQ tarifs en pleine largeur.
- **F1 à F4** : champs à 16 px, message d'erreur unique, `aria-invalid` / `aria-describedby`, formulaire avant la colonne latérale sur mobile, `aria-pressed` sur le sélecteur de période, `aria-current` dans le header et les tags, temps de lecture affiché, appel à l'action en fin d'article.
- **I1** : composant `src/components/Icon.astro` (SVG au trait, `currentColor`) à la place des emojis.
- **X1** : coquilles et formats numériques corrigés dans `fr.json` et les pages.
- **D1** : CSS mort supprimé, composant `PageHero.astro` commun à tarifs, contact, mentions et blog.

Changements de contenu à valider par le porteur du projet :

- le lien « Accueil » du header est remplacé par « Fonctionnalités » (`/fr/#features`) ;
- le libellé du bandeau partenaires devient « Compatible avec les calendriers de réservation » ;
- sur la carte du hero, « Évaluation du risque » devient « Coût estimé » ;
- la colonne « Qui sommes-nous ? » de la page contact reçoit deux lignes : « Un humain vous répond sous quelques jours » (reprise du bloc commenté existant) et un lien vers la section RGPD ;
- les chiffres du visuel budget (62 / 21 / 17 %, 120 €/an) sont illustratifs, comme ceux des autres maquettes.

Points non traités, hors périmètre du code :

- « Se connecter » et « S'inscrire » pointent toujours vers la même URL `/auth` : cela dépend de l'application ;
- la ressemblance de la palette avec celle de Stripe (C3) est une décision de marque.

---

## 2. Typographie

### T1. Titres de cards en police de repli [code][mesuré] (élevé)

`src/components/Cards.astro:227`

```css
.card-title { font-family: 'Inter', sans-serif; }
```

La `@font-face` déclare la famille `'Inter Variable'` (`global.css:11`). La famille `'Inter'` n'existe pas, sauf si le visiteur l'a installée sur son poste. Le navigateur applique alors `sans-serif`, soit Arial ou Helvetica selon l'OS. Mesure sur le DOM : 10 éléments ont `Inter` comme famille calculée, contre 149 en `Inter Variable`. Sur la capture `docs/audit-ux/cards-visuels.png`, les titres des cards ont un dessin différent du reste de la page.

Correction : supprimer la ligne. `.card-title` hérite alors de `body`.

Même défaut dans `src/pages/fr/mentions-legales.astro:377` : `var(--font-sans, system-ui, sans-serif)`. `--font-sans` n'est pas défini, donc l'adresse e-mail est rendue en `system-ui`. Remplacer par `inherit`.

### T2. Échelle typographique non appliquée [mesuré][code] (moyen)

`global.css` définit 10 tokens de taille (`--font-size-xs` à `--font-size-6xl`) et 4 tokens sémantiques. Les composants les contournent :

| Valeur en dur | Occurrences |
|---|---|
| 13px | 22 |
| 15px | 14 |
| 11px | 14 |
| 14px | 12 |
| 12px | 9 |
| 16px | 8 |
| 24px | 4 |
| 10px, 40px | 3 chacun |
| 22px | 2 |
| 18px, 20px, 28px, 32px | 1 chacun |

À cela s'ajoutent trois `clamp()` locaux : `PostCard.astro:51`, `Cards.astro:1024`, `pricing.astro:419`. Sur la page d'accueil seule, on mesure **15 tailles calculées différentes** : 10, 11, 12, 13, 14, 15, 16, 18, 20, 22, 24, 26, 28, 32, 52 px.

L'écart de 1 px entre 13, 14 et 15 px n'est pas perceptible comme un niveau de hiérarchie. Il est perçu comme une irrégularité.

Échelle cible (8 pas) et correspondance à appliquer :

| Token | Valeur | Remplace |
|---|---|---|
| `--font-size-xs` | 12px | 10, 11, 12 |
| `--font-size-sm` | 14px | 13, 14 |
| `--font-size-base` | 16px | 15, 16 |
| `--font-size-lg` | 18px | 18 |
| `--font-size-xl` | 20px | 20, 22 |
| `--font-size-2xl` | 24px | 24, 26, 28 |
| `--font-size-section-title` | 26→32px | 32 |
| `--font-size-page-title` / `--font-size-hero-title` | 32→48 / 36→52px | inchangé |

Taille minimale de texte : 12 px, y compris dans les maquettes des cards (labels d'axes `.ev-hours`, `.boiler-time-labels`, `.ical-day-label` à 10 px).

Règle de revue : aucune déclaration `font-size` en px dans un `.astro`. Le contrôle se fait par `grep -rnE "font-size:\s*[0-9]" src --include=*.astro`.

### T3. Classes de titres globales définies mais jamais utilisées [code] (moyen)

`global.css:169` `.page-title` et `global.css:179` `.section-heading` ont 0 utilisation. Chaque page redéclare les mêmes 4 à 5 propriétés sous un autre nom :

- H1 de page : `.pricing-headline`, `.contact-headline` (×2, dont mentions légales), `.blog-hero h1`, `.article-header h1`, `h1` dans `posts/index.astro`.
- H2 de section : `.section-title`, `.faq-title` (×2 avec des valeurs différentes), `.legal-title`, `.donation-title`, `.future-title`.

Des valeurs ont déjà divergé : `letter-spacing: -0.03em` en dur au lieu de `var(--tracking-title)` (`pricing.astro:599, 793, 869`), `line-height` de 1.12 / 1.2 / 1.25 selon la page.

Correction : poser `class="page-title"` sur chaque H1 hors hero et `class="section-heading"` sur chaque H2 de section, puis supprimer les règles locales.

### T4. Graisses, interlignage, approche [code] (faible)

- Graisses : 400 / 500 / 600 / 700. Le 700 sert à la fois aux H1, aux montants, aux badges et aux liens d'article (`.article-content a`, `.breadcrumb a`). Réserver 700 aux titres et aux chiffres clés, passer les liens en 600.
- Interlignages en dur : 1, 1.1, 1.12, 1.2, 1.25, 1.35, 1.4, 1.5, 1.6, 1.65 (10 valeurs). Garder 3 tokens : `tight` 1.2 (titres), `normal` 1.5 (UI), `relaxed` 1.7 (texte courant).
- Approche : 7 valeurs. Garder `--tracking-title` (-0.03em) et ajouter `--tracking-caps` (0.08em) pour les libellés en capitales (`.partners-title`, `.plan-label`, `.footer-heading` à 0.05em, `.eyebrow`).

### T5. Longueur de ligne des articles [mesuré] (faible)

`.article-content p` : 18 px dans une colonne d'environ 730 px, soit environ 85 caractères par ligne. La plage de lecture usuelle est de 60 à 75 caractères. Ajouter `max-width: 68ch` aux paragraphes et listes de `.article-content`.

---

## 3. Grille et alignements

### L1. Débordement horizontal du blog sur mobile [mesuré] (bloquant)

À 390 px, `/fr/posts/` a une largeur de document de 452 px (+62 px). `body { overflow-x: hidden }` masque la barre de défilement mais coupe le contenu. Les titres et descriptions des cartes sont tronqués à droite (`docs/audit-ux/mobile-blog-debordement.png`).

Cause [mesuré] : `.blog-shell` et `.post-list` sont des grilles sans `grid-template-columns` sous 980 px. La piste implicite `auto` prend la largeur min-content du plus long titre (« Architecture stochastique… »).

Correction, vérifiée dans le navigateur (le bord droit revient à 366 px) :

```css
.blog-shell,
.post-list { grid-template-columns: minmax(0, 1fr); }
```

À appliquer dans `src/pages/fr/posts/index.astro:78` et `src/pages/fr/posts/[...slug].astro:249`. La page article déborde aussi de 2 px à 390 px. À recontrôler après correction.

### L2. Bords gauches différents selon la page [mesuré] (élevé)

Position horizontale du bord gauche à 1440 px :

| Page | Logo header | H1 / premier bloc | Footer |
|---|---|---|---|
| Accueil | 104 | 104 | 104 |
| Tarifs | 104 | **128** | 104 |
| Contact | 104 | **128** | 104 |
| Mentions légales | 104 | **128** | 104 |
| Blog, article | 104 | **130** | 104 |

Causes [code] :

- Header, footer et sections de l'accueil utilisent chacun leur propre conteneur `max-width: 1280px; padding: 0 var(--spacing-6)`, soit 24 px fixes.
- La classe globale `.container` (`global.css:187`) passe à 32 px puis 48 px de marge selon le breakpoint.
- Le blog utilise `max-width: 1180px` (`posts/index.astro:55`, `[...slug].astro:216`).

Correction : un seul conteneur, la classe `.container`, utilisé partout (Header, Footer, Hero, Partners, Cards, Legal, blog). Supprimer les 7 déclarations locales `max-width: 1280px` et les 2 `1180px`. Pour le blog, conserver une colonne de lecture étroite à l'intérieur du conteneur standard. Ne pas réduire le conteneur lui-même.

### L3. Hauteur du header codée 8 fois [code] (faible)

`72px` apparaît dans `Header.astro:78, 209`, `contact.astro:212`, `pricing.astro:206`, `mentions-legales.astro:188`, et dans les `calc()` du blog. Créer `--header-height: 72px` et l'utiliser partout, y compris pour `scroll-margin-top` (100 px en dur) et `top` des sidebars sticky (96 et 100 px en dur).

### L4. Rythme vertical des sections [code][avis] (moyen)

Paddings verticaux relevés : 96/96 (accueil), 48/48 (partenaires), 96/64 puis 64/64 (tarifs), 96/64 puis 64/96 (contact), 72+80/80 (blog), 72+64/80 (tags). La valeur change d'une page à l'autre pour une même fonction.

Définir deux tokens et s'y tenir :

- `--section-y: clamp(4rem, 8vw, 6rem)` pour les sections standard ;
- `--section-y-sm: clamp(3rem, 5vw, 4rem)` pour les bandeaux (partenaires, hero secondaire).

Contact [mesuré] : environ 450 px entre le bas du header et le formulaire à 1440 px. Le formulaire, action principale de la page, n'apparaît pas au premier écran sur un portable 13". Réduire le hero à `--section-y-sm`.

### L5. Premier titre d'article [mesuré] (faible)

Dans `.article-content`, le premier `h2` garde `margin-top: var(--spacing-10)` (`[...slug].astro:313`). Le vide intérieur est donc de 88 px en haut contre 48 px en bas. Ajouter :

```css
.article-content > :first-child { margin-top: 0; }
```

### L6. Lignes orphelines dans les grilles [mesuré] (moyen)

- Accueil : 10 cards en grille de 3, la dernière est seule sur sa ligne.
- Tarifs : 5 questions en grille de 2, la dernière est seule.

Options : passer à 9 ou 12 cards, élargir la dernière (`grid-column: 1 / -1` avec une mise en page horizontale), ou ajouter une card d'appel à l'action pour compléter la ligne. Pour la FAQ tarifs : 4 ou 6 questions, ou une seule colonne.

---

## 4. Couleur et contraste

### C1. Textes sous le seuil AA [mesuré] (élevé)

Contraste calculé sur fond réel (seuil 4,5:1 sous 24 px, 3:1 au-dessus) :

| Couleur | Usage | Ratio |
|---|---|---|
| `slate-400` #8898AA sur blanc ou slate-50 | `.partners-title`, `.alert-time`, `.plan-label`, `.price-period`, `.plan-footnote`, `.toggle-note`, `.optional-label`, `.donation-micro`, `.mystery-*`, heures des graphes | 2,6 – 2,95 |
| `warning-500` #F59E0B sur slate-50 | `.stat-warning` « 0,5€ / 24h » du hero | 2,03 |
| `success-500` #22C55E | coches `.check`, `.aside-check` | 2,2 – 2,3 |
| #16A34A | `.saving-value`, `.source-status` | 3,0 – 3,3 |
| `error-500` #EF4444 | erreurs de formulaire, astérisque requis | 3,76 |
| #DC2626 sur #FEF2F2 | badges d'alerte des cards | 4,41 |
| #CA8A04 sur jaune | `.donation-aside-micro` | 2,78 |
| `slate-500` sur `slate-900` | `.footer-copyright` | 3,25 |
| blanc sur #F43F5E | jours Airbnb du calendrier | 3,67 |

Correction via tokens de texte dédiés, distincts des couleurs de remplissage :

```css
--color-text-muted:   var(--color-slate-500); /* #697386 : 4,8:1 sur blanc */
--color-text-danger:  #B91C1C;
--color-text-warning: #B45309;
--color-text-success: #15803D;
--color-text-on-dark-muted: var(--color-slate-400); /* 5,3:1 sur slate-900 */
```

Règle : `slate-400` et plus clair ne servent pas au texte sur fond clair. Ils restent autorisés pour les bordures, les pictos décoratifs et les placeholders.

`--color-text-muted` est déjà référencé (`mentions-legales.astro:365`) sans être défini.

### C2. Couleur de survol des boutons [mesuré] (élevé)

`--color-blurple-hover: #7C7AF5` est plus clair que la couleur de base #635BFF. Texte blanc : 4,7:1 au repos, **3,5:1 au survol**. Le bouton perd du contraste pendant l'interaction.

Correction : `--color-blurple-hover: var(--color-primary-600)` (#5248E8, 6,1:1). Supprimer `--color-blurple-icon` (#6A67F3, `Cards.astro:245`), qui est une troisième nuance de violet sans rôle distinct.

### C3. Palette de marque dispersée [code] (moyen)

- Violets hors charte : les SVG du hero et des cards utilisent #6366F1 et #4F46E5 (indigo Tailwind), à côté de #635BFF (`Hero.astro:28-32`, `fr.json` visuel `recharge-ve`). À remplacer par `primary-500` / `primary-700`.
- Deux dégradés pour le même rôle de mot accentué dans un H1 : violet→vert (`pricing.astro:255`), bleu ciel→violet (`contact.astro:261`, `mentions-legales.astro:237`). En choisir un seul et le poser en token `--gradient-accent`.
- Fonds de hero secondaires : #F0EFFF (tarifs), #EDF8FF (contact, mentions). Même remarque.
- Doublons de tokens : `--color-blurple` = `--color-primary-500` ; `--color-text-primary` = `--color-slate-900` ; `--color-body-bg` = `--color-slate-50`. Garder les tokens sémantiques et les faire pointer vers la palette.
- 45 hex distincts et 63 `rgba()` en dur dans les `.astro`.

[avis] La palette reprend à l'identique les couleurs de Stripe (#635BFF, #0A2540, #425466, #F6F9FC). Le commentaire `global.css:22` le mentionne. Effet : l'identité visuelle ressemble à celle d'un autre SaaS. À arbitrer par le porteur du projet (niveau faible).

### C4. Jaune « Buy me a coffee » [avis] (faible)

#FFDD00 introduit une troisième couleur d'accent sur les pages tarifs et contact, en concurrence directe avec le CTA violet d'inscription. Si l'objectif principal est l'inscription, passer le bouton de don en style secondaire (contour ou fond neutre) et garder le jaune pour le seul picto.

---

## 5. Composants

### B1. Boutons [code][mesuré] (moyen)

Relevé des boutons primaires :

| Sélecteur | Rayon | Padding | Taille texte |
|---|---|---|---|
| `.btn-signup` (header) | pilule | 8×20 | 14 |
| `.hero-cta` | pilule | 16×32 | 18 |
| `.modal-cta-btn` | 10 px | 13×28 | 15 |
| `.plan-cta.primary` | 10 px | 13×24 | 15 |
| `.form-submit` | 10 px | 13×28 | 15 |
| `.donation-btn-primary` | 14 px | 14×32 | 16 |

Correction : un composant `.btn` dans `global.css`, avec 2 variantes et 2 tailles :

```css
.btn { display:inline-flex; align-items:center; justify-content:center; gap:var(--spacing-2);
       min-height:44px; padding:0 var(--spacing-6); border-radius:var(--radius-full);
       font-size:var(--font-size-base); font-weight:600; line-height:1;
       transition: background var(--transition-fast), transform var(--transition-fast); }
.btn--primary   { background:var(--color-blurple); color:#fff; }
.btn--primary:hover { background:var(--color-blurple-hover); }
.btn--secondary { background:var(--color-slate-100); color:var(--color-text-primary); }
.btn--lg { min-height:52px; padding:0 var(--spacing-8); font-size:var(--font-size-lg); }
.btn:focus-visible { outline:2px solid var(--color-blurple); outline-offset:2px; }
```

La pilule est retenue parce qu'elle équipe déjà les deux boutons les plus vus (header, hero). La hauteur de 44 px correspond à la cible tactile minimale. Le bouton du header mesure aujourd'hui 37 px [mesuré].

### B2. États de focus [code] (moyen)

Aucune règle `:focus-visible` hors lien d'évitement. `.form-input` supprime l'outline (`contact.astro:530`) et le remplace par une ombre à 10 % d'opacité (`rgba(99,91,255,0.1)`), quasi invisible. Utiliser `box-shadow: 0 0 0 3px var(--color-primary-200)` ou l'outline de `.btn:focus-visible`.

### R1. Rayons et ombres des cartes [code][mesuré] (moyen)

Rayon d'une carte de contenu selon l'endroit :

- `.card` (accueil) : 6 px (`Cards.astro:191`) ;
- `.post-card`, `.aside-block`, `.legal-card`, `.faq-item` tarifs : 14 px ;
- `.faq-item` accueil, `.legal-block`, `.plan-card`, `.form-wrapper`, `.modal-panel` : 20 px ;
- `.article-content`, `.toc-panel`, `.hero-card` : 28 px.

Sur l'article, le panneau « Sommaire » (28 px) est posé au-dessus du panneau « Sujets » (14 px). Les deux sont visibles ensemble.

Correction : `--radius-lg` (14 px) pour toute carte de contenu, `--radius-xl` (20 px) pour modale et formulaire, `--radius-2xl` réservé au hero.

Ombres : 22 `box-shadow` en dur avec des bases de couleur différentes (`rgba(0,0,0,…)` et `rgba(10,37,64,…)`). Utiliser `--shadow-sm` au repos et `--shadow-lg` au survol, calculées sur `--color-slate-900`.

### R2. Card de l'accueil [code][avis] (moyen)

- `height: 480px` fixe (`Cards.astro:198`) avec `-webkit-line-clamp: 4` sur le titre. Un titre plus long est tronqué sans indication. Remplacer par `min-height`.
- Survol : `transform: scale(1.02)` et ombre à 20 % d'opacité. Le texte est rééchantillonné (léger flou) et l'effet est plus marqué que sur le reste du site, où l'on utilise `translateY(-2px)`. Aligner sur `translateY(-2px)` + `--shadow-lg`.
- Toute la carte est cliquable, mais seul le bouton d'agrandissement 36 px est un élément interactif. Le bouton violet plein est l'élément le plus contrasté de la carte et prend le pas sur le titre. Passer le bouton en style neutre (fond `slate-100`, picto `slate-600`) et ajouter un libellé « En savoir plus → » en pied de carte.
- Deux titres par card : `cardTitle` (carte) et `title` (modale) différents dans 5 cas sur 10 (conciergerie, parties-communes, recharge-ve, logements-vacants, activation). Vérifier que c'est voulu.

### V1. Visuels des cards incohérents avec leur titre [code][mesuré] (élevé)

Correspondance relevée dans `fr.json` (`visualClass`) :

| Card | Visuel affiché | Contenu du visuel |
|---|---|---|
| Recharges de véhicules électriques | `visual-savings` | « Sèche-serviette 1000W », « 200€ économisés » |
| Résidence secondaire | `visual-ev` | « Consommation nocturne », barres de recharge VE |
| Détectez les anomalies | `visual-clim` | Consigne 18 °C / extérieur 35 °C (climatisation) |
| Comment ça marche ? En 2 minutes | `visual-fault` | « Court-circuit probable » |

Le visuel VE est sous la card résidence secondaire, et la card VE montre un sèche-serviette. La card « Comment ça marche » devrait montrer les étapes d'activation. Réaffecter `visualClass` et créer un visuel « 3 étapes » pour `activation`.

Autres points des maquettes :

- « ROI en 48h » avec « Abonnement Wattson –€ » contredit la page tarifs, où tout est gratuit.
- Le graphe « +340 % » du visuel anomalies est en rouge sur une jauge verte, orange et rouge. Pas de défaut ici.

### V2. Carte du hero [mesuré] (moyen)

Voir `docs/audit-ux/hero-desktop.png`.

- « Il y a 2 min » passe sur 2 lignes (`.alert-time`). Ajouter `white-space: nowrap`.
- L'avatar et « Villa Tamaris » sont collés et alignés en haut : `.wattson-avatar` n'a ni `align-items: center` ni `gap` (`Hero.astro:196`). Le nom réutilise la classe `.stat-value` (20 px / 700), ce qui lui donne le poids d'un chiffre.
- Le montant d'alerte est en orange à 2,03:1 (voir C1).
- Formats de nombre : « 2.4 kWh » (point) et « 0,5€ » (virgule) dans le même bloc. Voir X1.

### V3. Bandeau partenaires [mesuré][avis] (moyen)

- Logos affichés à 26–40 px de haut, en niveaux de gris à 55 % d'opacité, sous un libellé en capitales `slate-400` à 2,95:1. Le bloc est à peine lisible à 1440 px (voir la capture pleine page).
- Le libellé annonce « compatible avec la plupart des PMS » alors que les logos sont des plateformes de réservation (OTA), pas des PMS. Corriger le libellé : « Compatible avec les calendriers de ».
- Monter l'opacité à 0,8 et la hauteur à 32–44 px. Passer le libellé en `--color-text-muted`.

### F1. Formulaire de contact [code] (élevé sur mobile)

- `.form-input { font-size: 15px }` (`contact.astro:523`). iOS Safari applique un zoom automatique au focus de tout champ sous 16 px. Passer à `var(--font-size-base)`.
- Le libellé « (optionnel) » est à 12 px en `slate-400` (2,95:1).
- Le message d'erreur de formulaire est affiché deux fois en cas d'échec Turnstile : une fois dans `.field-error` à 12 px, une fois dans `.form-error` à 13 px, avec le même texte. N'en garder qu'un.
- `.form-disclaimer` est vide (`contact.astro:174`). Le supprimer, ou y placer la mention RGPD de traitement des données (usage : sous le bouton d'envoi).
- La colonne aside « Qui sommes-nous ? » contient une seule puce. Le bloc paraît vide face au formulaire. Soit l'enrichir (délai de réponse, adresse), soit le supprimer et centrer le formulaire.

### F2. Page tarifs [code][avis] (moyen)

- Le sélecteur Mensuel / Annuel n'a pas d'effet sur les cartes. La note initiale (« Choisissez votre abonnement… ») diffère du texte injecté par le JS pour le même état (« Choisissez votre fréquence de paiement… »). Aligner les deux chaînes.
- Les boutons du sélecteur n'ont pas `aria-pressed`.
- La carte « Un jour » utilise la classe `.plan-card-inactiv`, qui duplique `.plan-card` (18 lignes). La remplacer par `.plan-card.is-disabled`.
- Le 🔒 est affiché dans la pastille verte `.check`. Le vert signifie « inclus ». Utiliser une pastille neutre `slate-100`.
- Le montant « ??,? » est aligné sur la ligne de base avec « € » remonté. Même rendu que les autres cartes. Pas de défaut.

### F3. Blog [code][mesuré] (moyen)

- Classes Tailwind orphelines `grid place-items-center h-40` (`PostCard.astro:17`, `[...slug].astro:154`). Tailwind n'est pas installé. La `div` intermédiaire casse le `gap` de `.post-tags` : les étiquettes ne sont espacées que par l'espace typographique. Supprimer la `div`.
- `.post-meta` et `.article-meta` sont stylés mais absents du markup. Le temps de lecture (`getReadingTime`) est importé et jamais affiché.
- La page liste n'a pas d'« eyebrow » au-dessus du H1, les pages de tag en ont une (`[...slug].astro:183`). Harmoniser.
- Pas de bloc d'appel à l'action en fin d'article (inscription). [avis] C'est le point de conversion du trafic SEO.

### F4. Header [code] (faible)

- Pas d'état actif sur le lien de la page courante. Ajouter `aria-current="page"` et un style (couleur primaire + soulignement déjà défini en `::after`).
- « Se connecter » et « S'inscrire » pointent vers la même URL `/auth`. Si l'application distingue les deux écrans, passer un paramètre.
- Le lien « Accueil » fait doublon avec le logo. [avis] Il peut être retiré au profit de « Fonctionnalités » (`/fr/#features`).

---

## 6. Iconographie (I1) [code][avis] (moyen)

Deux systèmes coexistent :

- des pictos SVG au trait de 1,5 à 2 px (menu, flèches, coches des modales, café) ;
- des emojis : ⚡ (hero), 📬 ✅ ☕ (contact), ☕ 🍕 🚀 🔒 (tarifs), ⚠️ (card budget).

Le rendu des emojis dépend de l'OS : Apple, Google et Microsoft les dessinent différemment. Leur taille et leur couleur ne sont pas contrôlables par le CSS.

Autres points :

- Les coches des tarifs et du contact sont un caractère « ✓ » dans une pastille. Les coches des modales sont en SVG. Utiliser le SVG partout.
- Les deux blocs « Cadre légal » affichent le même picto « couches » (`Legal.astro:18`). Donner un picto distinct à chaque bloc, ou n'en mettre aucun.

Correction : adopter une seule bibliothèque au trait (Lucide ou Heroicons outline, 24 px, trait 1,5 px, `currentColor`) et remplacer les emojis porteurs de sens. Les emojis peuvent rester dans le texte éditorial.

---

## 7. Mouvement [code] (faible)

- Animations infinies : `wiggle` sur les emojis café (tarifs, contact), `pulse` sur les points d'alerte des cards, `pulse-dot`. Le rendu est distrayant à côté d'un formulaire. Les limiter à 2 ou 3 itérations. `prefers-reduced-motion` est déjà géré dans `Layout.astro:185`.
- Durées en dur (0.2s, 0.25s, 0.4s, 0.5s, 0.6s, 0.8s) dans 19 transitions. Utiliser les 3 tokens `--transition-*`.
- La FAQ de l'accueil anime chaque élément en `fadeIn` avec 0,1 s de décalage cumulé : le 9e élément apparaît 0,9 s après le premier. Le décalage n'est pas perçu sous la ligne de flottaison. Le supprimer.

---

## 8. Rédaction visible dans l'interface (X1) [code] (moyen)

Les coquilles réduisent la crédibilité d'un produit qui traite des données de facturation.

| Emplacement | Actuel | Correction |
|---|---|---|
| `fr.json` cards.subtitle | « sérénité.. » | « sérénité. » |
| `fr.json` card activation | « Comment çà marche » | « Comment ça marche » |
| `fr.json` card logements-vacants | « innocupées » | « inoccupées » |
| `fr.json` card conciergerie (modale) | « appareil piegeux » ; « nécessaire . » | « piégeux » ; « nécessaire. » |
| `Hero.astro:54` | « Evaluation du risque » | « Évaluation du risque » |
| `Hero.astro:49` | « Sur-consommation » | « Surconsommation » |
| `pricing.astro:25` | « ni CB . » | « ni CB. » |
| `pricing.astro:145-147` | « parceque », « wattson !!! », « chauffage resta allumé » | « parce que », « Wattson ! », « chauffage resté allumé » |
| `pricing.astro:150` | « pas peu fier » | « pas peu fiers » |
| `pricing.astro:192` | « SAAS payant » | « SaaS payants » |
| `pricing.astro:59` | « ical » | « iCal » |
| `contact.astro:29` | « emails.</strong>C'est » (espace manquant, visible à l'écran) | ajouter une espace |
| `contact.astro:74` | « note seule source » | « notre seule source » |
| `fr.json` legal | « Cadre Légal et Jurisprudence », « L'Intérêt Crucial de la Détection Précoce » | Capitale initiale seule, usage français |

Formats numériques (norme française, espace insécable `&nbsp;` avant l'unité) :

- « 2.4 kWh », « 1.2 kWh », « 8.4 kWh » → « 2,4 kWh » ;
- « 0,5€ » → « 0,50 € » ; « +20€ », « 200€ », « –30€/jour » → « +20 € », « 200 € », « –30 €/jour ».

Créer un helper `formatKwh()` / `formatEur()` basé sur `Intl.NumberFormat('fr-FR')` pour les valeurs générées. Corriger à la main les valeurs figées dans `fr.json`.

---

## 9. Dette CSS (K1, D1) [code]

### K1. Tokens contournés (moyen)

| Catégorie | Valeurs en dur dans les `.astro` |
|---|---|
| Couleurs hex | 45 distinctes |
| `rgba()` | 63 |
| padding / margin / gap en px | 162 |
| `box-shadow` | 22 |
| `transition` avec durée | 19 |
| `max-width` en px | 17 valeurs distinctes |

`Cards.astro` porte à lui seul l'essentiel des px (maquettes). Priorité : les composants d'interface (boutons, cartes, formulaires, titres) d'abord. Les maquettes des cards viennent ensuite.

### D1. CSS mort et doublons (faible)

- `pricing.astro` : `.hero-badge`, `.badge-dot`, `.future-*`, `.mystery-card`, `.mystery-header`, `.mystery-price/amount/cur/period`, `.mystery-features`, `.mystery-text`, `.mystery-disclaimer`, `.plans-footer-note`, `.check-white`, `.plan-tagline code`. Environ 200 lignes sans markup correspondant.
- `contact.astro` : `.hero-badge`, `.badge-dot`, `.aside-cross`, `.aside-muted`. `.response-pills` n'est présent que dans du HTML commenté.
- `mentions-legales.astro` recopie le CSS de la page contact (`.contact-page`, `.contact-hero`, `.hero-badge`, `.contact-headline`, `.headline-accent`…). Extraire un composant `PageHero.astro` (titre, accent, sous-titre) commun à tarifs, contact, mentions et blog.
- `posts/index.astro` redéclare les styles déjà globaux de `[...slug].astro` (`is:global`).
- `.modal-overlay` est défini deux fois avec des valeurs différentes : `Layout.astro:164` (z-index 100, fond slate) et `Cards.astro:917` (z-index 200, fond navy). Garder celle de `Cards.astro`.
- `Layout.astro:137-143` répète `scroll-behavior` et `overflow-x` déjà dans `global.css`.
- `.muted` utilise `!important` et un token absent.

---

## 10. Tokens à ajouter dans `global.css`

```css
:root {
  /* Texte */
  --color-text-muted:   var(--color-slate-500);
  --color-text-danger:  #B91C1C;
  --color-text-warning: #B45309;
  --color-text-success: #15803D;
  --color-blurple-hover: var(--color-primary-600);

  /* Layout */
  --header-height: 72px;
  --container-max: 1280px;
  --section-y:    clamp(4rem, 8vw, 6rem);
  --section-y-sm: clamp(3rem, 5vw, 4rem);
  --measure: 68ch;

  /* Typo */
  --tracking-caps: 0.08em;
  --line-height-relaxed: 1.7;

  /* Accent */
  --gradient-accent: linear-gradient(135deg, var(--color-primary-500) 0%, #0EA5E9 100%);
}
```

---

## 11. Plan de correction

**Lot 1 : correctifs ponctuels (< 1 h)**
1. L1 : `minmax(0, 1fr)` sur les grilles du blog.
2. T1 : supprimer `font-family: 'Inter'` (`Cards.astro:227`) et `--font-sans` (mentions légales).
3. C2 : `--color-blurple-hover` → `primary-600`.
4. F1 : `font-size: var(--font-size-base)` sur `.form-input`.
5. V2 : `nowrap` sur `.alert-time`, `align-items` et `gap` sur `.wattson-avatar`.
6. X1 : coquilles et formats numériques.

**Lot 2 : charte (½ à 1 jour)**
7. C1 : tokens de texte, remplacement de `slate-400` utilisé comme couleur de texte.
8. L2, L3 : conteneur unique `.container` et `--header-height`.
9. T3 : `.page-title` / `.section-heading` sur tous les H1/H2, suppression des doublons.
10. B1, B2 : composant `.btn` et focus visible.
11. R1 : rayons et ombres des cartes.

**Lot 3 : contenu et composants (1 à 2 jours)**
12. V1 : réaffecter les visuels des cards, créer le visuel « activation ».
13. L6, R2 : grille des cards sans orpheline, hauteur minimale, CTA de pied de carte.
14. I1 : remplacer les emojis porteurs de sens par des SVG.
15. Composant `PageHero.astro`, suppression du CSS mort (D1).
16. T2, K1 : migration des tailles et espacements restants vers les tokens.

Contrôle après chaque lot : relancer les mesures de la section 0. Cibles :

- 0 débordement horizontal à 390 px ;
- un seul bord gauche par breakpoint ;
- 0 texte sous 4,5:1 ;
- `grep -cE "font-size:\s*[0-9]"` égal à 0 hors maquettes.

## Annexes

- `docs/audit-ux/mobile-blog-debordement.png` : L1, cartes coupées à 390 px.
- `docs/audit-ux/cards-visuels.png` : T1 (police de repli) et V1 (visuels inversés).
- `docs/audit-ux/hero-desktop.png` : V2 et C1 (hero).
