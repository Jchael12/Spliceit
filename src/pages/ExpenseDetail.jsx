import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  MessageCircle,
  Pencil,
  Trash2,
} from "lucide-react";
import {
  Avatar,
  AvatarStack,
  Breadcrumb,
  Button,
  ButtonLink,
  Callout,
  EmptyState,
  Heading,
  Sheet,
  StickyNote,
  Tag,
  TextArea,
  toast,
} from "@plop-ui/react";
import { useApp } from "../context/AppContext";
import { getExpenseShares, getGroupBalances } from "../lib/balances";
import {
  formatDateTime,
  formatLongDate,
  relativeTime,
  SPLIT_LABELS,
} from "../lib/format";
import PageHeader from "../components/ui/PageHeader";
import StatCard from "../components/StatCard";
import BalanceTag from "../components/ui/BalanceTag";
import RouterLink from "../components/ui/RouterLink";

export default function ExpenseDetail() {
  const { expenseId } = useParams();
  const navigate = useNavigate();
  const {
    expenses,
    groups,
    users,
    settlements,
    currentUserId,
    money,
    addComment,
    deleteExpense,
  } = useApp();
  const [comment, setComment] = useState("");

  const expense = expenses.find((item) => item.id === expenseId);
  if (!expense) {
    return (
      <div className="mx-auto max-w-lg">
        <PageHeader
          title="Expense not found"
          description="This bill may already have been deleted."
        />
        <Link
          to="/groups"
          className="soft font-bold underline decoration-dotted underline-offset-4"
        >
          Back to groups
        </Link>
      </div>
    );
  }

  const group = groups.find((item) => item.id === expense.groupId);
  const payer = users.find((user) => user.id === expense.paidBy);
  const shares = getExpenseShares(expense);
  const yourShare =
    shares.find((share) => share.userId === currentUserId)?.amount ?? 0;
  const sharesTotal = shares.reduce((sum, share) => sum + share.amount, 0);
  const comments = expense.comments ?? [];
  const groupBalances = group
    ? getGroupBalances(group, expenses, settlements)
    : {};
  const yourGroupBalance = groupBalances[currentUserId] ?? 0;

  const participantNames = expense.participants
    .map((participant) => users.find((user) => user.id === participant.userId)?.name)
    .filter(Boolean);

  const handleDelete = () => {
    const confirmed = window.confirm(
      `Delete "${expense.title}"? This removes the bill and its comments from this demo.`,
    );
    if (!confirmed) return;
    deleteExpense(expense.id);
    toast.success("Expense deleted", { burst: "poof" });
    navigate(group ? `/groups/${group.id}` : "/groups");
  };

  const handleComment = (event) => {
    event.preventDefault();
    if (!comment.trim()) return;
    addComment(expense.id, comment);
    setComment("");
    toast.success("Comment added", { burst: true });
  };

  return (
    <div>
      <Breadcrumb
        as={RouterLink}
        items={[
          { label: "Dashboard", href: "/" },
          { label: "Groups", href: "/groups" },
          ...(group
            ? [{ label: group.name, href: `/groups/${group.id}` }]
            : []),
          { label: expense.title },
        ]}
        className="mb-4"
      />

      <PageHeader
        eyebrow={
          group
            ? `${group.emoji} ${group.name} · ${formatLongDate(expense.date)}`
            : formatLongDate(expense.date)
        }
        title={expense.title}
        description={`${payer?.name ?? "Someone"} paid ${money(expense.amount)}. Here is exactly how it was divided.`}
        actions={
          <>
            <ButtonLink
              as={RouterLink}
              href={`/expenses/${expense.id}/edit`}
              variant="mustard"
              iconLeft={<Pencil size={17} />}
            >
              Edit
            </ButtonLink>
            <Button
              variant="tomato"
              iconLeft={<Trash2 size={17} />}
              onClick={handleDelete}
            >
              Delete
            </Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Bill total"
          value={money(expense.amount)}
          hint={expense.category}
          tone="mustard"
        />
        <StatCard
          label="Your share"
          value={money(yourShare)}
          hint={
            expense.paidBy === currentUserId
              ? "You paid, so the group owes you."
              : "Your part of this bill."
          }
          tone="mint"
        />
        <StatCard
          label="Paid by"
          value={payer?.name ?? "Unknown"}
          hint={formatLongDate(expense.date)}
          tone="ink"
        />
        <StatCard
          label="Split method"
          value={SPLIT_LABELS[expense.splitType]}
          hint={`${shares.length} ${shares.length === 1 ? "person" : "people"} included`}
          tone={
            expense.splitType === "equal"
              ? "mint"
              : expense.splitType === "exact"
                ? "tomato"
                : "ink"
          }
        />
      </div>

      <div className="mt-7 grid items-start gap-6 xl:grid-cols-[1.5fr_1fr]">
        <div className="grid gap-6">
          <Sheet tape="mustard" className="sheet-compact">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <Heading level={3} scribble={false} writeOn={false}>
                  Who owes what
                </Heading>
                <p className="paper-soft mt-1 text-[13px]">
                  {SPLIT_LABELS[expense.splitType]} across {shares.length}{" "}
                  {shares.length === 1 ? "person" : "people"}.
                </p>
              </div>
              <Tag tone={expense.paidBy === currentUserId ? "mint" : "periwinkle"} tilt={-1}>
                {expense.paidBy === currentUserId ? "You paid" : `${payer?.name} paid`}
              </Tag>
            </div>

            <ul className="mt-4 grid list-none gap-0 p-0">
              {shares.map((share) => {
                const member = users.find((user) => user.id === share.userId);
                const participant = expense.participants.find(
                  (item) => item.userId === share.userId,
                );
                const isPayer = expense.paidBy === share.userId;
                return (
                  <li
                    key={share.userId}
                    className="flex items-center gap-3 border-b-2 border-dashed border-[var(--plop-periwinkle)] py-3 last:border-0"
                  >
                    <Avatar name={member?.name || "Member"} size="sm" />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="paper-ink text-[14px] font-bold">
                          {member?.name ?? "Unknown member"}
                          {share.userId === currentUserId ? " (you)" : ""}
                        </span>
                        {isPayer ? (
                          <Tag tone="mint" tilt={1}>
                            paid
                          </Tag>
                        ) : null}
                      </div>
                      <span className="paper-soft block text-[11px] leading-snug">
                        {expense.splitType === "percentage"
                          ? `${participant?.value ?? 0}% of the bill`
                          : expense.splitType === "exact"
                            ? "Exact share"
                            : "Equal share"}
                      </span>
                    </div>
                    <span className="paper-ink shrink-0 text-[15px] font-bold">
                      {money(share.amount)}
                    </span>
                  </li>
                );
              })}
              {!shares.length ? (
                <li>
                  <EmptyState>No participants were added to this expense.</EmptyState>
                </li>
              ) : null}
            </ul>

            <div className="mt-4 grid gap-2 rounded-[10px] border-2 border-dashed border-[var(--plop-periwinkle)] p-3 text-[13px]">
              <div className="flex items-center justify-between gap-3">
                <span className="paper-soft">Paid by {payer?.name ?? "someone"}</span>
                <strong className="paper-ink">{money(expense.amount)}</strong>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="paper-soft">Assigned to participants</span>
                <strong className="paper-ink">{money(sharesTotal)}</strong>
              </div>
            </div>

            {expense.notes ? (
              <div className="mt-5">
                <StickyNote tone="mint" tilt={-1} footer="Expense note">
                  {expense.notes}
                </StickyNote>
              </div>
            ) : null}
          </Sheet>

          <Sheet tape="periwinkle" className="sheet-compact">
            <div className="flex items-center justify-between gap-3">
              <Heading level={3} scribble={false} writeOn={false}>
                Comments
              </Heading>
              <Tag tone="periwinkle">{comments.length}</Tag>
            </div>

            {comments.length ? (
              <ul className="mt-4 grid list-none gap-4 p-0">
                {comments.map((item) => {
                  const author = users.find((user) => user.id === item.userId);
                  return (
                    <li key={item.id} className="flex gap-3">
                      <Avatar name={author?.name || "Member"} size="sm" />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-baseline gap-x-2">
                          <span className="paper-ink text-[13px] font-bold">
                            {author?.name ?? "Someone"}
                          </span>
                          <span
                            className="paper-soft text-[11px]"
                            title={formatDateTime(item.date)}
                          >
                            {relativeTime(item.date)}
                          </span>
                        </div>
                        <p className="paper-ink mt-1 whitespace-pre-wrap text-[14px] leading-snug">
                          {item.text}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="paper-soft mt-4 text-sm">
                No comments yet. Add the first note below.
              </p>
            )}

            <form onSubmit={handleComment} className="mt-5 grid gap-3">
              <TextArea
                label="Add a comment"
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                placeholder="Ask a question or add a little context..."
                rows={2}
                maxLength={240}
              />
              <div>
                <Button
                  type="submit"
                  variant="mint"
                  size="sm"
                  iconLeft={<MessageCircle size={16} />}
                  disabled={!comment.trim()}
                >
                  Post comment
                </Button>
              </div>
            </form>
          </Sheet>
        </div>

        <aside className="grid gap-5">
          {group ? (
            <Sheet tape="mustard" className="sheet-compact">
              <div className="flex items-center gap-3">
                <span
                  className="grid h-12 w-12 place-items-center border-[2.5px] border-ink text-2xl"
                  style={{
                    background: "var(--plop-mint)",
                    borderRadius: "15px 11px 17px 10px",
                  }}
                  aria-hidden="true"
                >
                  {group.emoji}
                </span>
                <div className="min-w-0">
                  <Link
                    to={`/groups/${group.id}`}
                    className="paper-ink block truncate text-[17px] font-bold underline decoration-dotted underline-offset-2"
                  >
                    {group.name}
                  </Link>
                  <span className="paper-soft text-[12px]">
                    {group.memberIds.length} members
                  </span>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between gap-3">
                <AvatarStack names={participantNames} max={4} />
                <BalanceTag value={yourGroupBalance} />
              </div>

              <div className="mt-4 flex gap-2">
                <ButtonLink
                  as={RouterLink}
                  href={`/groups/${group.id}`}
                  variant="plain"
                  size="sm"
                  iconLeft={<ArrowLeft size={15} />}
                >
                  Group details
                </ButtonLink>
              </div>
            </Sheet>
          ) : null}

          <Callout
            title="How the maths works"
            tone="info"
            buddy={false}
          >
            {expense.splitType === "equal"
              ? "Equal splits divide the bill by the number of included people. Any leftover cents are handed to the first people in the list."
              : expense.splitType === "exact"
                ? "Exact splits use the amount typed next to each person. The group total should match the bill."
                : "Percentage splits turn each person's share into a slice of the bill. The percentages should add up to 100%."}
          </Callout>

          <div className="paper-ink rounded-[14px] border-2 border-dashed border-[var(--plop-periwinkle)] p-4 text-[13px]">
            <p className="m-0 font-bold">Expense details</p>
            <div className="paper-soft mt-2 grid gap-1">
              <span>Created {formatDateTime(expense.createdAt)}</span>
              <span>Expense ID: {expense.id}</span>
              <span>Category: {expense.category}</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
