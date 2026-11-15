import { LuArrowUpRight, LuCheck, LuCompass, LuCrown, LuHandHelping } from "react-icons/lu";
import Button from "@/components/ui/Button";
import Reveal from "@/components/Reveal";
import { PATHS } from "@/lib/routes";
import styles from "./Audiences.module.css";

export default function Audiences() {
  return (
    <section className="section" id="pour-qui">
      <div className="container">
        <Reveal className="section-head center">
          <span className="eyebrow">Pour qui ?</span>
          <h2 className="section-title">Que vous portiez le projet ou que vous veniez aider, vous y gagnez</h2>
        </Reveal>

        <div className="row items-stretch">
          <div className="col-12 col-lg-6">
            <Reveal className={`glass ${styles.card}`}>
              <span className="clay-tile gold">
                <LuCrown />
              </span>
              <h3>Vous portez un projet</h3>
              <p className={styles.lead}>Ouvrez-le à d’autres sans jamais perdre la main.</p>
              <ul>
                <li><LuCheck /> Rien n’est intégré sans votre validation</li>
                <li><LuCheck /> Vous voyez exactement ce qui change, fichier par fichier</li>
                <li><LuCheck /> Vous revenez à n’importe quelle version en un clic</li>
                <li><LuCheck /> Vous suivez l’avancement de votre sprint</li>
              </ul>
              <Button variant="primary" href={PATHS.newProject}>
                Créer mon projet <LuArrowUpRight />
              </Button>
            </Reveal>
          </div>
          <div className="col-12 col-lg-6">
            <Reveal delay={0.1} className={`glass ${styles.card}`}>
              <span className="clay-tile">
                <LuHandHelping />
              </span>
              <h3>Vous voulez contribuer</h3>
              <p className={styles.lead}>Gagnez de l’expérience sur de vrais projets, sans connaître Git.</p>
              <ul>
                <li><LuCheck /> Vous téléchargez la copie de travail et modifiez en local</li>
                <li><LuCheck /> Vous déposez un ZIP, c’est tout</li>
                <li><LuCheck /> Chaque contribution acceptée est créditée à votre nom</li>
                <li><LuCheck /> Vous repartez avec des projets à montrer aux recruteurs</li>
              </ul>
              <Button variant="outline" href={PATHS.publicProjects}>
                <LuCompass /> Découvrir les projets publics
              </Button>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
