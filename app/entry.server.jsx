import {RemixServer} from '@remix-run/react';
import isbot from 'isbot';
import {renderToReadableStream} from 'react-dom/server';
import {createContentSecurityPolicy} from '@shopify/hydrogen';

/**
 * @param {Request} request
 * @param {number} responseStatusCode
 * @param {Headers} responseHeaders
 * @param {EntryContext} remixContext
 * @param {AppLoadContext} context
 */
export default async function handleRequest(
  request,
  responseStatusCode,
  responseHeaders,
  remixContext,
  context,
) {
  const {nonce, header, NonceProvider} = createContentSecurityPolicy({
    shop: {
      checkoutDomain: context.env.PUBLIC_CHECKOUT_DOMAIN,
      storeDomain: context.env.PUBLIC_STORE_DOMAIN,
    },
    imgSrc: [
      "'self'",
      'https://cdn.shopify.com',
      `https://${context.env.CDN_DOMAIN}`,
      'cdn.weatherapi.com',
    ],
    fontSrc: [
      "'self'",
      'data:',
      `https://${context.env.CDN_DOMAIN}`,
      'https://shopify.com',
    ],
    mediaSrc: [
      "'self'",
      `https://${context.env.CDN_DOMAIN}`,
      'https://shopify.com',
    ],
    connectSrc: [
      "'self'",
      `https://${context.env.CDN_DOMAIN}`,
      'https://shopify.com',
      'http://ipwho.is',
      'http://api.weatherapi.com',
      'https://ipapi.co',
      'https://api.findip.net',
    ],
    frameSrc: ["'self'", 'https://www.youtube.com/'],
    defaultSrc: ["'self'", 'https://com.us10.list-manage.com'],
  });

  const body = await renderToReadableStream(
    <NonceProvider>
      <RemixServer context={remixContext} url={request.url} />
    </NonceProvider>,
    {
      nonce,
      signal: request.signal,
      onError(error) {
        // eslint-disable-next-line no-console
        console.error(error);
        responseStatusCode = 500;
      },
    },
  );

  if (isbot(request.headers.get('user-agent'))) {
    await body.allReady;
  }

  responseHeaders.set('Content-Type', 'text/html');
  responseHeaders.set('Content-Security-Policy', header);

  return new Response(body, {
    headers: responseHeaders,
    status: responseStatusCode,
  });
}

/** @typedef {import('@shopify/remix-oxygen').EntryContext} EntryContext */
/** @typedef {import('@shopify/remix-oxygen').AppLoadContext} AppLoadContext */
