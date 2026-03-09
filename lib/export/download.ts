import { toPng } from "html-to-image";

interface PostEntry {
  id: string;
  filename?: string;
}

export async function downloadPostsAsZip(
  postRefs: Map<string, HTMLDivElement>,
  selectedIds: string[],
  posts: PostEntry[],
  zipFilename: string,
): Promise<void> {
  const JSZip = (await import("jszip")).default;
  const zip = new JSZip();

  for (let i = 0; i < selectedIds.length; i++) {
    const id = selectedIds[i];
    const container = postRefs.get(id);
    if (!container) continue;
    const postEl = container.querySelector('.post-wrapper') as HTMLElement;
    if (!postEl) continue;
    const dataUrl = await toPng(postEl, {
      pixelRatio: 2,
      cacheBust: true,
      skipFonts: true,
    });
    const base64 = dataUrl.split(",")[1];
    const post = posts.find(p => p.id === id);
    zip.file(`${i + 1}-${post?.filename || id}.png`, base64, { base64: true });
  }

  const blob = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.download = zipFilename;
  link.href = url;
  link.click();
  URL.revokeObjectURL(url);
}
