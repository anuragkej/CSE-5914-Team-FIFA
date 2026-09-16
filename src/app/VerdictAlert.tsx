import type { VariantProps } from "class-variance-authority";
import { Info, ShieldAlert, ShieldCheck, TriangleAlert, type LucideIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle, alertVariants } from "@/components/ui/alert";
import type { Verdict, VerdictTone } from "@/domain/types";

type AlertVariant = NonNullable<VariantProps<typeof alertVariants>["variant"]>;

const TONES: Record<VerdictTone, { variant: AlertVariant; icon: LucideIcon }> = {
  stop: { variant: "destructive", icon: ShieldAlert },
  caution: { variant: "warning", icon: TriangleAlert },
  clear: { variant: "success", icon: ShieldCheck },
  incomplete: { variant: "default", icon: Info },
};

export function VerdictAlert({ verdict }: { verdict: Verdict }) {
  const { variant, icon: Icon } = TONES[verdict.tone];
  return (
    <Alert variant={variant} className="gap-1 px-5 py-4">
      <Icon className="size-5" />
      <AlertTitle className="text-lg font-semibold">{verdict.headline}</AlertTitle>
      <AlertDescription className="text-base">{verdict.summary}</AlertDescription>
    </Alert>
  );
}
