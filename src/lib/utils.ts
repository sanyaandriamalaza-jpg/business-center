// import { clsx, type ClassValue } from "clsx"
// import { twMerge } from "tailwind-merge"

// export function cn(...inputs: ClassValue[]) {
//   return twMerge(clsx(inputs))
// }

export function cn(...args: (string | boolean | undefined | null)[]) {
  return args.filter(Boolean).join(" ");
}
