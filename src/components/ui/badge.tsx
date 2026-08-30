import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-1 text-[0.6875rem] font-medium tracking-wide uppercase",
  {
    variants: {
      variant: {
        default: "bg-elevated text-muted shadow-[var(--shadow-border)]",
        accent: "bg-accent text-accent-fg",
        go: "bg-go/15 text-go",
        hold: "bg-hold/15 text-hold",
        fail: "bg-fail/15 text-fail",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
