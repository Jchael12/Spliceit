import { useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Save, Sparkles } from "lucide-react";
import {
  Avatar,
  Breadcrumb,
  Button,
  Callout,
  Checkbox,
  EmptyState,
  Heading,
  Progress,
  Radio,
  RadioGroup,
  Select,
  Sheet,
  StickyNote,
  TextArea,
  TextField,
  toast,
} from "@plop-ui/react";
import { useApp } from "../context/AppContext";
import { getExpenseShares } from "../lib/balances";
import {
  currencySymbol,
  evenPercentages,
  parseAmount,
  round2,
  SPLIT_LABELS,
  todayISO,
} from "../lib/format";
import PageHeader from "../components/ui/PageHeader";
import RouterLink from "../components/ui/RouterLink";

const CATEGORY_OPTIONS = [
  "Food",
  "Housing",
  "Transport",
  "Utilities",
  "Supplies",
  "Equipment",
  "Lodging",
  "Other",
].map((value) => ({ value, label: value }));

const SPLIT_OPTIONS = [
  { value: "equal", label: SPLIT_LABELS.equal },
  { value: "exact", label: SPLIT_LABELS.exact },
  { value: "percentage", label: SPLIT_LABELS.percentage },
];

function valuesFor(expense, type) {
  if (!expense || expense.splitType !== type) return {};
  return Object.fromEntries(
    expense.participants.map((participant) => [
      participant.userId,
      String(participant.value),
    ]),
  );
}

export default function AddExpense() {
  const { expenseId, groupId: routeGroupId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const {
    groups,
    groupsForUser,
    users,
    expenses,
    profile,
    currentUserId,
    money,
    addExpense,
    updateExpense,
  } = useApp();

  const existing = expenseId
    ? expenses.find((expense) => expense.id === expenseId)
    : null;
  const queriedGroupId = searchParams.get("groupId");
  const initialGroupId =
    existing?.groupId ||
    routeGroupId ||
    queriedGroupId ||
    groupsForUser[0]?.id ||
    "";
  const initialGroup = groups.find((group) => group.id === initialGroupId);
  const initialParticipants = existing
    ? existing.participants.map((participant) => participant.userId)
    : (initialGroup?.memberIds ?? []);

  const [groupId, setGroupId] = useState(initialGroupId);
  const [title, setTitle] = useState(existing?.title ?? "");
  const [amount, setAmount] = useState(
    existing ? String(existing.amount) : "",
  );
  const [date, setDate] = useState(existing?.date ?? todayISO());
  const [category, setCategory] = useState(existing?.category ?? "Food");
  const [paidBy, setPaidBy] = useState(
    existing?.paidBy || initialGroup?.memberIds[0] || currentUserId,
  );
  const [splitType, setSplitType] = useState(existing?.splitType ?? "equal");
  const [participantIds, setParticipantIds] = useState(initialParticipants);
  const [exactValues, setExactValues] = useState(() =>
    valuesFor(existing, "exact"),
  );
  const [percentValues, setPercentValues] = useState(() => {
    const stored = valuesFor(existing, "percentage");
    return Object.keys(stored).length
      ? stored
      : evenPercentages(initialParticipants);
  });
  const [notes, setNotes] = useState(existing?.notes ?? "");
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");

  const selectedGroup = groups.find((group) => group.id === groupId);
  const members = (selectedGroup?.memberIds ?? [])
    .map((id) => users.find((user) => user.id === id))
    .filter(Boolean);
  const memberOptions = members.map((member) => ({
    value: member.id,
    label: member.name,
    hint: member.id === currentUserId ? "You" : undefined,
    lead: { avatar: member.name },
  }));
  const groupOptions = groupsForUser.map((group) => ({
    value: group.id,
    label: `${group.emoji} ${group.name}`,
  }));

  const parsedAmount = round2(parseAmount(amount));
  const participantSet = new Set(participantIds);

  const participantRows = participantIds.map((id) => ({
    userId: id,
    value:
      splitType === "exact"
        ? round2(parseAmount(exactValues[id]))
        : splitType === "percentage"
          ? round2(parseAmount(percentValues[id]))
          : 0,
  }));

  const shares = useMemo(
    () =>
      getExpenseShares({
        amount: parsedAmount,
        splitType,
        participants: participantRows,
      }),
    // participantRows is rebuilt each render; the primitive inputs below are
    // the values that actually affect the result.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [parsedAmount, splitType, participantIds.join("|"), JSON.stringify(exactValues), JSON.stringify(percentValues)],
  );
  const shareMap = new Map(shares.map((share) => [share.userId, share.amount]));
  const yourShare = shareMap.get(currentUserId) ?? 0;

  const exactTotal = round2(
    participantIds.reduce(
      (sum, id) => sum + parseAmount(exactValues[id]),
      0,
    ),
  );
  const percentTotal = round2(
    participantIds.reduce(
      (sum, id) => sum + parseAmount(percentValues[id]),
      0,
    ),
  );
  const splitValid =
    splitType === "equal"
      ? participantIds.length > 0
      : splitType === "exact"
        ? Math.abs(exactTotal - parsedAmount) <= 0.02
        : Math.abs(percentTotal - 100) <= 0.02;

  const progressValue =
    splitType === "equal"
      ? participantIds.length && parsedAmount > 0
        ? 100
        : 0
      : splitType === "exact"
        ? parsedAmount > 0
          ? Math.min(100, (exactTotal / parsedAmount) * 100)
          : 0
        : Math.min(100, percentTotal);

  const progressText =
    splitType === "equal"
      ? `${participantIds.length} equal ${participantIds.length === 1 ? "share" : "shares"}`
      : splitType === "exact"
        ? `${money(exactTotal)} of ${money(parsedAmount)}`
        : `${percentTotal.toFixed(2)}% of 100%`;

  if (!groupsForUser.length) {
    return (
      <div className="mx-auto max-w-xl">
        <PageHeader
          title="Add expense"
          description="Expenses live inside groups, so we need one first."
        />
        <Sheet tape="mustard" className="sheet-compact text-center">
          <EmptyState>Create a group, then add your first bill.</EmptyState>
          <div className="mt-4 flex justify-center">
            <Button
              variant="tomato"
              onClick={() => navigate("/groups")}
            >
              Go to groups
            </Button>
          </div>
        </Sheet>
      </div>
    );
  }

  if (expenseId && !existing) {
    return (
      <div className="mx-auto max-w-xl">
        <PageHeader
          title="Expense not found"
          description="It may have been deleted already."
        />
        <Button variant="plain" onClick={() => navigate(-1)}>
          Go back
        </Button>
      </div>
    );
  }

  const clearErrors = () => {
    setErrors({});
    setFormError("");
  };

  const handleGroupChange = (nextGroupId) => {
    const nextGroup = groups.find((group) => group.id === nextGroupId);
    const nextMembers = nextGroup?.memberIds ?? [];
    setGroupId(nextGroupId);
    setPaidBy(
      nextMembers.includes(currentUserId)
        ? currentUserId
        : (nextMembers[0] ?? ""),
    );
    setParticipantIds(nextMembers);
    setExactValues({});
    setPercentValues(evenPercentages(nextMembers));
    clearErrors();
  };

  const handleSplitTypeChange = (nextType) => {
    setSplitType(nextType);
    clearErrors();
    if (nextType === "exact") {
      const currentShares = getExpenseShares({
        amount: parsedAmount,
        splitType,
        participants: participantRows,
      });
      setExactValues(
        Object.fromEntries(
          currentShares.map((share) => [
            share.userId,
            share.amount.toFixed(2),
          ]),
        ),
      );
    }
    if (nextType === "percentage") {
      setPercentValues(evenPercentages(participantIds));
    }
  };

  const toggleParticipant = (userId) => {
    clearErrors();
    const isIncluded = participantIds.includes(userId);
    const next = isIncluded
      ? participantIds.filter((id) => id !== userId)
      : [...participantIds, userId];
    setParticipantIds(next);

    if (splitType === "percentage") {
      setPercentValues(evenPercentages(next));
    }
    if (!isIncluded && splitType === "exact") {
      const equalShare = parsedAmount / Math.max(next.length, 1);
      setExactValues((previous) => ({
        ...previous,
        [userId]: equalShare.toFixed(2),
      }));
    }
  };

  const selectEveryone = () => {
    const next = members.map((member) => member.id);
    setParticipantIds(next);
    setExactValues({});
    if (splitType === "percentage") setPercentValues(evenPercentages(next));
    clearErrors();
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const nextErrors = {};

    if (!selectedGroup) {
      nextErrors.group = "Choose a group for this expense.";
    }
    if (!title.trim()) {
      nextErrors.title = "Give the bill a short name.";
    }
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      nextErrors.amount = "Enter an amount greater than zero.";
    }
    if (!paidBy) {
      nextErrors.paidBy = "Choose who paid.";
    }
    if (!participantIds.length) {
      nextErrors.participants = "Include at least one person in the split.";
    }
    if (
      participantIds.length &&
      splitType === "exact" &&
      Math.abs(exactTotal - parsedAmount) > 0.02
    ) {
      nextErrors.split = `Exact amounts add up to ${money(exactTotal)}, but the bill is ${money(parsedAmount)}.`;
    }
    if (
      participantIds.length &&
      splitType === "percentage" &&
      Math.abs(percentTotal - 100) > 0.02
    ) {
      nextErrors.split = `Percentages add up to ${percentTotal.toFixed(2)}%. They need to reach 100%.`;
    }

    setErrors(nextErrors);
    setFormError(Object.values(nextErrors)[0] || "");
    if (Object.keys(nextErrors).length) return;

    const normalizedParticipants = participantIds.map((id) => ({
      userId: id,
      value:
        splitType === "exact"
          ? round2(parseAmount(exactValues[id]))
          : splitType === "percentage"
            ? round2(parseAmount(percentValues[id]))
            : round2(100 / Math.max(participantIds.length, 1)),
    }));

    const input = {
      groupId,
      title,
      amount: parsedAmount,
      category,
      date,
      paidBy,
      splitType,
      participants: normalizedParticipants,
      notes,
    };

    if (existing) {
      updateExpense(existing.id, input);
      toast.success("Expense updated", { burst: true });
      navigate(`/expenses/${existing.id}`);
    } else {
      const created = addExpense(input);
      toast.success("Expense added", { burst: true });
      navigate(`/expenses/${created.id}`);
    }
  };

  const breadcrumbItems = [
    { label: "Dashboard", href: "/" },
    { label: "Groups", href: "/groups" },
    ...(selectedGroup
      ? [{ label: selectedGroup.name, href: `/groups/${selectedGroup.id}` }]
      : []),
    { label: existing ? "Edit expense" : "New expense" },
  ];

  return (
    <div>
      <Breadcrumb as={RouterLink} items={breadcrumbItems} className="mb-4" />

      <PageHeader
        eyebrow={selectedGroup ? `${selectedGroup.emoji} ${selectedGroup.name}` : undefined}
        title={existing ? "Edit expense" : "Add an expense"}
        description={
          existing
            ? "Change the details, payer or split. Comments stay attached."
            : "Write down the bill, choose who paid, and let SplitInk divide it fairly."
        }
      />

      <form onSubmit={handleSubmit} className="grid items-start gap-6 xl:grid-cols-[1.5fr_1fr]">
        <div className="grid gap-6">
          <Sheet tape="mustard" className="sheet-compact">
            <Heading level={3} scribble={false} writeOn={false}>
              The bill
            </Heading>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Select
                label="Group"
                options={groupOptions}
                value={groupId}
                onValueChange={handleGroupChange}
                disabled={Boolean(expenseId)}
                error={errors.group}
                placeholder="Choose a group"
              />
              <Select
                label="Category"
                options={CATEGORY_OPTIONS}
                value={category}
                onValueChange={setCategory}
              />
              <div className="sm:col-span-2">
                <TextField
                  label="What was it for?"
                  value={title}
                  onChange={(event) => {
                    setTitle(event.target.value);
                    clearErrors();
                  }}
                  placeholder="e.g. Sunday brunch"
                  maxLength={60}
                  error={errors.title}
                  required
                />
              </div>
              <TextField
                label="Amount"
                type="number"
                min="0.01"
                step="0.01"
                inputMode="decimal"
                value={amount}
                onChange={(event) => {
                  setAmount(event.target.value);
                  clearErrors();
                }}
                placeholder="0.00"
                error={errors.amount}
                required
              />
              <TextField
                label="Date"
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                required
              />
              <div className="sm:col-span-2">
                <Select
                  label="Paid by"
                  options={memberOptions}
                  value={paidBy}
                  onValueChange={(value) => {
                    setPaidBy(value);
                    clearErrors();
                  }}
                  placeholder="Choose who paid"
                  searchable={members.length > 4}
                  error={errors.paidBy}
                />
              </div>
              <div className="sm:col-span-2">
                <TextArea
                  label="Notes (optional)"
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="Anything the group should know?"
                  rows={2}
                  maxLength={160}
                />
              </div>
            </div>
          </Sheet>

          <Sheet tape="periwinkle" className="sheet-compact">
            <Heading level={3} scribble={false} writeOn={false}>
              Split the bill
            </Heading>

            <div className="mt-4">
              <RadioGroup
                legend="How should it be divided?"
                value={splitType}
                onValueChange={handleSplitTypeChange}
                vertical={false}
              >
                {SPLIT_OPTIONS.map((option) => (
                  <Radio key={option.value} value={option.value}>
                    {option.label}
                  </Radio>
                ))}
              </RadioGroup>
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-2">
              <span className="paper-soft text-[12px] font-bold uppercase tracking-wide">
                {participantIds.length} of {members.length} included
              </span>
              <button
                type="button"
                onClick={selectEveryone}
                className="paper-soft text-[12px] font-bold underline decoration-dotted underline-offset-2"
              >
                Include everyone
              </button>
            </div>

            <div className="mt-2">
              {members.map((member) => {
                const included = participantSet.has(member.id);
                const share = shareMap.get(member.id) ?? 0;
                return (
                  <div
                    key={member.id}
                    className={[
                      "flex flex-wrap items-center gap-2.5 border-b-2 border-dashed border-[var(--plop-periwinkle)] py-2.5 last:border-0",
                      included ? "" : "opacity-60",
                    ].join(" ")}
                  >
                    <Checkbox
                      checked={included}
                      onCheckedChange={() => toggleParticipant(member.id)}
                      aria-label={`Include ${member.name} in the split`}
                    />
                    <Avatar name={member.name} size="sm" />
                    <span className="paper-ink min-w-0 flex-1 truncate text-[14px] font-bold">
                      {member.name}
                      {member.id === currentUserId ? " (you)" : ""}
                    </span>

                    {included && splitType !== "equal" ? (
                      <span className="flex items-center gap-1.5">
                        <input
                          className="field-input no-spin w-[88px] text-right"
                          type="number"
                          min="0"
                          step="0.01"
                          inputMode="decimal"
                          value={
                            splitType === "exact"
                              ? (exactValues[member.id] ?? "")
                              : (percentValues[member.id] ?? "")
                          }
                          onChange={(event) => {
                            const value = event.target.value;
                            if (splitType === "exact") {
                              setExactValues((previous) => ({
                                ...previous,
                                [member.id]: value,
                              }));
                            } else {
                              setPercentValues((previous) => ({
                                ...previous,
                                [member.id]: value,
                              }));
                            }
                            clearErrors();
                          }}
                          aria-label={`${splitType === "exact" ? "Exact amount" : "Percentage"} for ${member.name}`}
                          placeholder="0"
                        />
                        <span className="paper-soft w-4 text-[12px]">
                          {splitType === "exact"
                            ? currencySymbol(profile.currency)
                            : "%"}
                        </span>
                      </span>
                    ) : null}

                    <span className="paper-ink w-[76px] text-right text-[13px] font-bold">
                      {included ? money(share) : "—"}
                    </span>
                  </div>
                );
              })}
            </div>
          </Sheet>
        </div>

        <aside className="grid gap-5 xl:sticky xl:top-6">
          <Sheet tape="mint" className="sheet-compact">
            <Heading level={3} scribble={false} writeOn={false}>
              Summary
            </Heading>

            <div className="mt-4 flex items-end justify-between gap-3">
              <span className="paper-soft text-[13px]">Bill total</span>
              <span
                className="paper-ink text-[27px] leading-none"
                style={{ fontFamily: "var(--plop-font-letter)", fontStyle: "italic" }}
              >
                {money(parsedAmount)}
              </span>
            </div>
            <div className="paper-soft mt-2 flex items-center justify-between gap-3 border-b-2 border-dashed border-[var(--plop-periwinkle)] pb-3 text-[13px]">
              <span>Your share</span>
              <strong className="paper-ink">{money(yourShare)}</strong>
            </div>

            <div className="mt-4">
              <Progress
                label="Split allocated"
                value={progressValue}
                valueText={progressText}
                tone={splitValid ? "mint" : "tomato"}
              />
            </div>

            {splitType !== "equal" ? (
              <p className="paper-soft mt-3 text-[12px] leading-snug">
                {splitType === "exact"
                  ? `Assign every cent: ${money(exactTotal)} assigned of ${money(parsedAmount)}.`
                  : `Percentages must total 100%. Currently ${percentTotal.toFixed(2)}%.`}
              </p>
            ) : (
              <p className="paper-soft mt-3 text-[12px] leading-snug">
                Each included person pays an equal share. Leftover cents go to
                the first people in the list.
              </p>
            )}

            {formError ? (
              <div className="mt-4">
                <Callout title="Check the details" tone="error">
                  {formError}
                </Callout>
              </div>
            ) : null}

            <div className="mt-5 flex flex-col gap-2.5">
              <Button
                type="submit"
                variant="tomato"
                iconLeft={<Save size={18} />}
                buddy="peek"
              >
                {existing ? "Save changes" : "Add expense"}
              </Button>
              <Button
                type="button"
                variant="plain"
                onClick={() =>
                  navigate(
                    selectedGroup ? `/groups/${selectedGroup.id}` : "/groups",
                  )
                }
              >
                Cancel
              </Button>
            </div>
          </Sheet>

          <StickyNote
            tone="mustard"
            tilt={1}
            footer="A fair split is a friendship preserved."
          >
            <span className="inline-flex items-start gap-2 text-[14px] leading-snug">
              <Sparkles size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
              <span>
                Keep the receipt in the notes. Future-you will remember exactly
                why the garlic bread cost extra.
              </span>
            </span>
          </StickyNote>
        </aside>
      </form>
    </div>
  );
}
