import { preloadTiktokenEncoding } from "./tiktoken-utils";

self.onmessage = async (event: MessageEvent<{ id: number; text: string }>) => {
  const { id, text } = event.data;
  try {
    const encoding = await preloadTiktokenEncoding();
    self.postMessage({ id, count: text.trim() ? encoding.encode(text).length : 0 });
  } catch {
    self.postMessage({ id, count: Math.ceil(text.length / 3) });
  }
};
