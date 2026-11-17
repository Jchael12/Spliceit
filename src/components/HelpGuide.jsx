import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Bell,
  Check,
  CircleDollarSign,
  HandCoins,
  HelpCircle,
  ReceiptText,
  Sparkles,
  UserPlus,
  Users,
} from "lucide-react";
import { Avatar, AvatarStack, Button, Heading, Tag } from "@plop-ui/react";
import Modal from "./ui/Modal";

const TONE_CLASSES = {
  mustard: "bg-[var(--plop-mustard)] paper-ink",
  tomato: "bg-[var(--plop-tomato)] text-[var(--plop-on-fill-tomato)]",
  periwinkle: "bg-[var(--plop-periwinkle)] paper-ink",
  mint: "bg-[var(--plop-mint)] paper-ink",
};

const STEPS = [
  {
    eyebrow: "Welcome",
    title: "Split bills, keep friends.",
    body: "SplitInk keeps the paper trail for every shared bill. Here is the whole loop in five small steps.",
    tone: "mustard",
    icon: Sparkles,
    bullets: [
      "Track shared bills in groups, not in a group chat.",
      "See who owes whom without doing the math.",
      "Keep comments and activity attached to every expense.",
    ],
  },
  {
    eyebrow: "Groups",
    title: "Start with a group",
    body: "A group is a shared notebook for roommates, a trip, or a dinner crew. Create one from the Groups page.",
    tone: "periwinkle",
    icon: Users,
    bullets: [
      "Give it a name, icon, category and short description.",
      "Invite people now, or add them from the group page later.",
      "Invitation-only groups join your shelf after you accept the invite.",
    ],
  },
  {
    eyebrow: "Expenses",
    title: "Write down the bill",
    body: "Open a group and choose Add expense, or use the red Add expense button anywhere in the app.",
    tone: "tomato",
    icon: ReceiptText,
    bullets: [
      "Choose who paid and who is included in the split.",
      "Split equally, by exact amounts, or by percentage.",
      "Add a note, then comment on the bill when questions come up.",
    ],
  },
  {
    eyebrow: "Balances",
    title: "Settle up in a few taps",
    body: "Balances turns all your expenses and payments into the shortest list of transfers between people.",
    tone: "mint",
    icon: HandCoins,
    bullets: [
      "Open Balances to see who owes whom right now.",
      "Record a cash, bank or app payment against a suggested transfer.",
      "Balances update immediately. No real money moves in this demo.",
    ],
  },
  {
    eyebrow: "Stay in the loop",
    title: "Notifications and settings",
    body: "Notifications collect invites, new bills, comments and settlements. Settings holds your profile and paper style.",
    tone: "mustard",
    icon: Bell,
    bullets: [
      "Accept or decline group invites from Notifications.",
      "Mark items read as you clear the pile.",
      "Switch currency or paper surface in Settings. Refreshing resets the demo data.",
    ],
  },
];

function MiniIcon({ icon: Icon, tone, size = 16 }) {
  return (
    <span
      className={`grid h-8 w-8 shrink-0 place-items-center rounded-[9px] border-2 border-ink shadow-[2px_2px_0_var(--plop-shadow)] ${TONE_CLASSES[tone]}`}
    >
      <Icon size={size} strokeWidth={2.4} aria-hidden="true" />
    </span>
  );
}

function WelcomeVisual() {
  const rows = [
    { icon: Users, tone: "mustard", label: "Groups", hint: "Shared notebooks" },
    {
      icon: ReceiptText,
      tone: "periwinkle",
      label: "Expenses",
      hint: "Every bill written down",
    },
    {
      icon: CircleDollarSign,
      tone: "mint",
      label: "Balances",
      hint: "Who owes whom",
    },
  ];

  return (
    <div className="grid gap-2.5">
      <p className="paper-soft text-[11px] font-bold uppercase tracking-[0.18em]">
        The paper trail
      </p>
      {rows.map((row) => (
        <div
          key={row.label}
          className="flex items-center gap-2.5 rounded-[10px] border-2 border-ink bg-[var(--plop-paper)] p-2"
        >
          <MiniIcon icon={row.icon} tone={row.tone} />
          <div className="min-w-0">
            <p className="paper-ink text-[12px] font-bold">{row.label}</p>
            <p className="paper-soft text-[10px]">{row.hint}</p>
          </div>
        </div>
      ))}
      <div className="flex items-center justify-between gap-2 rounded-[10px] border-2 border-dashed border-[var(--plop-periwinkle)] bg-[rgba(255,255,255,0.35)] px-2.5 py-2">
        <span className="paper-ink text-[11px] font-bold">All squared up</span>
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[var(--plop-ink-text)]">
          <Check size={13} strokeWidth={3} aria-hidden="true" />
          Nice and tidy
        </span>
      </div>
    </div>
  );
}

function GroupsVisual() {
  return (
    <div className="grid gap-2.5">
      <div className="rounded-[12px] border-2 border-ink bg-[var(--plop-paper)] p-2.5 shadow-[2px_3px_0_var(--plop-shadow)]">
        <div className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-[9px] border-2 border-ink bg-[var(--plop-mustard)] text-base">
            🏠
          </span>
          <div className="min-w-0 flex-1">
            <p className="paper-ink truncate text-[12px] font-bold">Apartment 4B</p>
            <p className="paper-soft truncate text-[10px]">
              Rent, groceries and everything in between
            </p>
          </div>
        </div>
        <div className="mt-2.5 flex items-center justify-between gap-2">
          <AvatarStack
            names={["Maya Chen", "Jonas Weber", "Priya Nair", "Sam Rivera"]}
            max={3}
          />
          <span className="paper-soft text-[10px] font-bold">4 members</span>
        </div>
      </div>

      <div className="flex items-center gap-2 rounded-[10px] border-2 border-dashed border-[var(--plop-periwinkle)] bg-[rgba(255,255,255,0.35)] p-2">
        <MiniIcon icon={UserPlus} tone="periwinkle" size={14} />
        <p className="paper-ink min-w-0 flex-1 text-[11px] font-bold leading-tight">
          Weekend Hikers invited you
        </p>
        <span className="rounded-[6px] border-2 border-ink bg-[var(--plop-mint)] px-1.5 py-0.5 text-[9px] font-bold">
          Accept
        </span>
      </div>
    </div>
  );
}

function ExpenseVisual() {
  const people = [
    ["Maya Chen", "$31.20"],
    ["Jonas Weber", "$31.20"],
    ["Priya Nair", "$31.20"],
    ["Sam Rivera", "$31.20"],
  ];

  return (
    <div className="rounded-[12px] border-2 border-ink bg-[var(--plop-paper)] p-3 shadow-[2px_3px_0_var(--plop-shadow)]">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="paper-ink text-[13px] font-bold">Sunday brunch</p>
          <p className="paper-soft text-[10px]">Maya paid · Nov 15</p>
        </div>
        <span className="paper-ink shrink-0 text-[14px] font-bold">$124.80</span>
      </div>

      <div className="mt-2 flex flex-wrap gap-1.5">
        <Tag tone="mustard" tilt={-1}>
          Equal split
        </Tag>
        <Tag tone="periwinkle" tilt={1}>
          Food
        </Tag>
      </div>

      <div className="mt-2.5 grid gap-1.5">
        {people.map(([name, amount]) => (
          <div key={name} className="flex items-center gap-2">
            <Avatar name={name} size="sm" />
            <span className="paper-ink min-w-0 flex-1 truncate text-[11px] font-bold">
              {name}
            </span>
            <span className="paper-ink text-[11px] font-bold">{amount}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function BalancesVisual() {
  return (
    <div className="grid gap-2.5">
      <p className="paper-soft text-[11px] font-bold uppercase tracking-[0.18em]">
        Suggested transfers
      </p>

      <div className="rounded-[12px] border-2 border-ink bg-[var(--plop-paper)] p-2.5 shadow-[2px_3px_0_var(--plop-shadow)]">
        <div className="flex items-center gap-1.5">
          <Avatar name="Sam Rivera" size="sm" />
          <ArrowRight size={15} aria-hidden="true" className="paper-soft" />
          <Avatar name="Maya Chen" size="sm" />
          <span className="paper-ink ml-auto text-[13px] font-bold">$28.40</span>
        </div>
        <p className="paper-soft mt-1 text-[10px] font-bold">Sam pays Maya</p>
      </div>

      <div className="rounded-[10px] border-2 border-ink bg-[var(--plop-mint)] px-2.5 py-2 text-center text-[11px] font-bold shadow-[2px_3px_0_var(--plop-shadow)]">
        Record settlement
      </div>

      <div className="flex items-center gap-2 rounded-[10px] border-2 border-dashed border-[var(--plop-periwinkle)] bg-[rgba(255,255,255,0.35)] p-2">
        <HandCoins size={15} aria-hidden="true" className="shrink-0" />
        <p className="paper-soft text-[10px] leading-tight">
          Every payment updates the balances immediately.
        </p>
      </div>
    </div>
  );
}

function NotificationsVisual() {
  const rows = [
    {
      icon: UserPlus,
      tone: "mustard",
      title: "Invitation",
      text: "Jonas invited you to Weekend Hikers",
    },
    {
      icon: Bell,
      tone: "periwinkle",
      title: "Comment",
      text: "Sam commented on Sunday brunch",
    },
    {
      icon: HandCoins,
      tone: "mint",
      title: "Settlement",
      text: "Priya paid you $30.00",
    },
  ];

  return (
    <div className="grid gap-2.5">
      {rows.map((row) => (
        <div
          key={row.title}
          className="flex items-center gap-2 rounded-[10px] border-2 border-ink bg-[var(--plop-paper)] p-2"
        >
          <MiniIcon icon={row.icon} tone={row.tone} size={14} />
          <div className="min-w-0 flex-1">
            <p className="paper-ink text-[11px] font-bold">{row.title}</p>
            <p className="paper-soft truncate text-[10px]">{row.text}</p>
          </div>
          <span className="paper-soft text-[9px] font-bold uppercase">New</span>
        </div>
      ))}
    </div>
  );
}

function StepVisual({ step }) {
  if (step === 0) return <WelcomeVisual />;
  if (step === 1) return <GroupsVisual />;
  if (step === 2) return <ExpenseVisual />;
  if (step === 3) return <BalancesVisual />;
  return <NotificationsVisual />;
}

export default function HelpGuide({ open, onClose }) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (open) setStep(0);
  }, [open]);

  const current = STEPS[step];
  const Icon = current.icon;
  const isLast = step === STEPS.length - 1;

  const goBack = () => setStep((value) => Math.max(0, value - 1));
  const goNext = () => {
    if (isLast) {
      onClose?.();
      return;
    }
    setStep((value) => Math.min(STEPS.length - 1, value + 1));
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="How SplitInk works"
      description="A 60-second tour for new users. Open it again whenever you need a hand."
      size="lg"
    >
      <div className="grid gap-5 sm:grid-cols-[1.1fr_1fr] sm:items-start">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Tag tone={current.tone} tilt={-1}>
              {current.eyebrow}
            </Tag>
            <span className="paper-soft text-[12px] font-bold">
              Step {step + 1} of {STEPS.length}
            </span>
          </div>

          <div className="mt-3 flex items-start gap-3">
            <span
              className={`grid h-12 w-12 shrink-0 place-items-center rounded-[14px] border-[2.5px] border-ink shadow-[3px_4px_0_var(--plop-shadow)] ${TONE_CLASSES[current.tone]}`}
            >
              <Icon size={25} strokeWidth={2.4} aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <Heading level={3} scribble={false} writeOn={false}>
                {current.title}
              </Heading>
              <p className="paper-soft mt-2 text-[14px] leading-relaxed">
                {current.body}
              </p>
            </div>
          </div>

          <ul className="mt-4 grid gap-2">
            {current.bullets.map((bullet) => (
              <li
                key={bullet}
                className="flex items-start gap-2 text-[13px] leading-snug"
              >
                <span className="mt-0.5 grid h-[18px] w-[18px] shrink-0 place-items-center rounded-full border-2 border-ink bg-[var(--plop-mint)]">
                  <Check size={10} strokeWidth={3.5} aria-hidden="true" />
                </span>
                <span className="paper-ink">{bullet}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative">
          <div className="absolute -top-2 left-1/2 z-10 h-5 w-20 -translate-x-1/2 -rotate-3 rounded-[2px] bg-[var(--plop-mustard)] opacity-70" />
          <div className="rounded-[14px] border-[2.5px] border-ink bg-[var(--plop-sheet)] p-3 pt-5 shadow-[4px_5px_0_var(--plop-shadow)]">
            <StepVisual step={step} />
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t-2 border-dashed border-[var(--plop-periwinkle)] pt-4">
        <div className="flex items-center gap-1.5" aria-label="Guide progress">
          {STEPS.map((item, index) => (
            <button
              key={item.title}
              type="button"
              onClick={() => setStep(index)}
              aria-label={`Go to step ${index + 1}: ${item.title}`}
              aria-current={index === step ? "step" : undefined}
              className={[
                "h-2.5 rounded-full border-2 border-ink transition-all",
                index === step
                  ? "w-6 bg-[var(--plop-tomato)]"
                  : "w-2.5 bg-[var(--plop-paper)] hover:bg-[var(--plop-mustard)]",
              ].join(" ")}
            />
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {step > 0 ? (
            <Button
              type="button"
              variant="plain"
              iconLeft={<ArrowLeft size={17} />}
              onClick={goBack}
            >
              Back
            </Button>
          ) : null}
          <Button
            type="button"
            variant={isLast ? "mint" : "tomato"}
            iconLeft={
              isLast ? <Sparkles size={17} /> : <ArrowRight size={17} />
            }
            onClick={goNext}
          >
            {isLast ? "Start splitting" : "Next"}
          </Button>
        </div>
      </div>

      <p className="paper-soft mt-3 flex items-center gap-1.5 text-[11px]">
        <HelpCircle size={13} aria-hidden="true" />
        Open this guide anytime from Help in the sidebar or the ? button on
        mobile.
      </p>
    </Modal>
  );
}
