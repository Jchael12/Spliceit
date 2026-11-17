import { useEffect, useMemo, useState } from "react";
import {
  Button,
  Callout,
  Select,
  TextField,
  EmptyState,
  toast,
} from "@plop-ui/react";
import { HandCoins, Send } from "lucide-react";
import { useApp } from "../context/AppContext";
import { todayISO } from "../lib/format";

const METHODS = [
  { value: "Bank transfer", label: "Bank transfer" },
  { value: "Cash", label: "Cash" },
  { value: "Venmo", label: "Venmo" },
  { value: "PayPal", label: "PayPal" },
  { value: "Other", label: "Other" },
];

export default function SettleUpForm({
  defaultGroupId,
  preset,
  onDone,
  submitLabel = "Record settlement",
}) {
  const {
    groupsForUser,
    users,
    currentUserId,
    recordSettlement,
  } = useApp();

  const initialGroupId =
    preset?.groupId || defaultGroupId || groupsForUser[0]?.id || null;
  const [groupId, setGroupId] = useState(initialGroupId);
  const [from, setFrom] = useState(preset?.from || currentUserId);
  const [to, setTo] = useState(preset?.to || "");
  const [amount, setAmount] = useState(
    preset?.amount ? String(preset.amount) : "",
  );
  const [date, setDate] = useState(todayISO());
  const [method, setMethod] = useState("Bank transfer");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  const group = groupsForUser.find((item) => item.id === groupId);
  const members = useMemo(
    () =>
      (group?.memberIds ?? [])
        .map((id) => users.find((user) => user.id === id))
        .filter(Boolean),
    [group, users],
  );

  useEffect(() => {
    if (!group) return;
    const memberIds = group.memberIds;
    setFrom((previous) => (memberIds.includes(previous) ? previous : memberIds[0]));
    setTo((previous) => {
      if (memberIds.includes(previous) && previous !== from) return previous;
      return memberIds.find((id) => id !== from) || "";
    });
    setError("");
  }, [group, from]);

  const groupOptions = groupsForUser.map((item) => ({
    value: item.id,
    label: `${item.emoji} ${item.name}`,
  }));

  const memberOptions = members.map((member) => ({
    value: member.id,
    label: member.name,
    hint: member.id === currentUserId ? "You" : undefined,
    lead: { avatar: member.name },
  }));

  if (!groupsForUser.length) {
    return (
      <EmptyState>
        Create a group first, then you can record a settlement here.
      </EmptyState>
    );
  }

  const handleSubmit = (event) => {
    event.preventDefault();
    setError("");

    if (!group) {
      setError("Choose a group for this settlement.");
      return;
    }
    if (!from || !to || from === to) {
      setError("Pick two different people: one paying and one receiving.");
      return;
    }
    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setError("Enter an amount greater than zero.");
      return;
    }

    const result = recordSettlement({
      groupId: group.id,
      from,
      to,
      amount: numericAmount,
      date,
      method,
      note,
    });

    toast.success(
      `${result.fromName} paid ${result.toName} successfully`,
      { burst: true },
    );
    onDone?.(result.settlement);
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <Select
        label="Group"
        options={groupOptions}
        value={groupId}
        onValueChange={setGroupId}
        placeholder="Choose a group"
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Select
          label="Who paid?"
          options={memberOptions}
          value={from}
          onValueChange={setFrom}
          placeholder="Choose a person"
          searchable={members.length > 4}
        />
        <Select
          label="Who received it?"
          options={memberOptions}
          value={to}
          onValueChange={setTo}
          placeholder="Choose a person"
          searchable={members.length > 4}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          label="Amount"
          type="number"
          min="0.01"
          step="0.01"
          inputMode="decimal"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          placeholder="0.00"
          required
        />
        <TextField
          label="Date"
          type="date"
          value={date}
          onChange={(event) => setDate(event.target.value)}
          required
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Select
          label="Method"
          options={METHODS}
          value={method}
          onValueChange={setMethod}
        />
        <TextField
          label="Note (optional)"
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder="What was this for?"
          maxLength={80}
        />
      </div>

      {error ? (
        <Callout title="Check the settlement" tone="error">
          {error}
        </Callout>
      ) : null}

      <div className="mt-1 flex flex-wrap items-center gap-3">
        <Button
          type="submit"
          variant="mint"
          iconLeft={<Send size={18} />}
          buddy="peek"
        >
          {submitLabel}
        </Button>
        <span className="paper-soft inline-flex items-center gap-1.5 text-[12px]">
          <HandCoins size={15} aria-hidden="true" />
          This updates everyone&apos;s balance right away.
        </span>
      </div>
    </form>
  );
}
