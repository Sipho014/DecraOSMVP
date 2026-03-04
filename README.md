# DecraOS MVP

DecraOS is a decision-support system for Shopify e-commerce operators.

## Goal
Generate a daily **Morning Execution Briefing** by combining:
- Shopify revenue & order data
- Meta Ads performance (spend, results)

The briefing should translate performance data into prioritized actions such as:
- **Scale**
- **Hold**
- **Kill**
- **Test**

## Getting started

```bash
npm install
npm run dev
```

Then open http://localhost:3000

## Notes
- Prisma is configured (see `prisma/schema.prisma`), but a live DB connection is not required yet.
- Integrations live in:
  - `src/integrations/shopify`
  - `src/integrations/meta`
