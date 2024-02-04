import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

export const getDomainFromURL = (url: string) => {
  return url.replace(/https?:\/\/([^\s/:]+)(\S*$)/i, "$1");
};
