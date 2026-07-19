import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/utils/supabase";
import { ServicePageLayout, type ServicePageData } from "@/components/service-page";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/services/$slug")({
  head: ({ match }) => {
    const slug = match.params.slug;
    const formattedTitle = slug.charAt(0).toUpperCase() + slug.slice(1);
    return {
      meta: [
        { title: `${formattedTitle} — Studio Young Designs` },
        {
          name: "description",
          content: `Bespoke luxury ${slug} design and execution by Studio Young Designs.`,
        },
        { property: "og:url", content: `https://studioyoungdesigns.com/services/${slug}` },
      ],
      links: [{ rel: "canonical", href: `https://studioyoungdesigns.com/services/${slug}` }],
    };
  },
  component: DynamicServicePage,
});

function DynamicServicePage() {
  const { slug } = Route.useParams();

  const {
    data: dbService,
    isLoading,
    error,
  } = useQuery<any>({
    queryKey: ["service_detail", slug],
    queryFn: async () => {
      const { data, error } = await supabase.from("services").select("*").eq("slug", slug).single();
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <Loader2 className="h-10 w-10 animate-spin text-[#cb2026]" />
      </div>
    );
  }

  if (error || !dbService) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-cream text-stone-900">
        <h1 className="font-display text-2xl uppercase tracking-widest text-[#cb2026]">
          Service Not Found
        </h1>
        <p className="text-xs text-stone-400 mt-2">
          The requested Atelier discipline does not exist or has been removed.
        </p>
      </div>
    );
  }

  // Parse features and benefits
  const parsedFeatures = (dbService.features || []).map((f: string, idx: number) => {
    const idxOf = f.indexOf(":");
    if (idxOf === -1) {
      return { title: `Specification 0${idx + 1}`, description: f };
    }
    return {
      title: f.substring(0, idxOf),
      description: f.substring(idxOf + 1),
    };
  });

  const pageData: ServicePageData = {
    slug: dbService.slug,
    title: dbService.title,
    subtitle: dbService.short_desc,
    heroImage: dbService.image_url,
    intro: dbService.title,
    description: dbService.description,
    features: parsedFeatures,
    gallery: [], // Loaded dynamically in ServicePageLayout
    marqueeItems: dbService.benefits || [],
  };

  return <ServicePageLayout data={pageData} />;
}
