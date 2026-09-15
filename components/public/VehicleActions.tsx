import Link from "next/link";
import { CalendarDays, MessageSquare, Phone } from "lucide-react";
import { WhatsAppIcon } from "@/components/icons/SocialIcons";

const base =
  "inline-flex w-full items-center justify-center gap-2 px-5 py-3.5 text-center text-xs font-medium uppercase tracking-[0.16em] transition-all duration-200";

type Props = {
  tel?: string;
  whatsapp?: string;
  testDriveHref: string;
};

export function VehicleActions({ tel, whatsapp, testDriveHref }: Props) {
  return (
    <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
      {tel ? (
        <a
          href={tel}
          className={`${base} bg-gold text-dark hover:-translate-y-0.5 hover:bg-gold-light hover:shadow-[0_8px_24px_rgba(201,162,39,0.28)]`}
        >
          <Phone className="h-4 w-4" />
          Call Now
        </a>
      ) : null}
      {whatsapp ? (
        <a
          href={whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          className={`${base} border border-gold text-gold hover:-translate-y-0.5 hover:bg-gold hover:text-dark hover:shadow-[0_8px_24px_rgba(201,162,39,0.2)]`}
        >
          <WhatsAppIcon className="h-4 w-4" />
          WhatsApp
        </a>
      ) : null}
      <Link
        href={testDriveHref}
        className={`${base} border border-white/20 text-white hover:-translate-y-0.5 hover:border-gold hover:bg-gold/10 hover:text-gold`}
      >
        <CalendarDays className="h-4 w-4" />
        Book Test Drive
      </Link>
      <a
        href="#enquiry"
        className={`${base} border border-white/20 text-white hover:-translate-y-0.5 hover:border-gold hover:bg-gold/10 hover:text-gold`}
      >
        <MessageSquare className="h-4 w-4" />
        Send Inquiry
      </a>
    </div>
  );
}
