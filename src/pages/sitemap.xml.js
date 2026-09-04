import { getPublishedPosts, getPostUrl, SITE_URL } from '../lib/blog';

function getPostLastMod(post) {
  return post.data.updatedDate ?? post.data.pubDate;
}

function getLatestLastMod(posts) {
  if (posts.length === 0) return undefined;

  return new Date(
    Math.max(...posts.map((post) => getPostLastMod(post).getTime()))
  ).toISOString();
}

function escapeXml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function GET() {
  const posts = await getPublishedPosts();

  // Slash final partout : le build genere des dossiers (/fr/pricing/index.html),
  // donc l'URL canonique porte le slash. Sans lui le sitemap declarait une
  // seconde URL pour la meme page.
  const urls = [
    { loc: '/fr/' },
    { loc: '/fr/pricing/' },
    { loc: '/fr/contact/' },
    {
      loc: '/fr/posts/',
      lastmod: getLatestLastMod(posts),
    },
  ];

  // Ni pages de tags ni pagination : elles sont en noindex (listes quasi
  // dupliquees d'un tag a l'autre) et n'ont rien a faire dans le sitemap.
  // /fr/mentions-legales est volontairement absent, la page est en noindex.

  // Articles individuels
  for (const post of posts) {
    urls.push({
      loc: getPostUrl(post),
      lastmod: getPostLastMod(post).toISOString(),
    });
  }

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map((url) => {
    const loc = escapeXml(new URL(url.loc, SITE_URL).toString());

    return `  <url>
    <loc>${loc}</loc>${
      url.lastmod ? `\n    <lastmod>${url.lastmod}</lastmod>` : ''
    }
  </url>`;
  })
  .join('\n')}
</urlset>`;

  return new Response(body, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
}