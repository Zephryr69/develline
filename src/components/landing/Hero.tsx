"use client";

import { motion } from "framer-motion";
import { LuArrowDown, LuArrowUpRight, LuBadgeCheck, LuShieldCheck, LuStore } from "react-icons/lu";
import Button from "@/components/ui/Button";
import { PATHS } from "@/lib/routes";
import styles from "./Hero.module.css";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
};
const item = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const } },
};

export default function Hero() {
  return (
    <section className={styles.hero}>
      <div className={`container ${styles.grid}`}>
        <motion.div className={styles.copy} variants={container} initial="hidden" animate="show">
          <motion.div variants={item} className={styles.kicker}>
            <i /> LA PLATEFORME DES DEVS QUI LIVRENT
          </motion.div>
          <motion.h1 variants={item}>
            Les bonnes idées méritent d’être <em>livrées.</em>
          </motion.h1>
          <motion.p variants={item} className={styles.desc}>
            Passez du « j’apprends » au « j’ai construit ». Collaborez sur des projets concrets, gardez le contrôle et partagez la preuve de votre travail.
          </motion.p>
          <motion.div variants={item} className={styles.actions}>
            <Button variant="primary" size="lg" href={PATHS.newProject}>
              Créer un projet <LuArrowUpRight />
            </Button>
            <a href="#comment" className={styles.textLink}>
              Découvrir comment ça marche <LuArrowDown size={16} />
            </a>
          </motion.div>
          <motion.div variants={item} className={styles.note}>
            <LuShieldCheck /> Pas besoin de Git. Juste l’envie de construire ensemble.
          </motion.div>
        </motion.div>

        <motion.div
          className={styles.previewWrap}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.div
            className={styles.card}
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className={styles.top}>
              <span className={styles.label}>EXEMPLE DE SHIP CARD</span>
              <span className={styles.verified}>
                <LuBadgeCheck /> LIVRÉ
              </span>
            </div>
            <div className={styles.body}>
              <div className={styles.titleRow}>
                <div className={styles.projectIcon}>
                  <LuStore />
                </div>
                <span className={styles.status}>LIVRÉ</span>
              </div>
              <h2>Marché Local</h2>
              <p>Une vitrine simple pour connecter les commerçants de quartier à leurs clients.</p>
              <div className={styles.tags}>
                <span>React</span>
                <span>Mobile Money</span>
                <span>Node.js</span>
              </div>
              <div className={styles.stats}>
                <div>
                  <div className={styles.statLabel}>Version actuelle</div>
                  <div className={styles.statValue}>v1.4</div>
                </div>
                <div>
                  <div className={styles.statLabel}>Versions</div>
                  <div className={styles.statValue}>5 versions</div>
                </div>
                <div>
                  <div className={styles.statLabel}>Sprint</div>
                  <div className={styles.statValue}>6 semaines</div>
                </div>
              </div>
              <div className={styles.contributors}>
                <div className={styles.avatars}>
                  <span className={styles.avatar}>AM</span>
                  <span className={styles.avatar}>KD</span>
                  <span className={styles.avatar}>FN</span>
                  <span className={styles.copyText}>3 contributeurs</span>
                </div>
                <a href={PATHS.publicProjects} className={styles.cardLink}>
                  Voir des projets livrés <LuArrowUpRight size={14} />
                </a>
              </div>
            </div>
          </motion.div>
          <div className={styles.caption}>DU CODE À LA PREUVE.</div>
        </motion.div>
      </div>
    </section>
  );
}
