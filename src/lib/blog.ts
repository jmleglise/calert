import { getCollection, type CollectionEntry } from 'astro:content';

export const SITE_URL = 'https://www.consoalert.com';
export const POSTS_PER_PAGE = 6;

export type BlogPost = CollectionEntry<'blog'>;
export type BlogTag = {
  name: string;
  slug: string;
  count: number;
};

const collator = new Intl.Collator('fr', { sensitivity: 'base' });

export function slugify(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/&/g, ' et ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function getPublishedPosts() {
  const posts = await getCollection('blog', ({ data }) => !data.draft && data.language === 'fr');

  return posts.sort((a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime());
}

export function getPostSlug(post: BlogPost) {
  return post.data.canonicalSlug ?? post.slug;
}

export function getPostUrl(post: BlogPost) {
  return `/fr/posts/${getPostSlug(post)}/`;
}

export function getAbsoluteUrl(path: string) {
  return new URL(path, SITE_URL).toString();
}

export function getReadingTime(post: BlogPost) {
  const words = post.body.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 220));
}

export function formatDate(date: Date) {
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

export function getAllTags(posts: BlogPost[]): BlogTag[] {
  const map = new Map<string, BlogTag>();

  for (const post of posts) {
    for (const tag of post.data.tags) {
      const slug = slugify(tag);
      const existing = map.get(slug);

      if (existing) {
        existing.count += 1;
      } else {
        map.set(slug, { name: tag, slug, count: 1 });
      }
    }
  }

  return [...map.values()].sort((a, b) => b.count - a.count || collator.compare(a.name, b.name));
}

export function getTrendingTags(posts: BlogPost[], limit = 12) {
  return getAllTags(posts).slice(0, limit);
}

export function getPostsByTag(posts: BlogPost[], tagSlug: string) {
  return posts.filter((post) => post.data.tags.some((tag) => slugify(tag) === tagSlug));
}

export function paginate<T>(items: T[], page = 1, perPage = POSTS_PER_PAGE) {
  const totalPages = Math.max(1, Math.ceil(items.length / perPage));
  const currentPage = Math.min(Math.max(page, 1), totalPages);
  const start = (currentPage - 1) * perPage;

  return {
    items: items.slice(start, start + perPage),
    currentPage,
    totalPages,
    hasPrevious: currentPage > 1,
    hasNext: currentPage < totalPages,
  };
}

export function getPaginationUrl(basePath: string, page: number) {
  const normalizedBase = basePath.endsWith('/') ? basePath : `${basePath}/`;
  return page === 1 ? normalizedBase : `${normalizedBase}${page}/`;
}
