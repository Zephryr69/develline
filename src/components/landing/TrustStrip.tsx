import { LuArchive, LuClock3, LuGitCompareArrows, LuShare2 } from "react-icons/lu";
import styles from "./TrustStrip.module.css";

const ITEMS = [
  { icon: LuArchive, text: "Contributions par ZIP" },
  { icon: LuGitCompareArrows, text: "Chaque changement est revu" },
  { icon: LuClock3, text: "Un sprint, une vraie deadline" },
  { icon: LuShare2, text: "Une preuve à partager" },
];

export default function TrustStrip() {
  return (
    <div className={styles.strip}>
      <div className={`container ${styles.inner}`}>
        <span className={styles.title}>CONSTRUIRE, SANS COMPLIQUER</span>
        {ITEMS.map(({ icon: Icon, text }) => (
          <span key={text} className={styles.item}>
            <Icon /> {text}
          </span>
        ))}
      </div>
    </div>
  );
}
