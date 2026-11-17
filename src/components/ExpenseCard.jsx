import { Link } from "react-router-dom";
import { AvatarStack, Tag, TicketCard } from "@plop-ui/react";
import { useApp } from "../context/AppContext";
import { getExpenseShares } from "../lib/balances";
import { formatDate, SPLIT_LABELS } from "../lib/format";

export default function ExpenseCard({ expense, showGroup = false }) {
  const { users, groups, currentUserId, money } = useApp();
  const payer = users.find((user) => user.id === expense.paidBy);
  const group = groups.find((item) => item.id === expense.groupId);
  const yourShare =
    getExpenseShares(expense).find((share) => share.userId === currentUserId)
      ?.amount ?? 0;
  const participantNames = expense.participants
    .map((participant) => users.find((user) => user.id === participant.userId)?.name)
    .filter(Boolean);

  const meta = showGroup
    ? `${group?.name ?? "Group"} · ${formatDate(expense.date)}`
    : `${formatDate(expense.date)} · ${payer?.name ?? "Someone"} paid`;

  return (
    <Link
      to={`/expenses/${expense.id}`}
      className="block h-full rounded-[16px] no-underline paper-ink"
    >
      <TicketCard
        className="h-full transition-transform duration-150 hover:-translate-y-0.5"
        meta={meta}
        title={expense.title}
        stub={
          <div className="flex h-full items-center justify-center px-1">
            <span className="paper-ink text-[17px] font-bold leading-none">
              {money(expense.amount)}
            </span>
          </div>
        }
      >
        <div className="flex flex-wrap items-center gap-2">
          <Tag tone="mustard" tilt={-1.5}>
            {SPLIT_LABELS[expense.splitType]}
          </Tag>
          <Tag tone="periwinkle" tilt={1}>
            {expense.category}
          </Tag>
          <span className="paper-soft text-[12px]">
            your share {money(yourShare)}
          </span>
          <span className="ml-auto">
            <AvatarStack names={participantNames} max={3} />
          </span>
        </div>
      </TicketCard>
    </Link>
  );
}
