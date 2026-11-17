import { ButtonLink } from "@plop-ui/react";
import { Compass } from "lucide-react";
import PageHeader from "../components/ui/PageHeader";
import RouterLink from "../components/ui/RouterLink";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl py-10 text-center">
      <div className="mb-4 flex justify-center">
        <span
          className="grid h-16 w-16 place-items-center border-[2.5px] border-ink bg-[var(--plop-mustard)] paper-ink"
          style={{
            borderRadius: "20px 14px 22px 13px",
            boxShadow: "4px 5px 0 var(--plop-shadow)",
            transform: "rotate(-4deg)",
          }}
          aria-hidden="true"
        >
          <Compass size={32} />
        </span>
      </div>
      <PageHeader
        title="This page wandered off"
        description="The link is wrong or the page has been removed. The ledger is still safe."
      />
      <ButtonLink
        as={RouterLink}
        href="/"
        variant="tomato"
        buddy
      >
        Back to dashboard
      </ButtonLink>
    </div>
  );
}
