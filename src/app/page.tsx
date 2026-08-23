import { Card } from "@heroui/react";

import { PostCard } from "@/components/post-card";
import { siteConfig } from "@/lib/site";
import { client } from "@/sanity/client";
import { POSTS_QUERY } from "@/sanity/queries";
import type { PostListItem } from "@/sanity/types";

export const revalidate = 60;

export default async function HomePage() {
  const posts = await client.fetch<PostListItem[]>(
    POSTS_QUERY,
    {},
    { next: { revalidate: 60 } },
  );

  return (
    <div>
      <section className="hero-surface border-b border-separator">
        <div className="mx-auto max-w-5xl px-6 pt-20 pb-16 sm:pt-28 sm:pb-20">
          <p className="font-mono text-xs tracking-[0.35em] text-accent uppercase">
            {siteConfig.domain}
          </p>
          <h1 className="mt-4 font-serif text-5xl font-semibold tracking-tight text-balance sm:text-7xl">
            {siteConfig.name}
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-muted">
            {siteConfig.description}
          </p>
        </div>
      </section>

      <section
        aria-label="Daftar tulisan"
        className="mx-auto max-w-5xl px-6 pt-14 pb-24"
      >
        <div className="mb-6 flex items-baseline justify-between gap-4">
          <h2 className="text-sm font-medium tracking-[0.2em] text-muted uppercase">
            Tulisan terbaru
          </h2>
          <span className="text-sm text-muted">{posts.length} tulisan</span>
        </div>

        {posts.length > 0 ? (
          <div className="flex flex-col gap-6">
            {posts.map((post) => (
              <PostCard key={post._id} post={post} />
            ))}
          </div>
        ) : (
          <Card className="border border-dashed border-separator bg-transparent p-10 text-center shadow-none">
            <p className="text-lg font-medium">Belum ada tulisan.</p>
            <p className="mt-2 text-muted">
              Terbitkan post pertama lewat{" "}
              <a
                className="font-medium text-foreground underline decoration-accent/50 underline-offset-4 hover:text-accent"
                href={siteConfig.studioUrl}
                rel="noopener noreferrer"
                target="_blank"
              >
                Sanity Studio
              </a>
              .
            </p>
          </Card>
        )}
      </section>
    </div>
  );
}
