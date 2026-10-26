import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PROJECT_DATA } from '@/lib/data';
import { getProjectDetail } from '@/lib/project-details';
import ProjectDetailView from '@/components/ProjectDetail';

interface Params {
  params: { slug: string };
}

/** Every project page is known at build time, so all of them prerender. */
export function generateStaticParams() {
  return PROJECT_DATA.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: Params): Metadata {
  const project = PROJECT_DATA.find((p) => p.slug === params.slug);
  const detail = getProjectDetail(params.slug);

  if (!project || !detail) {
    return { title: 'Project not found — Aadish Jain' };
  }

  const title = `${project.title} — Aadish Jain`;

  return {
    title,
    description: project.description,
    openGraph: {
      title,
      description: project.description,
      type: 'article',
      images: [{ url: project.image, alt: project.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: project.description,
    },
  };
}

export default function ProjectPage({ params }: Params) {
  // Only the slug crosses into the client component. PROJECT_DATA carries
  // Lucide icon components on `tech`, and React functions cannot be
  // serialised across the server/client boundary — so the client resolves
  // its own row instead of receiving it as a prop.
  const exists =
    PROJECT_DATA.some((p) => p.slug === params.slug) && Boolean(getProjectDetail(params.slug));

  if (!exists) notFound();

  return <ProjectDetailView slug={params.slug} />;
}
