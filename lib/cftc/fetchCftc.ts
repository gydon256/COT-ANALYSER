export async function fetchCftcPublicFile(url: string) {
  const parsedUrl = new URL(url);

  if (!isAllowedCftcHost(parsedUrl.hostname)) {
    throw new Error("Only public CFTC URLs are supported.");
  }

  const response = await fetch(parsedUrl, {
    cache: "no-store",
    headers: {
      accept: "text/plain,text/csv,*/*"
    }
  });

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

  const response = await fetch(parsedUrl, {
    cache: "no-store",
    headers: {
      accept: "application/json"
    }
  });

  if (!response.ok) {
    throw new Error(`CFTC request failed with ${response.status}.`);
  }

  return response.json() as Promise<T>;
}

function isAllowedCftcHost(hostname: string) {
  const normalized = hostname.toLowerCase();
  return normalized === "cftc.gov" || normalized.endsWith(".cftc.gov");
}
