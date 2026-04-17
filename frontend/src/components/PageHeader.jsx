const PageHeader = ({ eyebrow, title, description }) => (
  <div className="page-header">
    <span className="page-eyebrow">{eyebrow}</span>
    <h1>{title}</h1>
    <p>{description}</p>
  </div>
);

export default PageHeader;
