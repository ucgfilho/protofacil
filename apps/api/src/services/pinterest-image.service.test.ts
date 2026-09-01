import { afterEach, describe, expect, it, vi } from 'vitest';
import { PinterestImageService, parsePinterestSearchPage } from './pinterest-image.service.js';

afterEach(() => vi.unstubAllGlobals());

describe('parsePinterestSearchPage', () => {
  it('extrai imagens pÃºblicas e remove duplicadas', () => {
    const html = `
      <a class="iusc" m="{&quot;murl&quot;:&quot;https://i.pinimg.com/736x/aa/foto.jpg&quot;,&quot;purl&quot;:&quot;https://br.pinterest.com/pin/12345/&quot;,&quot;t&quot;:&quot;Flor rosa&quot;}"></a>
      <a class="iusc" m="{&quot;murl&quot;:&quot;https://i.pinimg.com/736x/aa/foto.jpg&quot;,&quot;purl&quot;:&quot;https://br.pinterest.com/pin/12345/&quot;,&quot;t&quot;:&quot;Duplicada&quot;}"></a>
      <a class="iusc" m="{&quot;murl&quot;:&quot;https://i.pinimg.com/736x/bb/outra.jpg&quot;,&quot;purl&quot;:&quot;https://www.pinterest.com/pin/67890/&quot;,&quot;t&quot;:&quot;Campo de flores&quot;}"></a>
    `;

    const result = parsePinterestSearchPage(html, 'flores');

    expect(result).toHaveLength(2);
    expect(result[0]?.imageUrl).toBe('https://i.pinimg.com/736x/aa/foto.jpg');
    expect(result[0]?.title).toBe('Flor rosa');
  });

  it('busca somente imagens e links de Pins relacionados ao termo', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response(`<script>vqd='123-456'</script>`))
      .mockResolvedValueOnce(
        Response.json({
          results: [
            {
              image: 'https://i.pinimg.com/736x/aa/flor.jpg',
              url: 'https://br.pinterest.com/pin/123/',
              title: 'Flor amarela'
            },
            {
              image: 'https://outro-site.com/foto.jpg',
              url: 'https://outro-site.com/pagina',
              title: 'Resultado externo'
            }
          ]
        })
      );
    vi.stubGlobal('fetch', fetchMock);

    const result = await new PinterestImageService().search('flor');

    expect(result).toHaveLength(1);
    expect(result[0]?.title).toBe('Flor amarela');
    expect(fetchMock.mock.calls[0]?.[0]).toContain('flor%20site%3Apinterest.com%2Fpin');
  });
});
