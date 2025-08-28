import { prisma } from "@/lib/db";

export default async function CatalogPage({ params }: { params: { org: string } }) {
  const orgId = params.org;
  const products = await prisma.product.findMany({ where: { orgId } });
  return (
    <div>
      <h2>Catalog</h2>
      <ul>
        {products.map(p => (
          <li key={p.id}>{p.name} ({p.sku}) — {p.uom}</li>
        ))}
      </ul>
      <p><a href={`/${orgId}/order`}>Place an order</a></p>
    </div>
  );
}
