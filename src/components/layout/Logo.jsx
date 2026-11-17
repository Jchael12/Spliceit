import { Link } from "react-router-dom";
import { ReceiptText } from "lucide-react";

export default function Logo({ compact = false }) {
  return (
    <Link
      to="/"
      className="inline-flex items-center gap-2.5 no-underline"
      aria-label="Spliceit dashboard"
    >
      <span
        className="grid shrink-0 place-items-center border-[2.5px] border-ink bg-[var(--plop-mustard)] paper-ink"
        style={{
          width: compact ? 38 : 44,
          height: compact ? 38 : 44,
          borderRadius: "14px 11px 15px 10px",
          boxShadow: "3px 4px 0 var(--plop-shadow)",
          transform: "rotate(-3deg)",
        }}
      >
        <ReceiptText size={compact ? 20 : 23} strokeWidth={2.3} />
      </span>
      <span
        className="paper-ink leading-none"
        style={{
          fontFamily: "var(--plop-font-logo)",
          fontWeight: 900,
          fontStyle: "italic",
          fontSize: compact ? 24 : 28,
          letterSpacing: "-0.02em",
        }}
      >
        Spli
        <span style={{ color: "var(--plop-tomato)" }}>ceit</span>
      </span>
    </Link>
  );
}
