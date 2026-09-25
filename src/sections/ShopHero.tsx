import { Award } from 'lucide-react';
import { Link } from 'react-router-dom';

const TELEGRAM_COMMUNITY = 'https://t.me/+lG6-bsBkKD0xMzY9';
const HERO_IMG_SRC = '/shop/hero-img.png';

type ShopHeroProps = {
  whatsappLink?: string;
};

function IconShield() {
  return (
    <svg viewBox="0 0 32 32" width="32" height="32" aria-hidden>
      <circle cx="16" cy="16" r="14.25" fill="none" stroke="#5B6CFF" strokeWidth="1.35" />
      <path
        d="M16 8.4 22.2 11v5.15c0 3.55-2.42 6.08-6.2 7.45-3.78-1.37-6.2-3.9-6.2-7.45V11L16 8.4Z"
        fill="none"
        stroke="#5B6CFF"
        strokeWidth="1.35"
        strokeLinejoin="round"
      />
      <path d="M13.35 16.05 15.2 17.9l3.55-3.7" fill="none" stroke="#5B6CFF" strokeWidth="1.45" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconFlask() {
  return (
    <svg viewBox="0 0 32 32" width="32" height="32" aria-hidden>
      <circle cx="16" cy="16" r="14.25" fill="none" stroke="#5B6CFF" strokeWidth="1.35" />
      <path
        d="M13.15 9.4h5.7M14.2 9.4v4.15L11.3 19.4a4.85 4.85 0 0 0 4.7 3.55h0a4.85 4.85 0 0 0 4.7-3.55L17.8 13.55V9.4"
        fill="none"
        stroke="#5B6CFF"
        strokeWidth="1.35"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M12.2 18.15h7.6" fill="none" stroke="#5B6CFF" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function IconCube() {
  return (
    <svg viewBox="0 0 32 32" width="32" height="32" aria-hidden>
      <circle cx="16" cy="16" r="14.25" fill="none" stroke="#5B6CFF" strokeWidth="1.35" />
      <path
        d="M16 10.2 22.1 13.4v5.2L16 21.8 9.9 18.6v-5.2L16 10.2Z"
        fill="none"
        stroke="#5B6CFF"
        strokeWidth="1.35"
        strokeLinejoin="round"
      />
      <path d="M16 21.8V16M16 16 9.9 13.4M16 16l6.1-2.6" fill="none" stroke="#5B6CFF" strokeWidth="1.25" strokeLinecap="round" />
    </svg>
  );
}

function IconTelegram() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden>
      <circle cx="12" cy="12" r="10" fill="#2AABEE" />
      <path
        fill="#fff"
        d="M16.95 8.17c.17-.07.36 0 .42.18.04.1.04.2 0 .29l-2.3 10.17c-.08.35-.47.48-.76.26l-3.05-2.27-1.66 1.6c-.1.1-.24.15-.38.13l.27-3.84 6.86-6.2c.12-.11.02-.3-.13-.22L7.6 12.74l-2.37-.74c-.36-.11-.37-.62.02-.76l11.7-3.07Z"
      />
    </svg>
  );
}

function IconWhatsApp() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden>
      <path
        fill="#25D366"
        d="M12.04 2.5A9.45 9.45 0 0 0 2.6 11.9c0 1.66.44 3.28 1.27 4.71L2.5 21.5l5.03-1.32a9.46 9.46 0 0 0 4.51 1.15h.01a9.45 9.45 0 0 0 0-18.83Zm0 17.3h-.01a7.85 7.85 0 0 1-4-.99l-.29-.17-2.98.78.8-2.9-.19-.3a7.84 7.84 0 1 1 6.67 3.58Zm4.3-5.88c-.24-.12-1.4-.69-1.62-.77-.22-.08-.37-.12-.53.12-.16.24-.61.77-.75.93-.14.16-.27.18-.51.06-.24-.12-1-.37-1.9-1.17-.7-.62-1.18-1.4-1.32-1.63-.14-.24-.01-.36.1-.48.11-.11.24-.27.36-.41.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.53-1.27-.72-1.74-.19-.46-.38-.4-.53-.4h-.45c-.16 0-.42.06-.64.3-.22.24-.84.82-.84 2s.86 2.32.98 2.48c.12.16 1.69 2.58 4.1 3.62 1.44.62 1.73.56 2.36.47.38-.05 1.4-.57 1.6-1.12.2-.55.2-1.02.14-1.12-.06-.1-.22-.16-.46-.28Z"
      />
    </svg>
  );
}

function IconChevron() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden>
      <path d="M6 3.5 11 8l-5 4.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function ShopHero({ whatsappLink }: ShopHeroProps) {
  return (
    <section className="pl-hero" aria-labelledby="pl-hero-title">
      <div className="pl-hero-pattern" aria-hidden />
      <div className="pl-wrap pl-hero-grid">
        <div className="pl-hero-copy">
          <p className="pl-hero-eyebrow">Research today</p>
          <h2 id="pl-hero-title" className="pl-hero-title">
            A HEALTHIER <span>TOMORROW</span>
          </h2>
          <p className="pl-hero-lede">
            Premium peptides. Verified quality. Trusted by researchers.
          </p>
          <ul className="pl-hero-trust">
            <li>
              <IconShield />
              Lab Verified
            </li>
            <li>
              <IconFlask />
              HPLC Tested
            </li>
            <li>
              <IconCube />
              Research Use Only
            </li>
          </ul>
        </div>

        <div className="pl-hero-visual">
          <img
            className="pl-hero-vial"
            src={HERO_IMG_SRC}
            alt="PEPLAB research vial — quality, purity, progress"
            width={1185}
            height={736}
          />
        </div>

        <aside className="pl-hero-aside">
          <Link to="/dashboard#rewards" className="pl-hero-rewards">
            <span className="pl-hero-rewards-icon">
              <Award size={20} strokeWidth={2.2} />
            </span>
            <span className="pl-hero-rewards-copy">
              <strong>PEPLAB Rewards</strong>
              <em>Earn 1pt per $1 spent</em>
              <em>Redeem $150+</em>
            </span>
            <IconChevron />
          </Link>

          <a
            href={TELEGRAM_COMMUNITY}
            target="_blank"
            rel="noopener noreferrer"
            className="pl-hero-chip pl-hero-chip-tg"
          >
            <IconTelegram />
            Telegram Community
            <IconChevron />
          </a>

          {whatsappLink ? (
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="pl-hero-chip pl-hero-chip-wa"
            >
              <IconWhatsApp />
              WhatsApp Support
              <IconChevron />
            </a>
          ) : null}
        </aside>
      </div>
    </section>
  );
}
