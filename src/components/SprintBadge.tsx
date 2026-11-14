import { Badge } from "@/components/ui/Primitives";
import { sprintInfo } from "@/lib/sprint";

type P = Parameters<typeof sprintInfo>[0];

export default function SprintBadge({ project }: { project: P }) {
  const info = sprintInfo(project);
  const tone = info.state === "delivered" ? "ok" : info.state === "expired" ? "error" : info.state === "last-week" ? "warn" : "neutral";
  return <Badge tone={tone}>{info.label}</Badge>;
}
