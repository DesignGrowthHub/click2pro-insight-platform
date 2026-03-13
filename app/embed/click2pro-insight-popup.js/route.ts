import { buildBlogPopupEmbedScript } from "@/lib/blog-popup/embed-script";

export const dynamic = "force-static";
export const revalidate = 3600;

export function GET() {
  return new Response(buildBlogPopupEmbedScript(), {
    headers: {
      "Content-Type": "application/javascript; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600"
    }
  });
}
