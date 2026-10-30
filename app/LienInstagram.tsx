import { INSTAGRAM_URL } from './rubriques';

/** Logo Instagram + « Suivez-nous », dans le menu burger et le pied de page. */
export default function LienInstagram({ onClick }: { onClick?: () => void }) {
  return (
    <a
      className="lien-insta"
      href={INSTAGRAM_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Suivez-nous sur Instagram"
      onClick={onClick}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" stroke="none" />
      </svg>
      Suivez-nous
    </a>
  );
}
