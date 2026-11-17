import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeftRight,
  HandCoins,
  MoreHorizontal,
  Plus,
  ReceiptText,
  Trash2,
  UserPlus,
  Users,
} from "lucide-react";
import {
  Avatar,
  Breadcrumb,
  Button,
  ButtonLink,
  EmptyState,
  Heading,
  Menu,
  Select,
  Sheet,
  Tabs,
  TabList,
  Tab,
  TabPanel,
  Tag,
  toast,
} from "@plop-ui/react";
import { useApp } from "../context/AppContext";
import {
  getGroupBalances,
  getGroupTotal,
  getSuggestedTransfers,
} from "../lib/balances";
import { formatDate, formatLongDate, relativeTime } from "../lib/format";
import PageHeader from "../components/ui/PageHeader";
import StatCard from "../components/StatCard";
import ExpenseCard from "../components/ExpenseCard";
import ActivityFeed from "../components/ActivityFeed";
import BalanceTag from "../components/ui/BalanceTag";
import Modal from "../components/ui/Modal";
import RouterLink from "../components/ui/RouterLink";
import SettleUpForm from "../components/SettleUpForm";

export default function GroupDetail() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const {
    groups,
    users,
    expenses,
    settlements,
    activity,
    currentUserId,
    money,
    deleteGroup,
    addGroupMember,
  } = useApp();

  const [settleOpen, setSettleOpen] = useState(false);
  const [memberOpen, setMemberOpen] = useState(false);

  const group = groups.find((item) => item.id === groupId);
  const isMember = group?.memberIds.includes(currentUserId);

  const groupExpenses = useMemo(
    () =>
      expenses
        .filter((expense) => expense.groupId === groupId)
        .sort((a, b) => new Date(b.date) - new Date(a.date)),
    [expenses, groupId],
  );
  const groupSettlements = useMemo(
    () =>
      settlements
        .filter((settlement) => settlement.groupId === groupId)
        .sort((a, b) => new Date(b.date) - new Date(a.date)),
    [groupId, settlements],
  );
  const groupActivity = useMemo(
    () =>
      activity
        .filter((entry) => entry.groupId === groupId)
        .sort((a, b) => new Date(b.date) - new Date(a.date)),
    [activity, groupId],
  );

  if (!group || !isMember) {
    return (
      <div className="mx-auto max-w-lg">
        <PageHeader title="Group not found" description="This group may have been deleted, or you have not joined it yet." />
        <Link
          to="/groups"
          className="soft font-bold underline decoration-dotted underline-offset-4"
        >
          Back to your groups
        </Link>
      </div>
    );
  }

  const members = group.memberIds
    .map((id) => users.find((user) => user.id === id))
    .filter(Boolean);
  const balances = getGroupBalances(group, expenses, settlements);
  const transfers = getSuggestedTransfers(balances);
  const yourBalance = balances[currentUserId] ?? 0;
  const total = getGroupTotal(group.id, expenses);
  const yourTransfer = transfers.find(
    (transfer) => transfer.from === currentUserId || transfer.to === currentUserId,
  );

  const settlementPreset = yourTransfer
    ? {
        groupId: group.id,
        from: yourTransfer.from,
        to: yourTransfer.to,
        amount: yourTransfer.amount,
      }
    : { groupId: group.id };

  const handleDelete = () => {
    const confirmed = window.confirm(
      `Delete "${group.name}"? Its expenses, settlements and activity will be removed from this demo.`,
    );
    if (!confirmed) return;
    deleteGroup(group.id);
    toast.success(`"${group.name}" was deleted`);
    navigate("/groups");
  };

  return (
    <div>
      <Breadcrumb
        as={RouterLink}
        items={[
          { label: "Dashboard", href: "/" },
          { label: "Groups", href: "/groups" },
          { label: group.name },
        ]}
        className="mb-4"
      />

      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <span
            className="grid h-16 w-16 shrink-0 place-items-center border-[2.5px] border-ink text-4xl"
            style={{
              background: "var(--plop-mint)",
              borderRadius: "20px 14px 22px 13px",
              boxShadow: "4px 5px 0 var(--plop-shadow)",
              transform: "rotate(-2deg)",
            }}
            aria-hidden="true"
          >
            {group.emoji}
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Tag tone={group.tone} tilt={-1}>
                {group.category}
              </Tag>
              <span className="soft text-[12px]">
                Created {formatLongDate(group.createdAt)}
              </span>
            </div>
            <Heading level={1} className="mt-1">
              {group.name}
            </Heading>
            <p className="soft mt-2 max-w-2xl text-[15px] leading-relaxed">
              {group.description || "A shared place for this group's bills."}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <div className="flex -space-x-2">
                {members.slice(0, 5).map((member) => (
                  <span
                    key={member.id}
                    className="rounded-full ring-2 ring-[var(--plop-bg)]"
                  >
                    <Avatar name={member.name} size="sm" />
                  </span>
                ))}
              </div>
              <span className="soft text-[12px]">
                {members.length} {members.length === 1 ? "member" : "members"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <ButtonLink
            as={RouterLink}
            href={`/groups/${group.id}/expenses/new`}
            variant="tomato"
            iconLeft={<Plus size={18} />}
          >
            Add expense
          </ButtonLink>
          <Button
            variant="mint"
            iconLeft={<HandCoins size={18} />}
            onClick={() => setSettleOpen(true)}
          >
            Settle up
          </Button>
          <Menu
            label="Group actions"
            icon={<MoreHorizontal size={21} />}
            align="end"
            items={[
              {
                label: "Add member",
                icon: <UserPlus size={17} />,
                onSelect: () => setMemberOpen(true),
              },
              "separator",
              {
                label: "Delete group",
                icon: <Trash2 size={17} />,
                danger: true,
                onSelect: handleDelete,
              },
            ]}
          />
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Group total"
          value={money(total)}
          hint={`${groupExpenses.length} expenses so far`}
          icon={<ReceiptText size={18} />}
          tone="mustard"
        />
        <StatCard
          label="Your balance"
          value={money(yourBalance, { showSign: true })}
          hint={
            Math.abs(yourBalance) < 0.005
              ? "You are all square in this group."
              : yourBalance > 0
                ? "The group owes you this much."
                : "You owe the group this much."
          }
          icon={<ArrowLeftRight size={18} />}
          tone={yourBalance >= 0 ? "mint" : "tomato"}
        />
        <StatCard
          label="Members"
          value={members.length}
          hint="Everyone can add expenses and settle up."
          icon={<Users size={18} />}
          tone="ink"
        />
        <StatCard
          label="Settlements"
          value={groupSettlements.length}
          hint={
            groupSettlements.length
              ? `Last one ${relativeTime(groupSettlements[0].date)}.`
              : "No payments recorded yet."
          }
          icon={<HandCoins size={18} />}
          tone="mint"
        />
      </div>

      <div className="mt-7">
        <Tabs defaultValue="expenses">
          <TabList label={`${group.name} details`}>
            <Tab value="expenses">Expenses</Tab>
            <Tab value="balances">Balances</Tab>
            <Tab value="activity">Activity</Tab>
          </TabList>

          <TabPanel value="expenses">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <BalanceTag value={yourBalance} />
              <Button
                variant="plain"
                size="sm"
                iconLeft={<Plus size={16} />}
                onClick={() => navigate(`/groups/${group.id}/expenses/new`)}
              >
                Add expense
              </Button>
            </div>
            {groupExpenses.length ? (
              <div className="grid gap-4 xl:grid-cols-2">
                {groupExpenses.map((expense) => (
                  <ExpenseCard key={expense.id} expense={expense} />
                ))}
              </div>
            ) : (
              <Sheet tape="none" className="sheet-compact">
                <EmptyState>
                  No expenses yet. Add the first bill and SplitInk will do the
                  maths.
                </EmptyState>
              </Sheet>
            )}
          </TabPanel>

          <TabPanel value="balances">
            <div className="grid gap-5 lg:grid-cols-2">
              <Sheet tape="none" className="sheet-compact">
                <Heading level={3} scribble={false} writeOn={false}>
                  Member positions
                </Heading>
                <ul className="mt-4 grid list-none gap-2 p-0">
                  {members
                    .slice()
                    .sort((a, b) => (balances[b.id] ?? 0) - (balances[a.id] ?? 0))
                    .map((member) => {
                      const value = balances[member.id] ?? 0;
                      const settled = Math.abs(value) < 0.005;
                      return (
                        <li
                          key={member.id}
                          className="flex items-center gap-3 border-b-2 border-dashed border-[var(--plop-periwinkle)] py-2 last:border-0"
                        >
                          <Avatar
                            name={member.name}
                            size="sm"
                            status={member.id === currentUserId ? "online" : undefined}
                          />
                          <span className="paper-ink min-w-0 flex-1 truncate text-sm font-bold">
                            {member.name}
                            {member.id === currentUserId ? " (you)" : ""}
                          </span>
                          <span
                            className="paper-ink text-sm font-bold"
                            style={{
                              color: settled
                                ? "var(--plop-ink-soft)"
                                : value > 0
                                  ? "var(--plop-leaf)"
                                  : "var(--plop-tomato-text)",
                            }}
                          >
                            {settled
                              ? "Settled"
                              : `${money(Math.abs(value))} ${value > 0 ? "owed" : "owes"}`}
                          </span>
                        </li>
                      );
                    })}
                </ul>
              </Sheet>

              <div>
                <Sheet tape="mustard" className="sheet-compact">
                  <Heading level={3} scribble={false} writeOn={false}>
                    Simplify debts
                  </Heading>
                  <p className="paper-soft mt-1 text-[13px]">
                    The fewest payments that settle this group.
                  </p>
                  {transfers.length ? (
                    <ul className="mt-4 grid list-none gap-2 p-0">
                      {transfers.map((transfer, index) => {
                        const from = users.find((user) => user.id === transfer.from);
                        const to = users.find((user) => user.id === transfer.to);
                        return (
                          <li
                            key={`${transfer.from}-${transfer.to}-${index}`}
                            className="flex flex-wrap items-center gap-2 border-b-2 border-dashed border-[var(--plop-periwinkle)] py-2 last:border-0"
                          >
                            <Avatar name={from?.name || "Payer"} size="sm" />
                            <span className="paper-ink text-[13px]">
                              <strong>{from?.name}</strong> pays{" "}
                              <strong>{to?.name}</strong>
                            </span>
                            <span className="ml-auto">
                              <Tag tone="mint" tilt={1}>
                                {money(transfer.amount)}
                              </Tag>
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <p className="paper-soft mt-4 text-sm">
                      All settled. No payments needed.
                    </p>
                  )}
                  <div className="mt-4">
                    <Button
                      variant="mint"
                      size="sm"
                      iconLeft={<HandCoins size={16} />}
                      onClick={() => setSettleOpen(true)}
                    >
                      Record a settlement
                    </Button>
                  </div>
                </Sheet>

                <Sheet tape="periwinkle" className="sheet-compact mt-5">
                  <Heading level={3} scribble={false} writeOn={false}>
                    Settlement history
                  </Heading>
                  {groupSettlements.length ? (
                    <ul className="mt-3 grid list-none gap-2 p-0">
                      {groupSettlements.map((settlement) => {
                        const from = users.find((user) => user.id === settlement.from);
                        const to = users.find((user) => user.id === settlement.to);
                        return (
                          <li
                            key={settlement.id}
                            className="flex flex-wrap items-center gap-2 border-b-2 border-dashed border-[var(--plop-periwinkle)] py-2 last:border-0"
                          >
                            <span className="paper-ink min-w-0 flex-1 text-[13px] leading-snug">
                              <strong>{from?.name}</strong> → <strong>{to?.name}</strong>
                              <span className="paper-soft block text-[11px]">
                                {formatDate(settlement.date)} · {settlement.method}
                              </span>
                            </span>
                            <span className="paper-ink text-sm font-bold">
                              {money(settlement.amount)}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <p className="paper-soft mt-3 text-sm">
                      No settlements recorded yet.
                    </p>
                  )}
                </Sheet>
              </div>
            </div>
          </TabPanel>

          <TabPanel value="activity">
            <Sheet tape="periwinkle" className="sheet-compact">
              <ActivityFeed
                entries={groupActivity}
                showGroup={false}
                emptyText="No activity in this group yet."
              />
            </Sheet>
          </TabPanel>
        </Tabs>
      </div>

      <Modal
        open={settleOpen}
        onClose={() => setSettleOpen(false)}
        title="Settle up"
        description={`Record a payment between members of ${group.name}.`}
      >
        <SettleUpForm
          defaultGroupId={group.id}
          preset={settlementPreset}
          onDone={() => setSettleOpen(false)}
        />
      </Modal>

      <AddMemberModal
        open={memberOpen}
        onClose={() => setMemberOpen(false)}
        group={group}
        users={users}
        onAdd={(userId) => {
          addGroupMember(group.id, userId);
          const user = users.find((item) => item.id === userId);
          toast.success(`${user?.name} joined ${group.name}`, { burst: true });
          setMemberOpen(false);
        }}
      />
    </div>
  );
}

function AddMemberModal({ open, onClose, group, users, onAdd }) {
  const [userId, setUserId] = useState(null);
  const candidates = users.filter(
    (user) => !group.memberIds.includes(user.id),
  );

  const options = candidates.map((user) => ({
    value: user.id,
    label: user.name,
    hint: user.email,
    lead: { avatar: user.name },
  }));

  return (
    <Modal
      open={open}
      onClose={() => {
        setUserId(null);
        onClose();
      }}
      title="Add a member"
      description={`Invite someone to ${group.name}.`}
      size="sm"
    >
      {candidates.length ? (
        <div className="grid gap-4">
          <Select
            label="Person"
            options={options}
            value={userId}
            onValueChange={setUserId}
            placeholder="Choose someone"
            searchable
          />
          <div className="flex flex-wrap gap-2">
            <Button
              variant="tomato"
              iconLeft={<UserPlus size={17} />}
              disabled={!userId}
              onClick={() => userId && onAdd(userId)}
            >
              Add to group
            </Button>
            <Button variant="plain" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <EmptyState>Everyone in this demo is already in the group.</EmptyState>
      )}
    </Modal>
  );
}
