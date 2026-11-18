import { useState } from "react";
import {
  Bell,
  Check,
  Info,
  Monitor,
  Moon,
  Palette,
  Save,
  Sun,
  UserRound,
} from "lucide-react";
import {
  Avatar,
  Button,
  Callout,
  Heading,
  Select,
  Sheet,
  Switch,
  Tag,
  TextField,
  toast,
} from "@plop-ui/react";
import { useApp } from "../context/AppContext";
import PageHeader from "../components/ui/PageHeader";

const CURRENCIES = [
  { value: "USD", label: "USD - US dollar" },
  { value: "EUR", label: "EUR - Euro" },
  { value: "GBP", label: "GBP - British pound" },
  { value: "PHP", label: "PHP - Philippine Peso" },
  { value: "AUD", label: "AUD - Australian dollar" },
];

const THEMES = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
];

const SURFACES = [
  { value: "poster", label: "Poster", swatch: "#EEE7D6" },
  { value: "mat", label: "Cutting mat", swatch: "#CFE3D2" },
  { value: "notebook", label: "Notebook", swatch: "#F5F0E1" },
  { value: "kraft", label: "Kraft", swatch: "#D9BE96" },
  { value: "riso", label: "Riso", swatch: "#F4D9D3" },
].map((surface) => ({
  value: surface.value,
  label: surface.label,
  swatch: surface.swatch,
}));

export default function Settings() {
  const {
    profile,
    currentUser,
    updateProfile,
    groupsForUser,
    expenses,
    notifications,
    theme,
    setTheme,
  } = useApp();
  const [form, setForm] = useState({
    name: profile.name,
    email: profile.email,
    currency: profile.currency,
    surface: profile.surface,
    notifyExpenses: profile.notifyExpenses,
    notifyComments: profile.notifyComments,
    notifySettlements: profile.notifySettlements,
    weeklySummary: profile.weeklySummary,
  });

  const update = (key, value) => {
    setForm((previous) => ({ ...previous, [key]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!form.name.trim() || !form.email.trim()) {
      toast.error("Name and email cannot be empty");
      return;
    }
    updateProfile({
      ...form,
      name: form.name.trim(),
      email: form.email.trim(),
    });
    toast.success("Settings saved", { burst: true });
  };

  const paidCount = expenses.filter(
    (expense) => expense.paidBy === profile.id,
  ).length;

  return (
    <>
      <PageHeader
        eyebrow="Your corner"
        title="Settings"
        description="A name, an email, and the paper you like to work on. No passwords, no fuss."
        actions={
          <Button
            type="submit"
            form="settings-form"
            variant="tomato"
            iconLeft={<Save size={18} />}
          >
            Save changes
          </Button>
        }
      />

      <form
        id="settings-form"
        onSubmit={handleSubmit}
        className="grid items-start gap-6 xl:grid-cols-[1.2fr_1fr]"
      >
        <div className="grid gap-6">
          <Sheet tape="mustard" className="sheet-compact">
            <div className="flex items-center gap-2">
              <UserRound size={20} aria-hidden="true" />
              <Heading level={3} scribble={false} writeOn={false}>
                Profile
              </Heading>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-4">
              <Avatar name={form.name || currentUser.name} size="lg" status="online" />
              <div>
                <p className="paper-ink text-[17px] font-bold">
                  {form.name || "Your name"}
                </p>
                <p className="paper-soft text-[13px]">
                  {form.email || "you@example.com"}
                </p>
                <Tag tone="periwinkle" tilt={-1} className="mt-1">
                  Demo account
                </Tag>
              </div>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <TextField
                label="Display name"
                value={form.name}
                onChange={(event) => update("name", event.target.value)}
                maxLength={40}
                required
              />
              <TextField
                label="Email"
                type="email"
                value={form.email}
                onChange={(event) => update("email", event.target.value)}
                maxLength={80}
                required
              />
              <div className="sm:col-span-2">
                <Select
                  label="Currency"
                  options={CURRENCIES}
                  value={form.currency}
                  onValueChange={(value) => update("currency", value)}
                  hint="Used for every amount in the app."
                />
              </div>
            </div>

            <div className="mt-5 grid gap-2 rounded-[10px] border-2 border-dashed border-[var(--plop-periwinkle)] p-3 text-[12px]">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="paper-soft">Groups joined</span>
                <strong className="paper-ink">{groupsForUser.length}</strong>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="paper-soft">Expenses paid</span>
                <strong className="paper-ink">{paidCount}</strong>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="paper-soft">Notifications received</span>
                <strong className="paper-ink">{notifications.length}</strong>
              </div>
            </div>
          </Sheet>

          <Sheet tape="periwinkle" className="sheet-compact">
            <div className="flex items-center gap-2">
              <Palette size={20} aria-hidden="true" />
              <Heading level={3} scribble={false} writeOn={false}>
                Paper & appearance
              </Heading>
            </div>
            <p className="paper-soft mt-1 text-[13px]">
              Pick the surface SplitInk sits on. Save to see it across the whole
              app.
            </p>

            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-5">
              {SURFACES.map((surface) => {
                const selected = form.surface === surface.value;
                return (
                  <button
                    key={surface.value}
                    type="button"
                    onClick={() => update("surface", surface.value)}
                    aria-pressed={selected}
                    className={[
                      "relative flex flex-col items-center gap-1.5 rounded-[12px] border-[2.5px] p-2 text-[12px] font-bold transition-transform",
                      selected
                        ? "border-ink paper-ink shadow-[3px_4px_0_var(--plop-shadow)]"
                        : "border-transparent paper-soft hover:-translate-y-0.5",
                    ].join(" ")}
                  >
                    <span
                      className="h-10 w-full rounded-[7px] border-2 border-ink"
                      style={{ background: surface.swatch }}
                      aria-hidden="true"
                    />
                    {surface.label}
                    {selected ? (
                      <span className="absolute -right-1.5 -top-1.5 grid h-5 w-5 place-items-center rounded-full border-2 border-ink bg-[var(--plop-mint)]">
                        <Check size={12} strokeWidth={3} aria-hidden="true" />
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>

            <div className="mt-5 border-t-2 border-dashed border-[var(--plop-periwinkle)] pt-4">
              <p className="paper-ink text-[13px] font-bold">Theme</p>
              <p className="paper-soft mt-0.5 text-[12px] leading-snug">
                Applies right away and is remembered on this device.
              </p>
              <div
                className="mt-2 grid grid-cols-3 gap-2"
                role="group"
                aria-label="Color theme"
              >
                {THEMES.map(({ value, label, icon: Icon }) => {
                  const selected = theme === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setTheme(value)}
                      aria-pressed={selected}
                      className={[
                        "flex items-center justify-center gap-1.5 rounded-[10px] border-[2.5px] px-2 py-2 text-[12px] font-bold transition-transform",
                        selected
                          ? "border-ink paper-ink shadow-[2px_3px_0_var(--plop-shadow)]"
                          : "border-transparent paper-soft hover:-translate-y-0.5",
                      ].join(" ")}
                    >
                      <Icon size={15} strokeWidth={2.4} aria-hidden="true" />
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          </Sheet>
        </div>

        <div className="grid gap-6">
          <Sheet tape="mint" className="sheet-compact">
            <div className="flex items-center gap-2">
              <Bell size={20} aria-hidden="true" />
              <Heading level={3} scribble={false} writeOn={false}>
                Notifications
              </Heading>
            </div>
            <p className="paper-soft mt-1 text-[13px]">
              These are demo preferences. Nothing is emailed or pushed.
            </p>

            <div className="mt-4 grid gap-4">
              <div>
                <Switch
                  checked={form.notifyExpenses}
                  onCheckedChange={(checked) => update("notifyExpenses", checked)}
                  color="mint"
                >
                  New expenses
                </Switch>
                <p className="paper-soft mt-1 pl-1 text-[12px] leading-snug">
                  Tell me when someone adds a bill to my groups.
                </p>
              </div>
              <div>
                <Switch
                  checked={form.notifyComments}
                  onCheckedChange={(checked) => update("notifyComments", checked)}
                  color="mint"
                >
                  Comments and replies
                </Switch>
                <p className="paper-soft mt-1 pl-1 text-[12px] leading-snug">
                  Tell me when someone comments on an expense.
                </p>
              </div>
              <div>
                <Switch
                  checked={form.notifySettlements}
                  onCheckedChange={(checked) => update("notifySettlements", checked)}
                  color="mint"
                >
                  Settlements
                </Switch>
                <p className="paper-soft mt-1 pl-1 text-[12px] leading-snug">
                  Tell me when a payment is recorded.
                </p>
              </div>
              <div>
                <Switch
                  checked={form.weeklySummary}
                  onCheckedChange={(checked) => update("weeklySummary", checked)}
                  color="ink"
                >
                  Weekly summary
                </Switch>
                <p className="paper-soft mt-1 pl-1 text-[12px] leading-snug">
                  A gentle Sunday recap of open balances.
                </p>
              </div>
            </div>
          </Sheet>

          <Sheet tape="mustard" className="sheet-compact">
            <Heading level={3} scribble={false} writeOn={false}>
              Account
            </Heading>
            <div className="paper-soft mt-3 grid gap-2 text-[13px]">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span>Account ID</span>
                <strong className="paper-ink">{profile.id}</strong>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span>Plan</span>
                <strong className="paper-ink">Free demo</strong>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span>Member since</span>
                <strong className="paper-ink">January 2026</strong>
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-2.5">
              <Button
                type="submit"
                variant="tomato"
                iconLeft={<Save size={18} />}
              >
                Save changes
              </Button>
              <p className="paper-soft text-center text-[11px]">
                No authentication is connected in this MVP.
              </p>
            </div>
          </Sheet>

          <Callout
            title="A real app would need a backend"
            tone="info"
            buddy={false}
          >
            This frontend keeps everything in memory. Refreshing the page resets
            the demo data. Sign-in, payments and email are intentionally left
            out.
          </Callout>

          <div className="flex items-center justify-center gap-2 text-[12px] soft">
            <Info size={14} aria-hidden="true" />
            SplitInk MVP · built with React, Vite and PlopUI.
          </div>
        </div>
      </form>
    </>
  );
}
