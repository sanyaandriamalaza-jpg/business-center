import { Popover, PopoverContent } from "@/src/components/ui/popover";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  x: number;
  y: number;
  children: React.ReactNode;
}

export function CustomPositionPopover({
  open,
  onOpenChange,
  x,
  y,
  children,
}: Props) {
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverContent
        className="w-64 bg-white/60 backdrop-blur-sm "
        style={{
          position: "absolute",
          left: x,
          top: y,
        }}
      >
        {children}
      </PopoverContent>
    </Popover>
  );
}
