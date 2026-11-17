import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  CircleDollarSign,
  HandCoins,
  Plus,
  ReceiptText,
  Users,
} from "lucide-react";
import {
  Avatar,
  Button,
  EmptyState,
  Heading,
  Sheet,
  Tabs,
  TabList,
  Tab,
  TabPanel,
  Tag,
} from "@plop-ui/react";
import { useApp } from "../context/AppContext";
import {
  getGroupBalances,
  getSuggestedTransfers,
  getUserGroupSummary,
} from "../lib/balances";
import { formatDate, formatLongDate, relativeTime } from "../lib/format";
import PageHeader from "../components/ui/PageHeader";
import StatCard from "../components/StatCard";
import BalanceTag from "../components/ui/BalanceTag";
import Modal from "../components/ui/Modal";
import SettleUpForm from "../components/SettleUpForm";

export default function Balances() {
  const {
    groupsForUser,
    expenses,
    settlements,
    users,
    currentUserId,
    money,
  } = useApp();
  const [settleOpen, setSettleOpen] = useState(false);
  const [preset, setPreset] = useState(null);

  const summary = getUserGroupSummary(
    groupsForUser,
    expenses,
    settlements,
    currentUserId,
  );

  const groupRows = useMemo(
    () =>
      groupsForUser.map((group) => {
        const balances = getGroupBalances(group, expenses, settlements);
        return {
          group,
          balances,
          transfers: getSuggestedTransfers(balances),
          yourBalance: balances[currentUserId] ?? 0,
        };
      }),
    [currentUserId, expenses, groupsForUser, settlements],
  );

  const openGroups = groupRows.filter((row) => row.transfers.length > 0);
  const groupIds = new Set(groupsForUser.map((group) => group.id));
  const visibleSettlements = settlements
    .filter((settlement) => groupIds.has(settlement.groupId))
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const totalSettled = visibleSettlements.reduce(
    (sum, settlement) => sum + settlement.amount,
    0,
  );

  const openSettle = (nextPreset = null) => {
    setPreset(nextPreset);
    setSettleOpen(true);
  };

  return (
    <>
      <PageHeader
        eyebrow="The honest ledger"
        title="Balances"
        description="See who owes whom, record payments, and keep the paper trail clean."
        actions={
          <Button
            variant="mint"
            iconLeft={<HandCoins size={18} />}
            onClick={() => openSettle(null)}
          >
            Record settlement
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Your net balance"
          value={money(summary.total, { showSign: true })}
          hint={
            summary.total > 0
              ? "You are owed more than you owe."
              : summary.total < 0
                ? "You owe more than you are owed."
                : "Everything balances out."
          }
          icon={<CircleDollarSign size={18} />}
          tone={summary.total >= 0 ? "mint" : "tomato"}
        />
        <StatCard
          label="You are owed"
          value={money(summary.owed)}
          hint="Across your open groups."
          icon={<ReceiptText size={18} />}
          tone="mint"
        />
        <StatCard
          label="You owe"
          value={money(summary.owe)}
          hint="Payments you can settle now."
          icon={<HandCoins size={18} />}
          tone="tomato"
        />
        <StatCard
          label="Settlements recorded"
          value={visibleSettlements.length}
          hint={`${money(totalSettled)} moved between friends.`}
          icon={<Users size={18} />}
          tone="mustard"
        />
      </div>

      <div className="mt-8">
        <Tabs defaultValue="open">
          <TabList label="Balance views">
            <Tab value="open">Open balances</Tab>
            <Tab value="history">Settlement history</Tab>
          </TabList>

          <TabPanel value="open">
            {openGroups.length ? (
              <div className="grid gap-5">
                {openGroups.map(({ group, transfers, yourBalance }) => (
                  <Sheet
                    key={group.id}
                    tape="mustard"
                    className="sheet-compact"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span
                          className="grid h-11 w-11 place-items-center border-[2.5px] border-ink text-xl"
                          style={{
                            background: "var(--plop-periwinkle)",
                            borderRadius: "14px 10px 16px 9px",
                          }}
                          aria-hidden="true"
                        >
                          {group.emoji}
                        </span>
                        <div>
                          <Link
                            to={`/groups/${group.id}`}
                            className="paper-ink block text-[18px] font-bold underline decoration-dotted underline-offset-2"
                          >
                            {group.name}
                          </Link>
                          <span className="paper-soft text-[12px]">
                            {transfers.length} suggested{" "}
                            {transfers.length === 1 ? "payment" : "payments"}
                          </span>
                        </div>
                      </div>
                      <BalanceTag value={yourBalance} showWord={false} />
                    </div>

                    <ul className="mt-4 grid list-none gap-0 p-0">
                      {transfers.map((transfer, index) => {
                        const from = users.find((user) => user.id === transfer.from);
                        const to = users.find((user) => user.id === transfer.to);
                        return (
                          <li
                            key={`${transfer.from}-${transfer.to}-${index}`}
                            className="flex flex-wrap items-center gap-2.5 border-b-2 border-dashed border-[var(--plop-periwinkle)] py-3 last:border-0"
                          >
                            <Avatar name={from?.name || "Payer"} size="sm" />
                            <span className="paper-ink min-w-0 flex-1 text-[14px] leading-snug">
                              <strong>{from?.name}</strong>
                              <ArrowRight
                                size={13}
                                className="mx-1 inline-block align-middle"
                                aria-hidden="true"
                              />
                              <strong>{to?.name}</strong>
                            </span>
                            <Tag tone="mint" tilt={index % 2 ? -1 : 1}>
                              {money(transfer.amount)}
                            </Tag>
                            <Button
                              variant="plain"
                              size="sm"
                              iconLeft={<Plus size={14} />}
                              onClick={() =>
                                openSettle({
                                  groupId: group.id,
                                  from: transfer.from,
                                  to: transfer.to,
                                  amount: transfer.amount,
                                })
                              }
                            >
                              Record
                            </Button>
                          </li>
                        );
                      })}
                    </ul>
                  </Sheet>
                ))}
              </div>
            ) : (
              <div className="paper-ink rounded-[16px] border-[2.5px] border-ink bg-[var(--plop-paper)] p-6">
                <EmptyState>
                  Everything is settled across your groups. Enjoy the quiet.
                </EmptyState>
              </div>
            )}
          </TabPanel>

          <TabPanel value="history">
            <Sheet tape="periwinkle" className="sheet-compact">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Heading level={3} scribble={false} writeOn={false}>
                  Payments already made
                </Heading>
                <Tag tone="mustard">{visibleSettlements.length} total</Tag>
              </div>

              {visibleSettlements.length ? (
                <ul className="mt-4 grid list-none gap-0 p-0">
                  {visibleSettlements.map((settlement) => {
                    const group = groupsForUser.find(
                      (item) => item.id === settlement.groupId,
                    );
                    const from = users.find((user) => user.id === settlement.from);
                    const to = users.find((user) => user.id === settlement.to);
                    return (
                      <li
                        key={settlement.id}
                        className="flex flex-wrap items-center gap-2.5 border-b-2 border-dashed border-[var(--plop-periwinkle)] py-3 last:border-0"
                      >
                        <Avatar name={from?.name || "Payer"} size="sm" />
                        <div className="min-w-0 flex-1">
                          <p className="paper-ink m-0 text-[14px] leading-snug">
                            <strong>{from?.name}</strong> paid{" "}
                            <strong>{to?.name}</strong> {money(settlement.amount)}
                          </p>
                          <p className="paper-soft m-0 text-[11px]">
                            {formatDate(settlement.date)} · {settlement.method}
                            {group ? (
                              <>
                                {" · "}
                                <Link
                                  to={`/groups/${group.id}`}
                                  className="font-bold underline decoration-dotted underline-offset-2"
                                >
                                  {group.emoji} {group.name}
                                </Link>
                              </>
                            ) : null}
                          </p>
                          {settlement.note ? (
                            <p className="paper-soft m-0 mt-0.5 text-[11px] italic">
                              “{settlement.note}”
                            </p>
                          ) : null}
                        </div>
                        <span className="paper-soft shrink-0 text-[11px]">
                          {relativeTime(settlement.date)}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div className="mt-4">
                  <EmptyState>
                    No settlements recorded yet. Use the button above when
                    someone pays up.
                  </EmptyState>
                </div>
              )}
            </Sheet>
          </TabPanel>
        </Tabs>
      </div>

      <Modal
        open={settleOpen}
        onClose={() => setSettleOpen(false)}
        title="Record a settlement"
        description="Payments update the balances straight away, for everyone."
      >
        <SettleUpForm
          defaultGroupId={groupsForUser[0]?.id}
          preset={preset}
          onDone={() => setSettleOpen(false)}
        />
      </Modal>

      <p className="soft mt-8 text-center text-[12px]">
        Balances are calculated from mock expenses. No real money moves here.
      </p>
    </>
  );
}
