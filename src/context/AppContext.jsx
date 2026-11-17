import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import {
  CURRENT_USER_ID,
  seedActivity,
  seedExpenses,
  seedGroups,
  seedNotifications,
  seedProfile,
  seedSettlements,
  seedUsers,
} from "../data/mockData";
import { formatMoney } from "../lib/format";

const AppContext = createContext(null);

const makeId = (prefix) =>
  `${prefix}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`;

export function AppProvider({ children }) {
  const [users] = useState(seedUsers);
  const [groups, setGroups] = useState(seedGroups);
  const [expenses, setExpenses] = useState(seedExpenses);
  const [settlements, setSettlements] = useState(seedSettlements);
  const [activity, setActivity] = useState(seedActivity);
  const [notifications, setNotifications] = useState(seedNotifications);
  const [profile, setProfile] = useState(seedProfile);

  const currentUserId = profile.id || CURRENT_USER_ID;

  const currentUser = useMemo(
    () =>
      users.find((user) => user.id === currentUserId) ?? {
        id: currentUserId,
        name: profile.name,
        email: profile.email,
      },
    [currentUserId, profile.email, profile.name, users],
  );

  const groupsForUser = useMemo(
    () =>
      groups.filter((group) => group.memberIds.includes(currentUserId)),
    [currentUserId, groups],
  );

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.read).length,
    [notifications],
  );

  const money = useCallback(
    (value, options) => formatMoney(value, profile.currency, options),
    [profile.currency],
  );

  const getUser = useCallback(
    (userId) => users.find((user) => user.id === userId),
    [users],
  );

  const addActivity = useCallback((entry) => {
    setActivity((previous) => [
      {
        id: makeId("a"),
        date: new Date().toISOString(),
        ...entry,
      },
      ...previous,
    ]);
  }, []);

  const createGroup = useCallback(
    (input) => {
      const memberIds = Array.from(
        new Set([currentUserId, ...(input.memberIds ?? [])]),
      );
      const group = {
        id: makeId("g"),
        name: input.name.trim(),
        emoji: input.emoji || "🧾",
        category: input.category || "Other",
        tone: input.tone || "mint",
        description: input.description?.trim() || "",
        memberIds,
        createdAt: new Date().toISOString(),
      };

      setGroups((previous) => [group, ...previous]);
      addActivity({
        groupId: group.id,
        userId: currentUserId,
        type: "group_created",
        text: "created the group",
      });
      return group;
    },
    [addActivity, currentUserId],
  );

  const deleteGroup = useCallback((groupId) => {
    setGroups((previous) => previous.filter((group) => group.id !== groupId));
    setExpenses((previous) =>
      previous.filter((expense) => expense.groupId !== groupId),
    );
    setSettlements((previous) =>
      previous.filter((settlement) => settlement.groupId !== groupId),
    );
    setActivity((previous) =>
      previous.filter((entry) => entry.groupId !== groupId),
    );
    setNotifications((previous) =>
      previous.filter((notification) => notification.groupId !== groupId),
    );
  }, []);

  const addGroupMember = useCallback(
    (groupId, userId) => {
      setGroups((previous) =>
        previous.map((group) =>
          group.id === groupId && !group.memberIds.includes(userId)
            ? { ...group, memberIds: [...group.memberIds, userId] }
            : group,
        ),
      );
      const member = users.find((user) => user.id === userId);
      addActivity({
        groupId,
        userId: currentUserId,
        type: "member_joined",
        text: `added ${member?.name ?? "a member"} to the group`,
      });
    },
    [addActivity, currentUserId, users],
  );

  const addExpense = useCallback(
    (input) => {
      const expense = {
        id: makeId("e"),
        groupId: input.groupId,
        title: input.title.trim(),
        amount: Number(input.amount),
        category: input.category || "Other",
        date: input.date,
        paidBy: input.paidBy,
        splitType: input.splitType,
        participants: input.participants,
        notes: input.notes?.trim() || "",
        comments: [],
        createdAt: new Date().toISOString(),
      };

      setExpenses((previous) => [expense, ...previous]);
      addActivity({
        groupId: expense.groupId,
        userId: currentUserId,
        type: "expense_added",
        text: `added "${expense.title}"`,
        expenseId: expense.id,
      });
      return expense;
    },
    [addActivity, currentUserId],
  );

  const updateExpense = useCallback(
    (expenseId, input) => {
      const existing = expenses.find((expense) => expense.id === expenseId);
      if (!existing) return null;

      const updated = {
        ...existing,
        ...input,
        title: input.title.trim(),
        amount: Number(input.amount),
        notes: input.notes?.trim() || "",
        comments: existing.comments,
      };

      setExpenses((previous) =>
        previous.map((expense) =>
          expense.id === expenseId ? updated : expense,
        ),
      );
      addActivity({
        groupId: input.groupId,
        userId: currentUserId,
        type: "expense_edited",
        text: `edited "${input.title.trim()}"`,
        expenseId,
      });
      return updated;
    },
    [addActivity, currentUserId, expenses],
  );

  const deleteExpense = useCallback(
    (expenseId) => {
      const removed =
        expenses.find((expense) => expense.id === expenseId) ?? null;
      setExpenses((previous) =>
        previous.filter((expense) => expense.id !== expenseId),
      );
      setNotifications((previous) =>
        previous.filter(
          (notification) => notification.expenseId !== expenseId,
        ),
      );
      return removed;
    },
    [expenses],
  );

  const addComment = useCallback(
    (expenseId, text) => {
      const trimmed = text.trim();
      if (!trimmed) return null;

      const expense = expenses.find((item) => item.id === expenseId);
      if (!expense) return null;

      const newComment = {
        id: makeId("c"),
        userId: currentUserId,
        text: trimmed,
        date: new Date().toISOString(),
      };

      setExpenses((previous) =>
        previous.map((item) =>
          item.id === expenseId
            ? { ...item, comments: [...(item.comments ?? []), newComment] }
            : item,
        ),
      );

      addActivity({
        groupId: expense.groupId,
        userId: currentUserId,
        type: "comment",
        text: `commented on "${expense.title}"`,
        expenseId,
      });

      return newComment;
    },
    [addActivity, currentUserId, expenses],
  );

  const recordSettlement = useCallback(
    (input) => {
      const settlement = {
        id: makeId("s"),
        groupId: input.groupId,
        from: input.from,
        to: input.to,
        amount: Number(input.amount),
        date: input.date,
        method: input.method || "Bank transfer",
        note: input.note?.trim() || "",
      };

      setSettlements((previous) => [settlement, ...previous]);

      const fromName = users.find((user) => user.id === settlement.from)?.name;
      const toName = users.find((user) => user.id === settlement.to)?.name;
      addActivity({
        groupId: settlement.groupId,
        userId: settlement.from,
        type: "settlement",
        text: `paid ${toName ?? "a member"} ${money(settlement.amount)}`,
      });

      return { settlement, fromName, toName };
    },
    [addActivity, money, users],
  );

  const markNotificationRead = useCallback((notificationId) => {
    setNotifications((previous) =>
      previous.map((notification) =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification,
      ),
    );
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setNotifications((previous) =>
      previous.map((notification) => ({ ...notification, read: true })),
    );
  }, []);

  const respondToInvitation = useCallback(
    (notificationId, accept) => {
      const notification = notifications.find(
        (item) => item.id === notificationId,
      );
      if (!notification) return;

      if (accept && notification.groupId) {
        setGroups((previous) =>
          previous.map((group) =>
            group.id === notification.groupId &&
            !group.memberIds.includes(currentUserId)
              ? { ...group, memberIds: [...group.memberIds, currentUserId] }
              : group,
          ),
        );
        addActivity({
          groupId: notification.groupId,
          userId: currentUserId,
          type: "member_joined",
          text: "joined the group",
        });
      }

      setNotifications((previous) =>
        previous.map((item) =>
          item.id === notificationId
            ? {
                ...item,
                read: true,
                inviteStatus: accept ? "accepted" : "declined",
              }
            : item,
        ),
      );
    },
    [addActivity, currentUserId, notifications],
  );

  const updateProfile = useCallback((updates) => {
    setProfile((previous) => ({ ...previous, ...updates }));
  }, []);

  const value = useMemo(
    () => ({
      users,
      groups,
      groupsForUser,
      expenses,
      settlements,
      activity,
      notifications,
      unreadCount,
      profile,
      currentUser,
      currentUserId,
      money,
      getUser,
      createGroup,
      deleteGroup,
      addGroupMember,
      addExpense,
      updateExpense,
      deleteExpense,
      addComment,
      recordSettlement,
      markNotificationRead,
      markAllNotificationsRead,
      respondToInvitation,
      updateProfile,
    }),
    [
      activity,
      addComment,
      addExpense,
      addGroupMember,
      createGroup,
      currentUser,
      currentUserId,
      deleteExpense,
      deleteGroup,
      expenses,
      getUser,
      groups,
      groupsForUser,
      markAllNotificationsRead,
      markNotificationRead,
      money,
      notifications,
      profile,
      recordSettlement,
      respondToInvitation,
      settlements,
      unreadCount,
      updateExpense,
      updateProfile,
      users,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used inside AppProvider");
  }
  return context;
}
