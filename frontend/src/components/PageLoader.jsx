import "./PageLoader.css";

export default function PageLoader() {
  return (
    <div className="page-loader-full">
      <div className="page-loader-logo">LUXEWEAR</div>
      <div className="page-loader-bar">
        <div className="page-loader-bar__fill" />
      </div>
    </div>
  );
}