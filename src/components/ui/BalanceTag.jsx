import { Tag } from "@plop-ui/react";
import { useApp } from "../../context/AppContext";

export default function BalanceTag({ value, showWord = true, tilt }) {
  const { money } = useApp();
  const rounded = Math.round((Number(value) || 0) * 100) / 100;
  const settled = Math.abs(rounded) < 0.005;

  const tone = settled ? "ink" : rounded > 0 ? "mint" : "tomato";
  const word = settled
    ? "Settled up"
    : rounded > 0
      ? "You are owed"
      : "You owe";
  const amount = money(Math.abs(rounded));

  return (
    <Tag tone={tone} tilt={tilt ?? -1}>
      {showWord ? `${word} ${amount}` : amount}
    </Tag>
  );
}
