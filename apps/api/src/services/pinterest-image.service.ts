export interface PinterestImageResult {
  id: string;
  title: string;
  imageUrl: string;
  pinUrl: string;
}

const PINTEREST_ORIGIN = 'https://www.pinterest.com';
const MAX_RESULTS = 24;

const decodeHtml = (value: string): string =>
  value
    .replaceAll('\\u002F', '/')
    .replaceAll('\\/', '/')
    .replaceAll('&amp;', '&')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'");

const collectMatches = (html: string, pattern: RegExp): string[] => {
  const matches: string[] = [];
  let match = pattern.exec(html);

  while (match && matches.length < MAX_RESULTS * 4) {
    if (match[1]) {
      matches.push(decodeHtml(match[1]));
    }
    match = pattern.exec(html);
  }

  return matches;
};

export const parsePinterestSearchPage = (
  html: string,
  query: string
): PinterestImageResult[] => {
  const indexedResults: PinterestImageResult[] = [];
  const metadataPattern = /\sm="({&quot;.*?})"/g;
  let metadataMatch = metadataPattern.exec(html);

  while (metadataMatch && indexedResults.length < MAX_RESULTS) {
    try {
      const metadata = JSON.parse(decodeHtml(metadataMatch[1] ?? '')) as {
        murl?: unknown;
        purl?: unknown;
        t?: unknown;
      };
      const imageUrl = typeof metadata.murl === 'string' ? metadata.murl : '';
      const pinUrl = typeof metadata.purl === 'string' ? metadata.purl : '';
      const title = typeof metadata.t === 'string' ? metadata.t : query;

      if (
        imageUrl.startsWith('https://i.pinimg.com/') &&
        !indexedResults.some((item) => item.imageUrl === imageUrl)
      ) {
        const isPinterestPin = /^https:\/\/(?:[a-z0-9-]+\.)?pinterest\.com\/pin\//.test(
          pinUrl
        );
        indexedResults.push({
          id: `pinterest-${indexedResults.length}-${Buffer.from(imageUrl).toString('base64url').slice(-12)}`,
          title,
          imageUrl,
          pinUrl: isPinterestPin
            ? pinUrl
            : `${PINTEREST_ORIGIN}/search/pins/?q=${encodeURIComponent(query)}`
        });
      }
    } catch {
      // Um resultado malformado nÃ£o deve impedir os demais de aparecerem.
    }
    metadataMatch = metadataPattern.exec(html);
  }

  if (indexedResults.length > 0) {
    return indexedResults;
  }

  const imageUrls = (html.match(/https:(?:\\\/|\/){2}i\.pinimg\.com(?:\\\/|\/)[^"'<\s]+/g) ?? [])
    .map(decodeHtml)
    .filter((url) => !url.includes('/75x75_'));
  const pinUrls = collectMatches(html, /"url"\s*:\s*"(\/pin\/\d+\/?)"/g);
  const uniqueImages = [...new Set(imageUrls)];

  return uniqueImages.slice(0, MAX_RESULTS).map((imageUrl, index) => ({
    id: `pinterest-${index}-${Buffer.from(imageUrl).toString('base64url').slice(-12)}`,
    title: `${query} - imagem ${index + 1}`,
    imageUrl,
    pinUrl: pinUrls[index] ? `${PINTEREST_ORIGIN}${pinUrls[index]}` : PINTEREST_ORIGIN
  }));
};

export class PinterestImageService {
  async search(query: string): Promise<PinterestImageResult[]> {
    const pinterestOnlyQuery = `${query} site:pinterest.com/pin`;
    const tokenResponse = await fetch(
      `https://duckduckgo.com/?q=${encodeURIComponent(pinterestOnlyQuery)}`,
      {
        headers: {
          'Accept-Language': 'pt-BR,pt;q=0.9',
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126 Safari/537.36'
        },
        signal: AbortSignal.timeout(8000)
      }
    );

    if (!tokenResponse.ok) {
      throw new Error(`A pesquisa respondeu com status ${tokenResponse.status}`);
    }

    const tokenHtml = await tokenResponse.text();
    const token = tokenHtml.match(/vqd=['"]([\d-]+)['"]/)?.[1];
    if (!token) {
      throw new Error('A pesquisa nÃ£o forneceu um token temporÃ¡rio.');
    }

    const searchUrl = `https://duckduckgo.com/i.js?l=br-pt&o=json&q=${encodeURIComponent(pinterestOnlyQuery)}&vqd=${encodeURIComponent(token)}&f=,,,&p=1`;
    const response = await fetch(searchUrl, {
      headers: {
        Accept: 'application/json',
        'Accept-Language': 'pt-BR,pt;q=0.9',
        Referer: 'https://duckduckgo.com/',
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126 Safari/537.36'
      },
      signal: AbortSignal.timeout(8000)
    });

    if (!response.ok) {
      throw new Error(`A pesquisa de imagens respondeu com status ${response.status}`);
    }

    const payload = (await response.json()) as {
      results?: Array<{
        image?: unknown;
        title?: unknown;
        url?: unknown;
      }>;
    };

    const results: PinterestImageResult[] = [];
    for (const item of payload.results ?? []) {
      const imageUrl = typeof item.image === 'string' ? item.image : '';
      const pinUrl = typeof item.url === 'string' ? item.url : '';
      const title = typeof item.title === 'string' ? item.title : query;
      const isPinterestPin = /^https:\/\/(?:[a-z0-9-]+\.)?pinterest\.com\/pin\//.test(
        pinUrl
      );

      if (
        imageUrl.startsWith('https://i.pinimg.com/') &&
        isPinterestPin &&
        !results.some((result) => result.imageUrl === imageUrl)
      ) {
        results.push({
          id: `pinterest-${results.length}-${Buffer.from(imageUrl).toString('base64url').slice(-12)}`,
          title,
          imageUrl,
          pinUrl
        });
      }

      if (results.length >= MAX_RESULTS) {
        break;
      }
    }

    return results;
  }
}
