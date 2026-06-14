import Image from "next/image";
import { cn } from "@/lib/utils";
import type { CertificationId } from "@/types/quiz";

interface BrandLockupProps {
  className?: string;
  size?: "hero" | "compact";
  priority?: boolean;
  certId?: CertificationId;
}

const VENDOR_LABELS: Partial<Record<string, { label: string; color: string }>> = {
  servicenow: { label: "ServiceNow", color: "text-sn-green" },
  kubernetes: { label: "Kubernetes", color: "text-k8s-blue" },
  aws: { label: "AWS", color: "text-aws-orange" },
  gcp: { label: "Google Cloud", color: "text-gcp-blue" },
  azure: { label: "Azure", color: "text-azure-blue" },
  itil: { label: "ITIL 4", color: "text-itil-purple" },
  anthropic: { label: "Anthropic", color: "text-anthropic-orange" },
};

function getVendor(certId?: CertificationId): string | undefined {
  if (!certId) return undefined;
  if (certId.startsWith("servicenow")) return "servicenow";
  if (certId.startsWith("k8s")) return "kubernetes";
  if (certId.startsWith("aws")) return "aws";
  if (certId.startsWith("gcp")) return "gcp";
  if (certId.startsWith("azure")) return "azure";
  if (certId.startsWith("itil")) return "itil";
  if (certId === "ccaf") return "anthropic";
  return undefined;
}

export function BrandLockup({
  className,
  size = "compact",
  priority = false,
  certId,
}: BrandLockupProps) {
  const logoHeight = size === "hero" ? 48 : 32;
  const fontSize = size === "hero" ? "text-2xl" : "text-lg";

  const vendor = getVendor(certId);
  const vendorMeta = vendor ? VENDOR_LABELS[vendor] : undefined;

  if (vendorMeta) {
    return (
      <div className={cn("flex items-center gap-1.5", className)}>
        <span className={cn("font-bold tracking-tight", fontSize, "text-foreground")}>
          Cert Practice
        </span>
        <span className="font-light text-muted-foreground/60 text-xl">×</span>
        <span className={cn("font-bold tracking-tight", fontSize, vendorMeta.color)}>
          {vendorMeta.label}
        </span>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className={cn("font-bold tracking-tight", fontSize, "text-foreground")}>
        Cert Practice
      </span>
      <span className="text-muted-foreground/40 font-light text-xl">|</span>
      <Image
        src="/brand/datadog-icon.svg"
        alt="Datadog"
        width={logoHeight}
        height={logoHeight}
        priority={priority}
        className="h-auto object-contain"
        style={{ height: logoHeight, width: "auto" }}
      />
    </div>
  );
}
