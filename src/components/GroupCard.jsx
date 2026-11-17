import { Link } from "react-router-dom";
import { AvatarStack, Sheet, Tag, seededTilt } from "@plop-ui/react";
import { useApp } from "../context/AppContext";
import { getGroupBalances, getGroupTotal } from "../lib/balances";
import BalanceTag from "./ui/BalanceTag";

const EMOJI_BG = {
  mint: "var(--plop-mint)",
  mustard: "var(--plop-mustard)",
  tomato: "var(--plop-bubblegum)",
  periwinkle: "var(--plop-periwinkle)",
  bubblegum: "var(--plop-bubblegum)",
};

export default function GroupCard({ group }) {
  const { expenses, settlements, users, currentUserId, money } = useApp();
  const memberNames = group.memberIds
    .map((id) => users.find((user) => user.id === id)?.name)
    .filter(Boolean);
  const total = getGroupTotal(group.id, expenses);
  const balances = getGroupBalances(group, expenses, settlements);
  const yourBalance = balances[currentUserId] ?? 0;

  return (
    <Link
      to={`/groups/${group.id}`}
      className="block h-full rounded-[16px] no-underline paper-ink"
    >
      <Sheet
        tape={group.tone === "mustard" ? "periwinkle" : "mustard"}
        tilt={seededTilt(group.id, 0.45)}
        className="flex h-full flex-col transition-transform duration-150 hover:-translate-y-1"
      >
        <div className="flex items-start justify-between gap-3">
          <span
            className="grid h-12 w-12 shrink-0 place-items-center border-[2.5px] border-ink text-2xl"
            style={{
              background: EMOJI_BG[group.tone] || "var(--plop-mint)",
              borderRadius: "16px 12px 18px 11px",
              transform: "rotate(-2deg)",
            }}
            aria-hidden="true"
          >
            {group.emoji}
          </span>
          <Tag tone={group.tone} tilt={1.5}>
            {group.category}
          </Tag>
        </div>

        <h3
          className="mt-4 text-[25px] leading-none paper-ink"
          style={{ fontFamily: "var(--plop-font-letter)", fontStyle: "italic" }}
        >
          {group.name}
        </h3>
        <p className="paper-soft mt-2 line-clamp-2 text-[14px] leading-snug">
          {group.description || "No description yet."}
        </p>

        <div className="mt-auto flex items-end justify-between gap-3 pt-5">
          <AvatarStack names={memberNames} max={3} />
          <div className="text-right">
            <span className="paper-soft block text-[11px] font-bold uppercase tracking-wide">
              Group total
            </span>
            <span className="paper-ink block text-[17px] font-bold">
              {money(total)}
            </span>
          </div>
        </div>

        <div className="mt-4 border-t-2 border-dashed border-[var(--plop-periwinkle)] pt-3">
          <BalanceTag value={yourBalance} />
        </div>
      </Sheet>
    </Link>
  );
}
