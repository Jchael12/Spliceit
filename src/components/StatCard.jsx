import { Sheet } from "@plop-ui/react";

const TONE_COLORS = {
  ink: "var(--plop-periwinkle)",
  mint: "var(--plop-mint)",
  tomato: "var(--plop-bubblegum)",
  mustard: "var(--plop-mustard)",
};

export default function StatCard({ label, value, hint, icon, tone = "ink" }) {
  return (
    <Sheet tape="none" className="sheet-compact h-full" tilt={0}>
      <div className="flex items-start justify-between gap-2">
        <span className="paper-soft text-[11px] font-bold uppercase leading-tight tracking-[0.12em]">
          {label}
        </span>
        {icon ? (
          <span
            className="grid h-8 w-8 shrink-0 place-items-center border-2 border-ink paper-ink"
            style={{
              background: TONE_COLORS[tone] || TONE_COLORS.ink,
              borderRadius: "10px 8px 11px 7px",
            }}
            aria-hidden="true"
          >
            {icon}
          </span>
        ) : null}
      </div>
      <p
        className="paper-ink mt-2 text-[26px] leading-none sm:text-[30px]"
        style={{ fontFamily: "var(--plop-font-letter)", fontStyle: "italic" }}
      >
        {value}
      </p>
      {hint ? (
        <p className="paper-soft mt-2 text-[12px] leading-snug">{hint}</p>
      ) : null}
    </Sheet>
  );
}
