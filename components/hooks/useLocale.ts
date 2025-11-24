import { getLocale, type Locale } from "@/lib/locale";
import { usePathname } from "next/navigation";

export default function useLocale(): Locale {
    const pathname = usePathname();
    return getLocale(pathname);
}
