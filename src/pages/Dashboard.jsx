import { useMemo, useState } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Bell,
  Plus,
  ReceiptText,
  Users,
} from "lucide-react";
import { Button, ButtonLink, EmptyState } from "@plop-ui/react";
import { useApp } from "../context/AppContext";
import { getUserGroupSummary } from "../lib/balances";
import { firstName, formatLongDate } from "../lib/format";
import PageHeader from "../components/ui/PageHeader";
import SectionHeader from "../components/ui/SectionHeader";
import StatCard from "../components/StatCard";
import GroupCard from "../components/GroupCard";
import ActivityFeed from "../components/ActivityFeed";
import CreateGroupModal from "../components/CreateGroupModal";
import RouterLink from "../components/ui/RouterLink";

export default function Dashboard() {
  const {
    currentUser,
    groupsForUser,
    expenses,
    settlements,
    activity,
    notifications,
    currentUserId,
    money,
  } = useApp();
  const [groupModalOpen, setGroupModalOpen] = useState(false);

  const groupIds = useMemo(
    () => new Set(groupsForUser.map((group) => group.id)),
    [groupsForUser],
  );
  const visibleExpenses = useMemo(
    () => expenses.filter((expense) => groupIds.has(expense.groupId)),
    [expenses, groupIds],
  );
  const totalSpend = useMemo(
    () => visibleExpenses.reduce((sum, expense) => sum + expense.amount, 0),
    [visibleExpenses],
  );
  const summary = getUserGroupSummary(
    groupsForUser,
    expenses,
    settlements,
    currentUserId,
  );
  const memberCount = useMemo(
    () =>
      new Set(groupsForUser.flatMap((group) => group.memberIds)).size,
    [groupsForUser],
  );
  const recentActivity = useMemo(
    () =>
      activity
        .filter((entry) => groupIds.has(entry.groupId))
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 6),
    [activity, groupIds],
  );
  const unread = notifications.filter((notification) => !notification.read).length;

  return (
    <>
      <PageHeader
        eyebrow={formatLongDate(new Date())}
        title={`Hi, ${firstName(currentUser.name)}!`}
        description="Here is the paper trail: what your groups spent, what is still open, and who did what."
        actions={
          <>
            <ButtonLink
              as={RouterLink}
              href="/expenses/new"
              variant="tomato"
              iconLeft={<Plus size={18} />}
            >
              Add expense
            </ButtonLink>
            <Button
              variant="plain"
              iconLeft={<Users size={18} />}
              onClick={() => setGroupModalOpen(true)}
            >
              New group
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <StatCard
          label="Your net balance"
          value={money(summary.total, { showSign: true })}
          hint={
            summary.total > 0
              ? `You are owed ${money(summary.owed)} across your groups.`
              : summary.total < 0
                ? `You owe ${money(summary.owe)} across your groups.`
                : "Everything is settled. Nice and tidy."
          }
          icon={
            summary.total >= 0 ? (
              <ArrowDownLeft size={18} />
            ) : (
              <ArrowUpRight size={18} />
            )
          }
          tone={summary.total >= 0 ? "mint" : "tomato"}
        />
        <StatCard
          label="Total group expenses"
          value={money(totalSpend)}
          hint={`${visibleExpenses.length} expenses shared with ${memberCount} people.`}
          icon={<ReceiptText size={18} />}
          tone="mustard"
        />
        <StatCard
          label="Active groups"
          value={groupsForUser.length}
          hint={
            groupsForUser.length
              ? "Open one to see the full story."
              : "Create your first group to get going."
          }
          icon={<Users size={18} />}
          tone="ink"
        />
        <StatCard
          label="Unread notifications"
          value={unread}
          hint={
            unread
              ? "Invites, comments and settlements are waiting."
              : "All caught up. Go split something."
          }
          icon={<Bell size={18} />}
          tone={unread ? "tomato" : "mint"}
        />
      </div>

      <div className="mt-9 grid items-start gap-7 xl:grid-cols-[1.55fr_1fr]">
        <section aria-labelledby="dashboard-groups">
          <div id="dashboard-groups">
            <SectionHeader
              title="Your groups"
              linkTo="/groups"
              linkLabel="See all groups"
            />
          </div>
          {groupsForUser.length ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {groupsForUser.slice(0, 4).map((group) => (
                <GroupCard key={group.id} group={group} />
              ))}
            </div>
          ) : (
            <EmptyState>
              No groups yet. Create one and invite the people you split with.
            </EmptyState>
          )}
        </section>

        <section aria-labelledby="dashboard-activity">
          <div id="dashboard-activity">
            <SectionHeader
              title="Recent activity"
              linkTo="/notifications"
              linkLabel="Notifications"
            />
          </div>
          <div className="paper-ink rounded-[16px] border-[2.5px] border-ink bg-[var(--plop-paper)] p-4 shadow-[4px_6px_0_var(--plop-shadow)] sm:p-5">
            <ActivityFeed entries={recentActivity} showGroup />
          </div>
        </section>
      </div>

      <CreateGroupModal
        open={groupModalOpen}
        onClose={() => setGroupModalOpen(false)}
      />
    </>
  );
}
