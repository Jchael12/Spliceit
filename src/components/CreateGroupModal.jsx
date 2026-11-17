import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  MultiSelect,
  Select,
  TextArea,
  TextField,
  toast,
} from "@plop-ui/react";
import { Plus } from "lucide-react";
import { useApp } from "../context/AppContext";
import Modal from "./ui/Modal";

const EMOJI_OPTIONS = [
  { value: "🏠", label: "🏠 Home" },
  { value: "✈️", label: "✈️ Trip" },
  { value: "🍜", label: "🍜 Food" },
  { value: "🎨", label: "🎨 Studio" },
  { value: "🥾", label: "🥾 Outdoors" },
  { value: "🎉", label: "🎉 Friends" },
  { value: "🧾", label: "🧾 Other" },
];

const CATEGORY_OPTIONS = [
  { value: "Home", label: "Home" },
  { value: "Travel", label: "Travel" },
  { value: "Food", label: "Food" },
  { value: "Work", label: "Work" },
  { value: "Other", label: "Other" },
];

export default function CreateGroupModal({ open, onClose }) {
  const { users, currentUserId, createGroup } = useApp();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("🏠");
  const [category, setCategory] = useState("Home");
  const [description, setDescription] = useState("");
  const [memberIds, setMemberIds] = useState([]);
  const [error, setError] = useState("");

  const memberOptions = users
    .filter((user) => user.id !== currentUserId)
    .map((user) => ({
      value: user.id,
      label: user.name,
      hint: user.email,
      lead: { avatar: user.name },
    }));

  const reset = () => {
    setName("");
    setEmoji("🏠");
    setCategory("Home");
    setDescription("");
    setMemberIds([]);
    setError("");
  };

  const close = () => {
    reset();
    onClose?.();
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!name.trim()) {
      setError("Give the group a name first.");
      return;
    }

    const group = createGroup({
      name,
      emoji,
      category,
      description,
      memberIds,
      tone:
        category === "Travel"
          ? "mustard"
          : category === "Food"
            ? "tomato"
            : category === "Work"
              ? "periwinkle"
              : "mint",
    });

    toast.success(`"${group.name}" is ready`, { burst: true });
    reset();
    onClose?.();
    navigate(`/groups/${group.id}`);
  };

  return (
    <Modal
      open={open}
      onClose={close}
      title="New group"
      description="A little paper home for shared bills. Invite people now or later."
    >
      <form onSubmit={handleSubmit} className="grid gap-4">
        <TextField
          label="Group name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="e.g. Apartment 4B"
          error={error || undefined}
          maxLength={40}
          required
          autoFocus
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            label="Icon"
            options={EMOJI_OPTIONS}
            value={emoji}
            onValueChange={setEmoji}
          />
          <Select
            label="Category"
            options={CATEGORY_OPTIONS}
            value={category}
            onValueChange={setCategory}
          />
        </div>

        <TextArea
          label="Description (optional)"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="What is this group for?"
          rows={2}
          maxLength={120}
        />

        <MultiSelect
          label="Invite members"
          options={memberOptions}
          value={memberIds}
          onValueChange={setMemberIds}
          placeholder="Pick people to invite"
          hint="You are added automatically."
          searchable
          searchLabel="Search people"
        />

        <div className="mt-2 flex flex-wrap items-center gap-3">
          <Button
            type="submit"
            variant="tomato"
            iconLeft={<Plus size={18} />}
            buddy="peek"
          >
            Create group
          </Button>
          <Button type="button" variant="plain" onClick={close}>
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  );
}
