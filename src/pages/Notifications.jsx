import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Check,
  HandCoins,
  MessageCircle,
  ReceiptText,
  UserPlus,
  X,
} from "lucide-react";
import {
  Avatar,
  Button,
  Count,
  EmptyState,
  Sheet,
  Tabs,
  TabList,
  Tab,
  TabPanel,
  Tag,
  toast,
} from "@plop-ui/react";
import { useApp } from "../context/AppContext";
import { formatDateTime, relativeTime } from "../lib/format";
import PageHeader from "../components/ui/PageHeader";

const TYPE_META = {
  invite: { icon: UserPlus, fill: "var(--plop-mustard)", label: "Invitation" },
  comment: { icon: MessageCircle, fill: "var(--plop-periwinkle)", label: "Comment" },
  expense: { icon: ReceiptText, fill: "var(--plop-mint)", label: "Expense" },
  settlement: { icon: HandCoins, fill: "var(--plop-bubblegum)", label: "Settlement" },
};

export default function Notifications() {
  const {
    notifications,
    groups,
    users,
    unreadCount,
    markNotificationRead,
    markAllNotificationsRead,
    respondToInvitation,
  } = useApp();
  const [touchedId, setTouchedId] = useState(null);

  const sorted = useMemo(
    () =>
      notifications
        .slice()
        .sort((a, b) => new Date(b.date) - new Date(a.date)),
    [notifications],
  );
  const unread = sorted.filter((notification) => !notification.read);
  const invites = sorted.filter((notification) => notification.type === "invite");

  const handleAccept = (notification) => {
    const group = groups.find((item) => item.id === notification.groupId);
    respondToInvitation(notification.id, true);
    setTouchedId(notification.id);
    toast.success(`You joined ${group?.name ?? "the group"}`, { burst: true });
  };

  const handleDecline = (notification) => {
    respondToInvitation(notification.id, false);
    setTouchedId(notification.id);
    toast("Invitation declined");
  };

  return (
    <>
      <PageHeader
        eyebrow="Inbox"
        title="Notifications"
        description="Invites, new bills, comments and payments, all in one pile."
        actions={
          <Button
            variant="plain"
            iconLeft={<Check size={17} />}
            onClick={() => {
              markAllNotificationsRead();
              toast.success("All notifications marked as read");
            }}
            disabled={unreadCount === 0}
          >
            Mark all read
          </Button>
        }
      />

      <div className="mb-5 flex flex-wrap items-center gap-2.5">
        <Tag tone={unreadCount ? "tomato" : "mint"} tilt={-1}>
          {unreadCount ? `${unreadCount} unread` : "All caught up"}
        </Tag>
        <Tag tone="periwinkle" tilt={1}>
          {(() => {
            const pendingCount = invites.filter(
              (invite) => invite.inviteStatus === "pending",
            ).length;
            return `${pendingCount} pending ${pendingCount === 1 ? "invite" : "invites"}`;
          })()}
        </Tag>
      </div>

      <Tabs defaultValue="all">
        <TabList label="Notification filters">
          <Tab
            value="all"
            badge={unreadCount ? <Count size="sm" label={`${unreadCount} unread`}>{unreadCount}</Count> : undefined}
          >
            All
          </Tab>
          <Tab value="unread">Unread</Tab>
          <Tab value="invites">Invitations</Tab>
        </TabList>

        <TabPanel value="all">
          <NotificationList
            notifications={sorted}
            users={users}
            groups={groups}
            touchedId={touchedId}
            onAccept={handleAccept}
            onDecline={handleDecline}
            onMarkRead={markNotificationRead}
          />
        </TabPanel>

        <TabPanel value="unread">
          <NotificationList
            notifications={unread}
            users={users}
            groups={groups}
            touchedId={touchedId}
            onAccept={handleAccept}
            onDecline={handleDecline}
            onMarkRead={markNotificationRead}
            emptyText="Nothing unread. The paper tray is empty."
          />
        </TabPanel>

        <TabPanel value="invites">
          <NotificationList
            notifications={invites}
            users={users}
            groups={groups}
            touchedId={touchedId}
            onAccept={handleAccept}
            onDecline={handleDecline}
            onMarkRead={markNotificationRead}
            emptyText="No group invitations right now."
          />
        </TabPanel>
      </Tabs>
    </>
  );
}

function NotificationList({
  notifications,
  users,
  groups,
  touchedId,
  onAccept,
  onDecline,
  onMarkRead,
  emptyText,
}) {
  if (!notifications.length) {
    return (
      <div className="paper-ink rounded-[16px] border-[2.5px] border-ink bg-[var(--plop-paper)] p-6">
        <EmptyState>{emptyText || "No notifications here yet."}</EmptyState>
      </div>
    );
  }

  return (
    <Sheet tape="none" className="sheet-compact">
      <ul className="grid list-none gap-0 p-0">
        {notifications.map((notification) => {
          const meta = TYPE_META[notification.type] || TYPE_META.expense;
          const Icon = meta.icon;
          const actor = users.find((user) => user.id === notification.actorId);
          const group = groups.find((item) => item.id === notification.groupId);
          const isPendingInvite =
            notification.type === "invite" &&
            notification.inviteStatus === "pending";
          const isTouched = touchedId === notification.id;

          return (
            <li
              key={notification.id}
              className={[
                "flex flex-wrap items-start gap-3 border-b-2 border-dashed border-[var(--plop-periwinkle)] px-2 py-4 first:pt-1 last:border-0 last:pb-1",
                notification.read ? "" : "bg-[rgba(246,196,69,0.13)]",
              ].join(" ")}
            >
              <span
                className="grid h-10 w-10 shrink-0 place-items-center border-[2.5px] border-ink paper-ink"
                style={{
                  background: meta.fill,
                  borderRadius: "13px 10px 15px 9px",
                  transform: isTouched ? "rotate(-3deg)" : "none",
                }}
                aria-hidden="true"
              >
                <Icon size={19} strokeWidth={2.2} />
              </span>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <Tag tone={notification.read ? "periwinkle" : "tomato"} tilt={-1}>
                    {meta.label}
                  </Tag>
                  {!notification.read ? (
                    <span className="paper-soft text-[10px] font-bold uppercase tracking-wide">
                      New
                    </span>
                  ) : null}
                  {notification.type === "invite" &&
                  notification.inviteStatus !== "pending" ? (
                    <Tag
                      tone={
                        notification.inviteStatus === "accepted"
                          ? "mint"
                          : "tomato"
                      }
                    >
                      {notification.inviteStatus}
                    </Tag>
                  ) : null}
                </div>

                <p className="paper-ink mt-1.5 text-[14px] leading-snug">
                  <strong>{actor?.name ?? "Someone"}</strong>{" "}
                  {notification.message}
                </p>

                <div className="paper-soft mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px]">
                  <span title={formatDateTime(notification.date)}>
                    {relativeTime(notification.date)}
                  </span>
                  {group ? (
                    <>
                      <span aria-hidden="true">·</span>
                      {isPendingInvite ? (
                        <span>{group.emoji} {group.name}</span>
                      ) : (
                        <Link
                          to={`/groups/${group.id}`}
                          className="font-bold underline decoration-dotted underline-offset-2"
                        >
                          {group.emoji} {group.name}
                        </Link>
                      )}
                    </>
                  ) : null}
                  {notification.expenseId ? (
                    <>
                      <span aria-hidden="true">·</span>
                      <Link
                        to={`/expenses/${notification.expenseId}`}
                        className="font-bold underline decoration-dotted underline-offset-2"
                      >
                        View expense
                      </Link>
                    </>
                  ) : null}
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {isPendingInvite ? (
                    <>
                      <Button
                        variant="mint"
                        size="sm"
                        iconLeft={<Check size={15} />}
                        onClick={() => onAccept(notification)}
                        disabled={isTouched}
                      >
                        Accept
                      </Button>
                      <Button
                        variant="plain"
                        size="sm"
                        iconLeft={<X size={15} />}
                        onClick={() => onDecline(notification)}
                        disabled={isTouched}
                      >
                        Decline
                      </Button>
                    </>
                  ) : !notification.read ? (
                    <Button
                      variant="plain"
                      size="sm"
                      iconLeft={<Check size={15} />}
                      onClick={() => onMarkRead(notification.id)}
                    >
                      Mark read
                    </Button>
                  ) : null}
                </div>
              </div>

              <Avatar name={actor?.name || "SplitInk"} size="sm" />
            </li>
          );
        })}
      </ul>
    </Sheet>
  );
}
