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

/**
 * Download posts at multiple aspect ratios.
 * Switches ratio via callback, waits for re-render, captures each.
 */
export async function downloadPostsMultiRatio(
  postRefs: Map<string, HTMLDivElement>,
  selectedIds: string[],
  posts: PostEntry[],
  ratios: string[],
  setAspectRatio: (ratio: string) => void,
  onProgress?: (label: string) => void,
): Promise<void> {
  const JSZip = (await import("jszip")).default;
  const zip = new JSZip();

  const useFolders = ratios.length > 1;

  for (const ratio of ratios) {
    const folderName = ratio.replace(":", "x");
    const target = useFolders ? zip.folder(folderName)! : zip;

    // Switch to this ratio and wait for render
    setAspectRatio(ratio);
    onProgress?.(`${folderName}...`);
    await new Promise<void>(resolve => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setTimeout(resolve, 100);
        });
      });
    });

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
      target.file(`${i + 1}-${post?.filename || id}.png`, base64, { base64: true });
    }
  }

  const blob = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.download = `posts-${ratios.map(r => r.replace(":", "x")).join("-")}.zip`;
  link.href = url;
  link.click();
  URL.revokeObjectURL(url);
}
