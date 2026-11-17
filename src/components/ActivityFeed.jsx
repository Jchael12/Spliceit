import { Link } from "react-router-dom";
import { Avatar } from "@plop-ui/react";
import { useApp } from "../context/AppContext";
import { firstName, relativeTime } from "../lib/format";

export default function ActivityFeed({ entries, showGroup = true, emptyText }) {
  const { users, groups } = useApp();

  if (!entries.length) {
    return (
      <p className="paper-soft rounded-[10px] border-2 border-dashed border-[var(--plop-periwinkle)] px-4 py-6 text-center text-sm">
        {emptyText || "Nothing has happened here yet."}
      </p>
    );
  }

  return (
    <ul className="m-0 list-none p-0">
      {entries.map((entry) => {
        const user = users.find((item) => item.id === entry.userId);
        const group = groups.find((item) => item.id === entry.groupId);
        return (
          <li
            key={entry.id}
            className="flex gap-3 border-b-2 border-dashed border-[var(--plop-periwinkle)] py-3 first:pt-0 last:border-b-0 last:pb-0"
          >
            <div className="pt-0.5">
              <Avatar name={user?.name || "SplitInk"} size="sm" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="paper-ink m-0 text-[14px] leading-snug">
                <strong>{firstName(user?.name) || "Someone"}</strong>{" "}
                <span>{entry.text}</span>
              </p>
              <div className="paper-soft mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px]">
                <span>{relativeTime(entry.date)}</span>
                {showGroup && group ? (
                  <>
                    <span aria-hidden="true">·</span>
                    <Link
                      to={`/groups/${group.id}`}
                      className="font-bold underline decoration-dotted underline-offset-2"
                    >
                      {group.emoji} {group.name}
                    </Link>
                  </>
                ) : null}
                {entry.expenseId ? (
                  <>
                    <span aria-hidden="true">·</span>
                    <Link
                      to={`/expenses/${entry.expenseId}`}
                      className="font-bold underline decoration-dotted underline-offset-2"
                    >
                      View expense
                    </Link>
                  </>
                ) : null}
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
