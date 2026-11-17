import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { Button, EmptyState, Tag, TextField } from "@plop-ui/react";
import { useApp } from "../context/AppContext";
import { getUserGroupSummary } from "../lib/balances";
import PageHeader from "../components/ui/PageHeader";
import GroupCard from "../components/GroupCard";
import CreateGroupModal from "../components/CreateGroupModal";

export default function Groups() {
  const {
    groupsForUser,
    expenses,
    settlements,
    currentUserId,
    money,
  } = useApp();
  const [query, setQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  const summary = getUserGroupSummary(
    groupsForUser,
    expenses,
    settlements,
    currentUserId,
  );
  const totalSpend = summary.perGroup.reduce((sum, row) => sum + row.total, 0);

  const normalizedQuery = query.trim().toLowerCase();
  const filtered = groupsForUser.filter((group) => {
    if (!normalizedQuery) return true;
    return [group.name, group.category, group.description]
      .join(" ")
      .toLowerCase()
      .includes(normalizedQuery);
  });

  return (
    <>
      <PageHeader
        eyebrow="Shared notebooks"
        title="Groups"
        description="Every group keeps its members, expenses, balances and activity in one place."
        actions={
          <Button
            variant="tomato"
            iconLeft={<Plus size={18} />}
            onClick={() => setModalOpen(true)}
          >
            New group
          </Button>
        }
      />

      <div className="mb-6 flex flex-wrap items-center gap-2.5">
        <Tag tone="mustard" tilt={-1}>
          {groupsForUser.length} {groupsForUser.length === 1 ? "group" : "groups"}
        </Tag>
        <Tag tone="periwinkle" tilt={1}>
          {money(totalSpend)} shared
        </Tag>
        <Tag tone={summary.total > 0 ? "mint" : summary.total < 0 ? "tomato" : "ink"}>
          Net {money(summary.total, { showSign: true })}
        </Tag>
      </div>

      <div className="mb-6 max-w-md">
        <TextField
          label="Search groups"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Name, category or description"
          hint={
            normalizedQuery
              ? `${filtered.length} matching ${filtered.length === 1 ? "group" : "groups"}`
              : "Start typing to narrow the shelf."
          }
        />
      </div>

      {filtered.length ? (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((group) => (
            <GroupCard key={group.id} group={group} />
          ))}
        </div>
      ) : (
        <div className="paper-ink rounded-[16px] border-[2.5px] border-ink bg-[var(--plop-paper)] p-6">
          <EmptyState>
            {groupsForUser.length
              ? "No groups match that search. Try a shorter word."
              : "No groups yet. Create one and invite the people you split with."}
          </EmptyState>
          {!groupsForUser.length ? (
            <div className="mt-4 flex justify-center">
              <Button
                variant="mustard"
                iconLeft={<Plus size={18} />}
                onClick={() => setModalOpen(true)}
              >
                Create a group
              </Button>
            </div>
          ) : (
            <div className="mt-4 flex justify-center">
              <Button
                variant="plain"
                iconLeft={<Search size={17} />}
                onClick={() => setQuery("")}
              >
                Clear search
              </Button>
            </div>
          )}
        </div>
      )}

      <CreateGroupModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
