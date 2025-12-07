import Home from "@/components/Home";
import type { Metadata } from "next";

type Params = {
  slug: string;
};

// 🔹 Generate static paths for all slugs
export async function generateStaticParams() {
  return [{ slug: "nezo007" }, { slug: "nezo008" }, { slug: "76" }];
}

// 🔹 Meta tags
export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const data = await import(`@/json/${slug}.json`);

  return {
    title: data.metaTitle,
    description: data.metaDescription,
    openGraph: {
      title: data.metaTitle,
      description: data.metaDescription,
      images: [data.metaImage],
    },
  };
}

export default async function Page({ params }: { params: Params }) {
  const { slug } = await params;

  return (
    <div>
      <p>Slug: {slug}</p>
      <p>Language: default</p>

      <Home lang="default" slug={slug} />
    </div>
  );
}
