export default function NewLandingAnnounce() {
  return (
    <div className="nl-announce" role="region" aria-label="Store announcements">
      <div className="nl-announce-inner">
        <p className="nl-announce-text">
          <span className="nl-announce-highlight">Same-day dispatch</span>
          <span className="nl-announce-sep" aria-hidden>
            |
          </span>
          <span>Express shipping Australia-wide</span>
          <span className="nl-announce-sep nl-announce-sep--wide" aria-hidden>
            |
          </span>
          <span className="nl-announce-extra">HPLC-verified research peptides</span>
        </p>
      </div>
    </div>
  );
}
