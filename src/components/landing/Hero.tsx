"use client";

import { motion } from "framer-motion";
import { LuArrowUpRight, LuBadgeCheck, LuBox, LuClock3, LuGitMerge, LuLayers2, LuShieldCheck, LuUserCheck } from "react-icons/lu";
import Button from "@/components/ui/Button";
import Ripples from "./Ripples";
import { PATHS } from "@/lib/routes";
import styles from "./Hero.module.css";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } } };
const item = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const } },
};

export default function Hero() {
  return (
    <section className={styles.hero}>
      <div className={`container ${styles.inner}`}>
        <div className="row items-center">
          <motion.div className="col-12 col-lg-6" variants={container} initial="hidden" animate="show">
            <motion.span variants={item} className={`${styles.kicker} neu-inset`}>
              <LuUserCheck /> Pour les développeurs qui veulent finir
            </motion.span>
            <motion.h1 variants={item} className={styles.title}>
              Terminez enfin un vrai projet. <em>Et prouvez-le.</em>
            </motion.h1>
            <motion.p variants={item} className={styles.lead}>
              Une équipe, une date de fin et un lien public à mettre sur votre CV. DEVEL line vous aide à livrer en 4 à 6 semaines, sans apprendre Git et sans perdre le contrôle de votre code.
            </motion.p>
            <motion.div variants={item} className={styles.actions}>
              <Button variant="primary" size="lg" href={PATHS.newProject}>
                Lancer mon projet <LuArrowUpRight />
              </Button>
              <Button variant="outline" size="lg" href={PATHS.publicProjects}>
                Voir un exemple livré
              </Button>
            </motion.div>
            <motion.ul variants={item} className={styles.proof}>
              <li><LuShieldCheck /> Inscription en 1 minute</li>
              <li><LuLayers2 /> Aucun Git à apprendre</li>
              <li><LuClock3 /> Sprint de 4 à 6 semaines</li>
            </motion.ul>
          </motion.div>

          <motion.div
            className={`col-12 col-lg-6 ${styles.stageCol}`}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className={styles.stage}>
              <Ripples />
              <motion.article className={`${styles.card} glass`} animate={{ y: [0, -7, 0] }} transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }} aria-label="Exemple de Ship Card">
                <header className={styles.cardTop}>
                  <span className={styles.label}>EXEMPLE DE SHIP CARD</span>
                  <span className={styles.status}><LuBadgeCheck /> LIVRÉ</span>
                </header>
                <div className={styles.cardBody}>
                  <div className="clay-tile gold"><LuBox /></div>
                  <h2>Marché Local</h2>
                  <p>Une vitrine simple pour connecter les commerçants de quartier à leurs clients.</p>
                  <div className={styles.tags}>
                    <span>React</span>
                    <span>Mobile Money</span>
                    <span>Node.js</span>
                  </div>
                  <dl className={styles.stats}>
                    <div><dt>Version</dt><dd>v1.4</dd></div>
                    <div><dt>Historique</dt><dd>5 versions</dd></div>
                    <div><dt>Livré en</dt><dd>38 jours</dd></div>
                  </dl>
                  <div className={styles.people}>
                    <span className={styles.avatars}>
                      <i>AM</i><i>KD</i><i>FN</i>
                    </span>
                    <span>3 contributeurs crédités</span>
                  </div>
                </div>
              </motion.article>

              <motion.div className={`${styles.chip} ${styles.chipA} glass`} animate={{ y: [0, 8, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}>
                <span className="clay-tile" style={{ width: 36, height: 36, borderRadius: 13 }}><LuGitMerge style={{ width: 18, height: 18 }} /></span>
                <span>Contribution acceptée<small>Nouvelle version v1.4</small></span>
              </motion.div>
              <motion.div className={`${styles.chip} ${styles.chipB} glass`} animate={{ y: [0, -8, 0] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1.2 }}>
                <span className="clay-tile gold" style={{ width: 36, height: 36, borderRadius: 13 }}><LuClock3 style={{ width: 18, height: 18 }} /></span>
                <span>Fin du sprint<small>dans 12 jours</small></span>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
