/** Erreur métier affichable à l'utilisateur. */
export class AppError extends Error {
  code: "validation" | "forbidden" | "not_found" | "conflict";
  issues: string[];
  constructor(message: string, code: AppError["code"] = "validation", issues: string[] = []) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.issues = issues;
  }
}

export const forbidden = (msg = "Vous n’avez pas la permission d’effectuer cette action.") => new AppError(msg, "forbidden");
export const notFound = (msg = "Ressource introuvable.") => new AppError(msg, "not_found");
