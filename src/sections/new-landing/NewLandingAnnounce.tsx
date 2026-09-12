export default function NewLandingAnnounce() {
  return (
    <div className="nl-announce nl-announce--halloween" role="region" aria-label="Halloween special">
      <div className="nl-announce-inner">
        <p className="nl-announce-text">
          <span className="nl-announce-highlight">Halloween Special</span>
          <span className="nl-announce-sep" aria-hidden>
            |
          </span>
          <span>Free BAC Water</span>
          <span className="nl-announce-sep nl-announce-sep--wide" aria-hidden>
            |
          </span>
          <span className="nl-announce-extra">On all orders</span>
        </p>
      </div>
    </div>
  );
}
