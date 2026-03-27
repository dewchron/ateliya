import { ScrollViewStyleReset } from 'expo-router/html';
import type { PropsWithChildren } from 'react';

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />

        {/* Primary Meta */}
        <title>Ateliya</title>
        <meta
          name="description"
          content="Your wardrobe unlocked!"
        />

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://ateliya.in/" />
        <meta property="og:title" content="Ateliya" />
        <meta
          property="og:description"
          content="Your wardrobe unlocked!"
        />
        <meta property="og:image" content="https://ateliya.in/og-image.jpg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />

        {/* Twitter / X */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Ateliya" />
        <meta
          name="twitter:description"
          content="Your wardrobe unlocked!"
        />
        <meta name="twitter:image" content="https://ateliya.in/og-image.jpg" />

        <ScrollViewStyleReset />
      </head>
      <body>{children}</body>
    </html>
  );
}
