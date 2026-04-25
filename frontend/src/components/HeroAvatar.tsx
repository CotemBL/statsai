import { Link } from "react-router-dom";
import { heroImg, heroName } from "../utils/heroes";

interface Props {
  heroId: number;
  size?: "sm" | "md" | "lg";
  link?: boolean;
  showName?: boolean;
}

export default function HeroAvatar({
  heroId,
  size = "md",
  link = true,
  showName = false,
}: Props) {
  const dims = size === "sm" ? "w-10 h-6" : size === "lg" ? "w-24 h-14" : "w-16 h-9";
  const img = heroImg(heroId);
  const name = heroName(heroId);
  const inner = (
    <div className="inline-flex items-center gap-2">
      <div className={`${dims} rounded overflow-hidden border border-white/10 bg-bg-card2`}>
        {img && <img src={img} alt={name} className="w-full h-full object-cover" />}
      </div>
      {showName && <span className="text-sm">{name}</span>}
    </div>
  );
  return link ? (
    <Link to={`/heroes/${heroId}`} className="hover:opacity-90">
      {inner}
    </Link>
  ) : (
    inner
  );
}
