import { round2, toCents } from "./format";

/**
 * Turn an expense's participant rows into a share per person.
 * Equal shares distribute leftover cents so they always add up to the total.
 */
export function getExpenseShares(expense) {
  if (!expense) return [];
  const participants = expense.participants ?? [];
  if (participants.length === 0) return [];

  const totalCents = toCents(expense.amount);

  if (expense.splitType === "exact") {
    return participants.map((participant) => ({
      ...participant,
      amount: round2(participant.value),
    }));
  }

  if (expense.splitType === "percentage") {
    let assigned = 0;
    const rows = participants.map((participant, index) => {
      const isLast = index === participants.length - 1;
      const cents = isLast
        ? totalCents - assigned
        : Math.round((totalCents * Number(participant.value || 0)) / 100);
      assigned += cents;
      return { ...participant, amount: cents / 100 };
    });
    return rows;
  }

  const baseCents = Math.floor(totalCents / participants.length);
  let remainder = totalCents - baseCents * participants.length;
  return participants.map((participant) => {
    const extra = remainder > 0 ? 1 : 0;
    remainder -= extra;
    return {
      ...participant,
      amount: (baseCents + extra) / 100,
    };
  });
}

/**
 * Net position per member for one group. Positive = owed money,
 * negative = owes money. Recorded settlements reduce the debt.
 */
export function getGroupBalances(group, expenses, settlements) {
  const balances = Object.fromEntries(
    (group?.memberIds ?? []).map((memberId) => [memberId, 0]),
  );

  if (!group) return balances;

  for (const expense of expenses) {
    if (expense.groupId !== group.id) continue;
    if (balances[expense.paidBy] === undefined) balances[expense.paidBy] = 0;
    balances[expense.paidBy] += expense.amount;

    for (const share of getExpenseShares(expense)) {
      if (balances[share.userId] === undefined) balances[share.userId] = 0;
      balances[share.userId] -= share.amount;
    }
  }

  for (const settlement of settlements) {
    if (settlement.groupId !== group.id) continue;
    if (balances[settlement.from] === undefined) balances[settlement.from] = 0;
    if (balances[settlement.to] === undefined) balances[settlement.to] = 0;
    balances[settlement.from] += settlement.amount;
    balances[settlement.to] -= settlement.amount;
  }

  for (const id of Object.keys(balances)) {
    balances[id] = round2(balances[id]);
  }

  return balances;
}

/**
 * Turn a net balance map into the smallest sensible list of payments.
 */
export function getSuggestedTransfers(balances) {
  const creditors = [];
  const debtors = [];

  for (const [userId, raw] of Object.entries(balances)) {
    const amount = round2(raw);
    if (amount > 0.004) creditors.push({ userId, amount });
    if (amount < -0.004) debtors.push({ userId, amount: -amount });
  }

  creditors.sort((a, b) => b.amount - a.amount);
  debtors.sort((a, b) => b.amount - a.amount);

  const transfers = [];
  let debtorIndex = 0;
  let creditorIndex = 0;

  while (debtorIndex < debtors.length && creditorIndex < creditors.length) {
    const debtor = debtors[debtorIndex];
    const creditor = creditors[creditorIndex];
    const amount = round2(Math.min(debtor.amount, creditor.amount));

    if (amount > 0.004) {
      transfers.push({
        from: debtor.userId,
        to: creditor.userId,
        amount,
      });
    }

    debtor.amount = round2(debtor.amount - amount);
    creditor.amount = round2(creditor.amount - amount);

    if (debtor.amount <= 0.004) debtorIndex += 1;
    if (creditor.amount <= 0.004) creditorIndex += 1;
  }

  return transfers;
}

export function getGroupTotal(groupId, expenses) {
  return round2(
    expenses
      .filter((expense) => expense.groupId === groupId)
      .reduce((sum, expense) => sum + expense.amount, 0),
  );
}

export function getUserGroupSummary(groups, expenses, settlements, userId) {
  const perGroup = groups.map((group) => {
    const balances = getGroupBalances(group, expenses, settlements);
    return {
      groupId: group.id,
      balance: round2(balances[userId] ?? 0),
      total: getGroupTotal(group.id, expenses),
    };
  });

  const total = round2(perGroup.reduce((sum, row) => sum + row.balance, 0));
  const owed = round2(
    perGroup.reduce((sum, row) => sum + Math.max(row.balance, 0), 0),
  );
  const owe = round2(
    perGroup.reduce((sum, row) => sum + Math.max(-row.balance, 0), 0),
  );

  return { perGroup, total, owed, owe };
}

export function getMemberName(users, userId) {
  return users.find((user) => user.id === userId)?.name ?? "Unknown member";
}
