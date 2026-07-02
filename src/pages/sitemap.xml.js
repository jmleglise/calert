import { getPublishedPosts, getPostUrl, getAllTags, getPostsByTag, SITE_URL, POSTS_PER_PAGE } from '../lib/blog';

export async function GET() {
  const posts = await getPublishedPosts();
  const tags = getAllTags(posts);
  const urls = [
    { loc: '/fr/', priority: '1.0' },
    { loc: '/fr/pricing', priority: '0.8' },
    { loc: '/fr/contact', priority: '0.7' },
    { loc: '/fr/posts/', priority: '0.9' },
  ];

  const listPages = Math.ceil(posts.length / POSTS_PER_PAGE);
  for (let page = 2; page <= listPages; page += 1) {
    urls.push({ loc: `/fr/posts/${page}/`, priority: '0.6' });
  }

  for (const tag of tags) {
    urls.push({ loc: `/fr/posts/${tag.slug}/`, priority: '0.7' });
    const tagPages = Math.ceil(getPostsByTag(posts, tag.slug).length / POSTS_PER_PAGE);
    for (let page = 2; page <= tagPages; page += 1) {
      urls.push({ loc: `/fr/posts/${tag.slug}/${page}/`, priority: '0.5' });
    }
  }

  for (const post of posts) {
    urls.push({ loc: getPostUrl(post), priority: '0.8', lastmod: (post.data.updatedDate ?? post.data.pubDate).toISOString() });
  }

  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((url) => `  <url>\n    <loc>${new URL(url.loc, SITE_URL).toString()}</loc>${url.lastmod ? `\n    <lastmod>${url.lastmod}</lastmod>` : ''}\n    <priority>${url.priority}</priority>\n  </url>`).join('\n')}\n</urlset>`;

  return new Response(body, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
}
