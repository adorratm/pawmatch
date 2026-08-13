import { HomeLanding } from '@/components/HomeLanding';
import { getWebConfig } from '@/lib/public-api';

export default async function HomePage() {
  const config = await getWebConfig();
  return <HomeLanding config={config} />;
}
