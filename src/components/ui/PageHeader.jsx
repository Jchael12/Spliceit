import { Heading } from "@plop-ui/react";

export default function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  children,
}) {
  return (
    <header className="mb-6">
      {eyebrow ? (
        <p className="soft mb-1 text-[11px] font-bold uppercase tracking-[0.22em]">
          {eyebrow}
        </p>
      ) : null}
      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
        <div className="min-w-0">
          <Heading level={1} className="!leading-[0.95]">
            {title}
          </Heading>
          {description ? (
            <p className="soft mt-3 max-w-2xl text-[15px] leading-relaxed sm:text-base">
              {description}
            </p>
          ) : null}
        </div>
        {actions ? (
          <div className="flex flex-wrap items-center gap-2.5">{actions}</div>
        ) : null}
      </div>
      {children}
    </header>
  );
}
