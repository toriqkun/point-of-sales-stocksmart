import { getLandingStats } from "@/app/actions/stats";
import { LandingContent } from "./LandingContent";

export default async function LandingPage() {
  const statsRes = await getLandingStats();
  
  const stats = {
    ownerCount: statsRes.success ? statsRes.ownerCount : 0,
    recentAvatars: statsRes.success ? statsRes.recentAvatars : []
  };

  return <LandingContent initialStats={stats} />;
}
