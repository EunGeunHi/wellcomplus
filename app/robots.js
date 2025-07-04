export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/',
        '/userpage/*/detail*',
        '/admin*',
        '/_next/',
        '/static/',
        '/test*',
        '/manage*',
      ],
    },
    sitemap: 'https://www.okwellcom.com/sitemap.xml',
  };
}
