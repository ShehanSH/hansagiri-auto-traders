import type { SiteSettings } from "@/types";
import {
  FacebookIcon,
  InstagramIcon,
  TikTokIcon,
  YouTubeIcon,
} from "@/components/icons/SocialIcons";

const NETWORKS = [
  ["Facebook", "facebook", FacebookIcon],
  ["Instagram", "instagram", InstagramIcon],
  ["TikTok", "tiktok", TikTokIcon],
  ["YouTube", "youtube", YouTubeIcon],
] as const;

export function SocialIconLinks({
  settings,
  className = "",
}: {
  settings: SiteSettings;
  className?: string;
}) {
  const items = NETWORKS.map(([label, key, Icon]) => ({
    label,
    href: settings.social[key],
    Icon,
  })).filter((item) => item.href);

  if (!items.length) return null;

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      {items.map(({ label, href, Icon }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          className="flex h-9 w-9 items-center justify-center border border-gold/25 text-gold-champagne transition-colors hover:border-gold hover:text-gold"
        >
          <Icon className="h-4 w-4" />
        </a>
      ))}
    </div>
  );
}
