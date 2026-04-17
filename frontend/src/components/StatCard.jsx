const StatCard = ({ label, value, helperText, onClick, accent = 'default' }) => (
  <button type="button" className={`stat-card ${accent}`} onClick={onClick} disabled={!onClick}>
    <span className="stat-label">{label}</span>
    <strong className="stat-value">{Number(value || 0).toLocaleString()}</strong>
    <span className="stat-helper">{helperText}</span>
  </button>
);

export default StatCard;
