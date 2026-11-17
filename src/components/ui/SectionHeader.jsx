import { Link } from "react-router-dom";
import { Heading } from "@plop-ui/react";

export default function SectionHeader({ title, linkTo, linkLabel = "See all", children }) {
  return (
    <div className="mb-3 flex items-end justify-between gap-3">
      <Heading level={3} scribble={false} writeOn={false}>
        {title}
      </Heading>
      {children}
      {linkTo ? (
        <Link
          to={linkTo}
          className="soft shrink-0 text-[13px] font-bold underline decoration-dotted underline-offset-4"
        >
          {linkLabel}
        </Link>
      ) : null}
    </div>
  );
}
