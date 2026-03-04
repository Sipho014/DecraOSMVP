import { IntegrationProvider } from '@prisma/client';

import { decryptSecret, encryptSecret } from '@/lib/crypto';
import { prisma } from '@/lib/prisma';

export async function upsertShopifyConnection(input: {
  shopDomain: string;
  accessToken: string;
  scopes: string;
}) {
  const shop = await prisma.shop.upsert({
    where: { shopDomain: input.shopDomain },
    create: {
      shopDomain: input.shopDomain,
      installedAt: new Date(),
    },
    update: {
      installedAt: new Date(),
    },
  });

  await prisma.integrationToken.upsert({
    where: { provider_shopId: { provider: IntegrationProvider.SHOPIFY, shopId: shop.id } },
    create: {
      provider: IntegrationProvider.SHOPIFY,
      shopId: shop.id,
      scopes: input.scopes,
      tokenEnc: encryptSecret(input.accessToken),
    },
    update: {
      scopes: input.scopes,
      tokenEnc: encryptSecret(input.accessToken),
    },
  });

  return shop;
}

export async function getShopifyAccessToken(shopDomain: string) {
  const shop = await prisma.shop.findUnique({
    where: { shopDomain },
    include: { tokens: true },
  });
  if (!shop) return null;

  const tokenRow = shop.tokens.find((t) => t.provider === IntegrationProvider.SHOPIFY);
  if (!tokenRow) return null;

  return {
    shop,
    accessToken: decryptSecret(tokenRow.tokenEnc),
    scopes: tokenRow.scopes,
  };
}
