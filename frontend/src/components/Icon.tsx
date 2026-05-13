import { cn } from "@/lib/utils";

interface IconProps {
  name: string;
  className?: string;
  fill?: boolean;
  style?: React.CSSProperties;
}

export function Icon({ name, className, fill, style }: IconProps) {
  return (
    <span
      className={cn("material-symbols-outlined", fill && "fill", className)}
      style={style}
      aria-hidden
    >
      {name}
    </span>
  );
}
