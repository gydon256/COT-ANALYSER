import { getErrorMessage } from "@/lib/errors";

export async function fetchCftcPublicFile(url: string) {
  const parsedUrl = new URL(url);

  if (!isAllowedCftcHost(parsedUrl.hostname)) {
    throw new Error("Only public CFTC URLs are supported.");
  }

  const response = await fetchCftc(parsedUrl, "text/plain,text/csv,*/*");

  if (!response.ok) {
    throw new Error(`CFTC request failed with ${response.status}.`);
  }

  return response.text();
}

export async function fetchCftcJson<T>(url: string) {
  const parsedUrl = new URL(url);

  if (!isAllowedCftcHost(parsedUrl.hostname)) {
    throw new Error("Only public CFTC URLs are supported.");
  }

  const response = await fetchCftc(parsedUrl, "application/json");

  if (!response.ok) {
    throw new Error(`CFTC request failed with ${response.status}.`);
  }

  return response.json() as Promise<T>;
}

async function fetchCftc(parsedUrl: URL, accept: string) {
  try {
    return await fetch(parsedUrl, {
      cache: "no-store",
      headers: { accept }
    });
  } catch (error) {
    throw new Error(`CFTC request failed: ${getErrorMessage(error, "network request failed")}`);
  }
}

function isAllowedCftcHost(hostname: string) {
  const normalized = hostname.toLowerCase();
  return normalized === "cftc.gov" || normalized.endsWith(".cftc.gov");
}
