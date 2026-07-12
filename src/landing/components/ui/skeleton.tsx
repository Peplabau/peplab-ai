import { cn } from "@/landing/lib/utils"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        "relative overflow-hidden rounded-md bg-[rgba(244,246,250,0.06)] before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.6s_infinite] before:bg-gradient-to-r before:from-transparent before:via-[rgba(244,246,250,0.06)] before:to-transparent",
        className
      )}
      {...props}
    />
  )
}

export { Skeleton }
