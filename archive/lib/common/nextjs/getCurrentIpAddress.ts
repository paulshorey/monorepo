'use server';

/**
 * Minimal request context for IP resolution. Supports:
 * - Express: pass { getHeader: (n) => req.get(n), ip: req.ip }
 * - Next.js: omit and it uses next/headers when available
 */
export type IpAddressContext = {
  getHeader?: (name: string) => string | undefined;
  ip?: string;
};

export const getCurrentIpAddress = async function (context?: IpAddressContext) {
  'use server';

  let client_ip = '';

  if (context?.getHeader || context?.ip !== undefined) {
    // Non-Next.js (e.g. Express): use passed context
    client_ip =
      context.getHeader?.('x-forwarded-for')?.split(',')[0]?.trim() ||
      context.getHeader?.('remote-addr') ||
      context.ip ||
      '';
  } else {
    // Next.js: use next/headers if in request scope
    try {
      const { headers } = await import('next/headers');
      const headersList = await headers();
      client_ip =
        headersList.get('x-forwarded-for')?.split(',')[0]?.trim() ||
        headersList.get('remote-addr') ||
        '';
    } catch {
      // Called outside Next.js request scope; leave client_ip empty
    }
  }

  let server_ip = '';
  let server_location = '';
  try {
    const response = await fetch('http://ip-api.com/json');
    const address = (await response.json()) as {
      query?: string;
      city?: string;
      regionName?: string;
      country?: string;
    };
    server_ip = address.query || '';
    server_location = `${address.city || ''}, ${address.regionName || ''}, ${address.country || ''}`;
  } catch (error) {
    //
  }

  return {
    client_ip,
    server_ip,
    server_location,
  };
};
