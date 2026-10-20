# Classement FRMT public — plan de réalisation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** publier sur pagmatch.com le classement FRMT Hommes/Femmes et une fiche par joueur (palmarès + matchs), alimentés chaque semaine par éditions versionnées avec retour en arrière.

**Architecture:** le scraper `matchup_padel` écrit chaque passage dans une *édition* Supabase. L'édition n'est publiée qu'après des contrôles, puis le scraper alimente `frmt_rankings` (contrat inchangé) et déclenche le build Vercel. Le site Next.js (export statique) génère au build les deux classements et environ 3 000 fiches depuis l'édition publiée, mise en cache par identifiant d'édition. Aucun appel Supabase depuis le navigateur.

**Tech Stack:** TypeScript, Playwright, `@supabase/supabase-js`, `node:test` via `tsx --test`, Next.js 15 (`output: 'export'`), GitHub Actions, Vercel deploy hook.

**Spec:** `docs/superpowers/specs/2026-10-20-classement-frmt-design.md` (à lire en entier avant toute tâche).

**Deux dépôts :**
- **R1** = `jeffalkhalid/matchup_padel`.
  - Travailler dans un worktree **depuis `origin/main`**, sur la branche `feat/frmt-editions`.
  - Ne JAMAIS utiliser la copie locale existante : elle est sur une vieille branche et contient des modifications non commitées.
- **R2** = `activegame-landing`.
  - Worktree `landing-frmt`, branche `feat/classement-frmt` (contient la spec et ce plan).

## Global Constraints

- **Rien n'est appliqué à une base, poussé ou déployé sans un « oui » explicite de jeffa pour CETTE action.** Les commits locaux sur les branches ci-dessus sont autorisés.
- **Migrations** : d'abord la base de TEST, puis la PROD, avec l'accord de jeffa à chaque fois. Chaque passage sur la base de test est noté dans `docs/JOURNAL_APP_TEST.md` du dépôt `react-matchup`.
- **Toute nouvelle table** :
  1. `REVOKE ALL ON <t> FROM anon, authenticated;`
  2. puis `GRANT SELECT ON <t> TO anon, authenticated;`
  3. RLS activée avec une politique de lecture `using (true)` ;
  4. écriture réservée au rôle de service.
  Raison : TRUNCATE échappe à la RLS.
- **`public.frmt_rankings`** :
  - colonnes, sens et remplissage inchangés : l'app, l'inscription, l'administration et les déclencheurs `trg_frmt_*` en dépendent ;
  - remplie seulement à partir de l'édition **publiée**.
- **Lenteur côté FRMT** :
  - pause ≥ 1,5 s entre deux joueurs ;
  - un seul passage par semaine, la nuit ;
  - 2 POST rejoués par joueur, jamais de clic + fermeture.
- **Clé joueur** = `normaliserNom(nom)|annee|categorie|rangHomonyme`. Le slug d'un joueur ne change jamais une fois attribué.
- **Seuils de publication** :
  - effectif par catégorie à ±10 % de l'édition publiée ;
  - aucune catégorie vide ;
  - top 10 de chaque catégorie présent ;
  - moins de 2 % d'erreurs de palmarès.
- **Rétention** : `frmt_resultats` et `frmt_matchs` gardés sur les 8 dernières éditions publiées ; `frmt_classements` sans limite.
- **Années de naissance** : accepter jusqu'à `année courante − 5`. Supprimer le filtre actuel `year > 2015`.
- **Textes du site** : tutoiement. Marque « Pagmatch ».
  - Liste : « Tu es classé FRMT ? Sur Pagmatch, ton classement règle ton niveau dès l'inscription. »
  - Fiche : « C'est toi ? Ton classement FRMT règle ton niveau sur Pagmatch dès l'inscription. »
  - Aucune mention de retrait sur les fiches.
  - Mention « source FRMT » et date de l'édition sur les classements.
- **Adresses** : `/classement/hommes/`, `/classement/femmes/`, `/joueur/<slug>/`. Le slug est le nom en minuscules sans accents + année ; homonyme parfait → `-2`, `-3`.
- **Titre d'une fiche** : `<Nom> — classement FRMT padel | Pagmatch`.
- **Aucun chemin local** (`C:\Users\…`) dans un fichier versionné. Aucun secret affiché dans une sortie.

## Review Focus

1. **Décalage de ligne dans une tranche** : la FRMT renvoie le palmarès d'un autre joueur que celui demandé. Comportement attendu : joueur marqué en erreur, jamais enregistré sous la mauvaise clé. Test dans la tâche 6.
2. **Joueur exclu** : il n'apparaît ni en fiche, ni dans l'index de recherche, ni dans le sitemap. Dans la liste, il reste « Joueur masqué » à son rang. Tests dans les tâches 9 et 10.
3. **Première édition** (aucune édition publiée) : les contrôles comparatifs ne s'appliquent pas. Les contrôles absolus (pas de catégorie vide, top 10 présent, erreurs < 2 %) s'appliquent. Test dans la tâche 5.
4. **Adversaire non classé ou nom inconnu** dans un match : affiché en texte simple, sans lien ni plantage du build. Test dans la tâche 10.
5. **Joueur sans résultat ni match** (historique vide) : la fiche se génère quand même, avec « Aucun résultat sur 12 mois ». Test dans la tâche 10.

---

### Task 1 (R1) : relever les requêtes des matchs et figer les réponses réelles

**Files:**
- Create: `scripts/frmt/fixtures/` avec, pour 3 joueurs (top 10 Messieurs, ~1 500e Messieurs, une Dame) : `<cas>.champ.xml`, `<cas>.histo.xml`, `<cas>.matchs.xml`, et un `liste-tranche.xml` (réponse de la sélection d'une tranche).
- Create: `scripts/frmt/README.md` : les requêtes exactes (méthode, paramètres) de la fenêtre des matchs `A81`/`A67`, en complément de la section 6.1 de la spec.

Les fichiers XML palmarès et historique de la reconnaissance du 2026-10-20 (index 9 Messieurs, index 80 et 81 Dames) peuvent servir de départ. Leur emplacement est donné par le contrôleur.

- [ ] **Step 1** : avec Playwright (session, genre, tranche comme `scrape-frmt.ts`), ouvrir la fenêtre des matchs de 3 joueurs. Relever les POST déclenchés. Vérifier qu'ils se rejouent par `fetch` **sans ouvrir la fenêtre** pour un index donné, enchaînés sur plusieurs index.
- [ ] **Step 2** : enregistrer les réponses brutes dans `fixtures/`. Vérifier qu'elles ne contiennent aucun jeton de session :
  `grep -rE "DYN_SECURITE|/PAGE_FRMT_CLASSEMENTS_PADEL/[A-Za-z0-9]{8,}" scripts/frmt/fixtures` doit être vide.
- [ ] **Step 3** : rédiger `README.md`. Il couvre les requêtes, les alias des champs des matchs (partenaire, club, adversaires, score, tour, tournoi, Gagné/Perdu, `A77`/`A78`/`A79`) et le temps mesuré par joueur.
- [ ] **Step 4** : commit `feat(frmt): requetes des matchs relevees et reponses reelles figees`.

### Task 2 (R1) : analyseurs du XML WEBDEV

**Files:**
- Create: `scripts/frmt/parse.ts`
- Test: `scripts/frmt/parse.test.ts`

**Interfaces — Produces :**
```ts
export type Categorie = 'Masculin' | 'Féminin';
export interface LigneListe { rang: number; nom: string; annee: number; club: string; points: number; index: number }
export interface Palmares {
  nom: string; club: string; annee: number;
  meilleur: { rang: number; points: number; date: string /* ISO */ } | null;
  bonus: { total: number; depart: number; afrique: number; fip: number; arabe: number };
  assimilation: { oui: boolean; points: number; classement: number | null };
  totaux: { total12Mois: number; douzeMeilleurs: number; bonusPlusDouze: number; pointsClassement: number; classement: number };
}
export interface Resultat { date: string; tournoi: string; points: number; categorie: string | null; compte: boolean; ordre: number }
export interface Match { date: string | null; tournoi: string; tour: string | null; partenaire: { nom: string; club: string | null } | null;
  adversaires: { nom: string; club: string | null }[]; score: string; resultat: 'V' | 'D' }
export function parseNomListe(cellule: string): { nom: string; annee: number; club: string } | null; // "NOM PRÉNOM [2002] (IND)"
export function parsePalmares(xml: string): Palmares;
export function parseHistorique(xml: string): Resultat[];
export function parseMatchs(xml: string): { matchs: Match[]; joues: number; gagnes: number; perdus: number };
export function nombreFR(s: string): number; // "24 680,0" (espace insécable possible) -> 24680
```

- [ ] **Step 1 : tests sur les fixtures.**
  - `parsePalmares(top10.champ.xml)` donne le nom, l'année, le club et `totaux.classement` attendus (valeurs lues dans la fixture).
  - `parseHistorique(top10.histo.xml)` : les lignes `COULEURFOND="#99FF99"` ont `compte === true`, les autres `false`.
  - La ligne « BOUNUS FIP » a `categorie === null`.
  - `nombreFR("24\u00a0680,0") === 24680`.
  - `parseNomListe("ALAMI MOHAMED [2002] (IND)")` donne `{nom:'ALAMI MOHAMED', annee:2002, club:'IND'}`.
  - `parseNomListe` accepte `[2019]` et refuse `[1890]`.
  - `parseMatchs(...)` : `joues === gagnes + perdus === matchs.length`, ou l'écart s'explique dans la fixture (à constater et à figer).
  - Historique d'une seule ligne (cas ~1 500e).
- [ ] **Step 2** : `npx tsx --test scripts/frmt/parse.test.ts` → échec (module absent).
- [ ] **Step 3** : implémenter. Lire `<CHAMP ALIAS="Axx">` et `PROP NUM="1"|"21"`. Découper `A111` « MEILLEUR CLASSEMENT : r (p points au <date en français>) » en ISO. L'année limite est `new Date().getFullYear() - 5`.
- [ ] **Step 4** : les tests passent.
- [ ] **Step 5** : commit `feat(frmt): analyseurs palmares, historique, matchs`.

### Task 3 (R1) : identité des joueurs

**Files:**
- Create: `scripts/frmt/identite.ts`
- Test: `scripts/frmt/identite.test.ts`

**Interfaces — Produces :**
```ts
export function normaliserNom(nom: string): string;          // majuscules, sans accents, espaces simples
export function slugBase(nom: string, annee: number): string; // "alami-mohamed-2002"
export interface Connu { id: string; cle: string; slug: string; club: string | null; dernierRang: number | null }
export interface Attribution { ligne: LigneListe; cle: string; slug: string; joueurId: string | null /* null = nouveau */; ambigu: boolean }
export function attribuer(lignes: LigneListe[], categorie: Categorie, connus: Connu[], slugsPris: Set<string>): Attribution[];
```

- [ ] **Step 1 : tests.**
  - Deux lignes « EL AMRANI REDA [1988] », même catégorie, sans connu → clés `…|1` et `…|2` par ordre de rang, slugs `el-amrani-reda-1988` et `el-amrani-reda-1988-2`.
  - Semaine suivante, mêmes homonymes avec des clubs connus → rattachés par club, même si l'ordre des rangs s'est inversé.
  - Clubs identiques et rangs équidistants → `ambigu === true` pour les deux.
  - Slug déjà pris par un autre joueur → suffixe suivant.
  - Un connu garde son slug même si l'orthographe affichée change d'accent.
- [ ] **Step 2** : échec. **Step 3** : implémenter. **Step 4** : les tests passent.
- [ ] **Step 5** : commit `feat(frmt): cles et slugs des joueurs, homonymes`.

### Task 4 (R1) : schéma SQL des éditions

**Files:**
- Create: `scripts/sql/frmt_editions.sql` (idempotent)
- Create: `scripts/sql/frmt_editions_verif.sql` (lecture seule ; chaque contrôle renvoie 0 ligne si tout va bien)

Contenu, selon la section 6.2 de la spec :
- **Tables** : `frmt_editions`, `frmt_joueurs`, `frmt_classements`, `frmt_resultats`, `frmt_matchs`, `frmt_exclusions (joueur_id, cree_le, motif)`.
- **`frmt_editions.status`** : `check in ('en_cours','complete','rejetee','publiee','retiree')`, plus un index unique partiel `where status='publiee'`.
- **`frmt_classements`** : clé primaire (`edition_id`, `joueur_id`), avec les colonnes de `Palmares` à plat, plus `rang`, `points`, `club`, `erreur text null` et `ambigu boolean not null default false` (homonyme non départagé, tâche 3).
- **Fonction `frmt_publier(p_edition uuid)`** : `security definer`, exécutable par `service_role` seulement. Elle passe l'ancienne édition `publiee` à `retiree` et la nouvelle à `publiee` dans une même transaction, et lève une erreur si la cible n'est ni `complete` ni `retiree`.
- **Fonction `frmt_purger(p_garder int default 8)`** : supprime les résultats et matchs des éditions au-delà des 8 dernières publiées ou retirées.
- **Droits** : comme dans les Global Constraints.

- [ ] **Step 1** : écrire les deux fichiers. `frmt_editions_verif.sql` contrôle :
  - que chaque table a la RLS activée ;
  - qu'aucun TRUNCATE, INSERT, UPDATE ou DELETE n'est accordé à anon ou authenticated ;
  - que l'index unique partiel existe.
- [ ] **Step 2** : **demander l'accord de jeffa**, puis appliquer sur la base de **TEST**. Lancer la vérification : 0 ligne attendue. Noter le passage dans `react-matchup/docs/JOURNAL_APP_TEST.md`.
- [ ] **Step 3** : commit `feat(frmt): schema des editions, publication et purge`.

### Task 5 (R1) : contrôles de publication

**Files:**
- Create: `scripts/frmt/controles.ts`
- Test: `scripts/frmt/controles.test.ts`

**Interfaces — Produces :**
```ts
export interface Compteurs { parCategorie: Record<Categorie, number>; top10Present: Record<Categorie, boolean>; erreursPalmares: number; palmaresLus: number }
export function verifierEdition(nouvelle: Compteurs, publiee: Compteurs | null): { ok: boolean; raisons: string[] };
```

- [ ] **Step 1 : tests.**
  - 2 530 contre 2 300 hommes publiés → ok (+10,0 %) ; 2 531 → refus.
  - Femmes à 0 → refus « catégorie Féminin vide ».
  - top 10 Femmes absent → refus.
  - 61 erreurs sur 3 031 lus → refus (≥ 2 %) ; 60 → ok.
  - `publiee === null` → seuls les contrôles absolus s'appliquent.
- [ ] **Step 2–4** : échec, implémenter, les tests passent.
- [ ] **Step 5** : commit `feat(frmt): controles de publication`.

### Task 6 (R1) : collecte d'une édition (complète ou incrémentale)

**Files:**
- Create: `scripts/frmt/collecte.ts`
- Test: `scripts/frmt/collecte.test.ts`
- Modify: `scripts/scrape-frmt.ts` : exporter les fonctions de session et de tranche réutilisées (`gotoWithRetry`, `getRangeOptions`, `isErrorPage`, la lecture d'une tranche). Supprimer le filtre `year > 2015`.

**Interfaces :**
- Consumes : tâche 2 (`parse*`), tâche 3 (`attribuer`).
- Produces :
```ts
export type Mode = 'complet' | 'incremental';
export interface Requeteur { palmares(index: number): Promise<{ champ: string; histo: string }>; matchs(index: number): Promise<string> }
export function aRelire(ligne: LigneListe, precedent: { points: number } | undefined, mode: Mode): boolean;
export async function lireJoueur(ligne: LigneListe, req: Requeteur): Promise<{ palmares: Palmares; resultats: Resultat[]; matchs: ReturnType<typeof parseMatchs> } | { erreur: string }>;
export async function collecter(opts: { mode: Mode; pauseMs: number; limiteTranches?: number }): Promise<CollecteBrute>; // CollecteBrute: lignes par catégorie + résultats de lireJoueur
export function modeDuJour(d: Date): Mode; // 'complet' le premier lundi du mois, sinon 'incremental'
```

- [ ] **Step 1 : tests, avec un `Requeteur` factice.**
  - `aRelire` : points identiques en `incremental` → false ; points différents → true ; joueur absent la semaine précédente → true ; `complet` → toujours true.
  - `lireJoueur` : si le palmarès renvoyé porte un autre nom ou une autre année que la ligne → `{ erreur: 'decalage' }`, et rien n'est retourné d'autre.
  - `modeDuJour` : le lundi 2 novembre 2026 → `complet` ; le lundi 9 novembre 2026 → `incremental`.
- [ ] **Step 2–4** : échec, implémenter, les tests passent.
  - `collecter` rejoue les POST par `page.evaluate(fetch…)` sur l'adresse de session.
  - Pause `pauseMs` entre joueurs.
  - Remettre `#A18` à 1 en changeant de genre.
  - Dédoublonner les chevauchements de tranches par (nom, année, rang).
- [ ] **Step 5 : essai réel court.** Lancer `npx tsx scripts/frmt/collecte.ts --dry-run --limite-tranches 1 --mode complet` : une tranche par genre, sans écriture. Afficher les compteurs et le temps par joueur.
- [ ] **Step 6** : commit `feat(frmt): collecte d'edition complete ou incrementale`.

### Task 7 (R1) : écriture, publication, alimentation de l'app, retour en arrière

**Files:**
- Create: `scripts/frmt/edition.ts` : `ecrireEdition(collecte, precedente)`, `publierEdition(id, { app: boolean })`, `appelerDeployHook()`.
- Create: `scripts/frmt-edition.ts` : le passage complet de bout en bout (étapes 1 à 9 de la section 7 de la spec), drapeau `--dry-run`.
- Create: `scripts/frmt-publier.ts` : `<edition_id> | --precedente`, `[--app]`.
- Modify: `scripts/scrape-frmt.ts` : exposer `replaceCategory`, `loadExistingLinks` et `refreshLinkedPlayers`, pour alimenter `frmt_rankings` depuis l'édition publiée sans dupliquer leur logique.

**Interfaces :**
- Consumes : tâches 4, 5 et 6.
- Produces : l'édition `publiee`, lue par R2 :
  - `frmt_editions.id` et `finished_at` ;
  - les tables `frmt_*` ;
  - `frmt_joueurs.slug` ;
  - `frmt_exclusions`.

- [ ] **Step 1** : en mode `incremental`, `ecrireEdition` **recopie** palmarès, résultats et matchs de l'édition précédente pour les joueurs non relus. Test unitaire sur la fonction de fusion `fusionner(relus, precedente)`.
- [ ] **Step 2** : `publierEdition` appelle `frmt_publier`. Avec `app: true` seulement, il remplit `frmt_rankings` et fait le rafraîchissement des joueurs liés (code existant).
  - `frmt-edition.ts` passe `app: true` après des contrôles OK.
  - `frmt-publier.ts` passe `app: false`, sauf avec `--app`.
- [ ] **Step 3** : sur la base de **TEST**, avec l'accord de jeffa : `npx tsx scripts/frmt-edition.ts --mode complet --limite-tranches 2`. Vérifier :
  - une édition `publiee` existe ;
  - `frmt_rankings` est rempli ;
  - `frmt-publier.ts --precedente` sur une 2e édition revient bien à la 1re, sans toucher `frmt_rankings`.
- [ ] **Step 4** : commit `feat(frmt): ecriture, publication et retour en arriere des editions`.

### Task 8 (R1) : workflow

**Files:**
- Modify: `.github/workflows/scrape-frmt.yml`

Changements :
- `timeout-minutes: 350`.
- Étape principale : `npx tsx scripts/frmt-edition.ts`, en mode `modeDuJour`, sauf entrée `workflow_dispatch` `mode`.
- Entrées `workflow_dispatch` :
  - `mode` : `auto` | `complet` | `incremental` ;
  - `publier_edition` : identifiant, ou `precedente` ; quand elle est fournie, on lance seulement `frmt-publier.ts`.
- `auto-match-frmt.ts` est conservé après publication.
- Nouveau secret `VERCEL_DEPLOY_HOOK_URL`, à créer par jeffa.
- Le job échoue (non zéro) si l'édition est `rejetee`, ce qui déclenche l'e-mail GitHub.

- [ ] **Step 1** : modifier le fichier. Valider la syntaxe avec `npx --yes @action-validator/cli .github/workflows/scrape-frmt.yml`, ou à défaut une relecture.
- [ ] **Step 2** : commit `ci(frmt): passage hebdomadaire par editions, publication manuelle`.

### Task 9 (R2) : lecture de l'édition publiée au build

**Files:**
- Create: `lib/frmt/types.ts` : types de lecture miroirs des tables (`JoueurClasse`, `FicheJoueur`, `Edition`).
- Create: `lib/frmt/data.ts`
- Test: `lib/frmt/data.test.ts`
- Modify: `package.json` : devDependency `tsx`, script `"test": "tsx --test lib/**/*.test.ts"`.

**Interfaces — Produces :**
```ts
export async function chargerEdition(opts?: { fetchImpl?: typeof fetch; cacheDir?: string }): Promise<EditionComplete>;
// EditionComplete = { edition: Edition; classements: Record<'hommes'|'femmes', JoueurClasse[]>; fiches: Map<string /*slug*/, FicheJoueur> }
export function evolution(courant: { rang: number; points: number }, precedent?: { rang: number; points: number }): { rang: number | null; points: number | null };
```

Règles :
- Lit `NEXT_PUBLIC_SUPABASE_URL` et `NEXT_PUBLIC_SUPABASE_ANON_KEY` (REST PostgREST, clé anon).
- Pagination par 1 000 avec l'en-tête `Range`.
- Cache : `.next/cache/frmt/<edition_id>.json`.
- Joueurs de `frmt_exclusions` : absents de `fiches` ; dans `classements`, `masque: true` avec le nom remplacé par « Joueur masqué ».
- Joueurs `ambigu = true` : présents dans le classement sous leur nom, mais **sans fiche** ni lien (spec 6.2 bis).
- Évolution calculée sur l'édition publiée précédente.

- [ ] **Step 1 : tests, avec un `fetchImpl` factice.**
  - 2 300 lignes → 3 appels avec `Range: 0-999`, `1000-1999`, `2000-2999`.
  - Deuxième appel avec un cache présent → un seul appel réseau (l'identifiant d'édition).
  - Joueur exclu → absent de `fiches`, `masque` dans le classement.
  - `evolution({rang:2,points:19000},{rang:3,points:18200})` → `{rang:1, points:800}` ; sans précédent → `null`.
- [ ] **Step 2–4** : échec, implémenter, `npm test` passe.
- [ ] **Step 5** : commit `feat(classement): lecture de l'edition publiee avec cache`.

### Task 10 (R2) : pages Classement et Fiche

**Files:**
- Create: `app/classement/[genre]/page.tsx` : `generateStaticParams` → `hommes`, `femmes`.
- Create: `app/classement/RechercheJoueurs.tsx` (client) : filtre sur l'index `{ n: nom, c: club, s: slug, r: rang }`.
- Create: `app/joueur/[slug]/page.tsx` : `generateStaticParams` depuis `fiches` ; `generateMetadata` avec le titre, une description (rang, points, club) et `alternates.canonical: './'`.
- Create: `app/joueur/[slug]/Courbe.tsx` : courbe SVG des points par édition.
- Create: `lib/frmt/fiche.ts` : fonctions pures de présentation (`lienAdversaire(nom, club, index) -> slug | null`, formats de date et de nombre).
- Test: `lib/frmt/fiche.test.ts`
- Modify: `app/globals.css` : styles `.frmt-*`, d'après les maquettes validées. Liste B : cartes, top 3 en jaune. Fiche B : en-tête, bloc calcul, historique, matchs, courbe, appel.
- Modify: `app/page.tsx` : entrée « Classement FRMT » dans la navigation et le pied de page.

Contenu :
- **Ordre de la fiche** (spec 8.1) :
  1. rang, nom, club, né en ;
  2. bloc calcul ;
  3. historique (lignes comptées en vert) ;
  4. matchs, avec le bilan V–D en titre ;
  5. courbe ;
  6. appel « C'est toi ? » avec `StoreBadges`, à extraire de `app/page.tsx` dans `app/StoreBadges.tsx` pour le réutiliser.
- **JSON-LD `Person`** : `name`, `birthDate` (année), `memberOf` (club si différent de IND).

- [ ] **Step 1 : tests de `fiche.ts`.**
  - `lienAdversaire` d'un nom classé connu → son slug ; d'un nom inconnu → `null`.
  - Une fiche sans résultat ni match produit les libellés « Aucun résultat sur 12 mois » et « Aucun match sur 12 mois ».
- [ ] **Step 2–4** : échec, implémenter, `npm test` passe.
- [ ] **Step 5** : `npm run build` contre la base de TEST, avec les variables d'environnement de test en local. Il faut :
  - le succès du build ;
  - `out/classement/hommes/index.html` et `out/joueur/<un slug>/index.html` présents ;
  - le titre attendu dans la fiche ;
  - aucun « Joueur masqué » dans `out/joueur/`.
- [ ] **Step 6** : captures dans Chrome sans interface à 500 px et à 1 280 px (liste et une fiche du top 10), et les regarder. Comparer aux maquettes validées.
- [ ] **Step 7** : commit `feat(classement): pages classement et fiches joueurs`.

### Task 11 (R2) : sitemap généré

**Files:**
- Create: `app/sitemap.ts` : accueil, `/cgu/`, `/confidentialite/`, les deux classements et chaque fiche non exclue. Adresses en `https://www.pagmatch.com/…/`, avec la barre finale.
- Delete: `public/sitemap.xml`.

- [ ] **Step 1** : `npm run build`. `out/sitemap.xml` contient `/classement/femmes/` et le slug d'une fiche du top 10, et aucun slug exclu.
- [ ] **Step 2** : commit `feat(classement): sitemap avec les fiches`.

### Task 12 : mise en service (chaque étape attend le « oui » de jeffa)

- [ ] Appliquer `frmt_editions.sql` en **PROD**, puis lancer la vérification : 0 ligne.
- [ ] Ajouter dans Vercel les variables `NEXT_PUBLIC_SUPABASE_URL` et `NEXT_PUBLIC_SUPABASE_ANON_KEY` (prod, clé anon publique), puis créer le deploy hook. Le copier dans le secret GitHub `VERCEL_DEPLOY_HOOK_URL` de `matchup_padel` (jeffa le colle lui-même).
- [ ] Fusionner R1 dans `main` et pousser.
- [ ] Lancer le workflow à la main en mode `complet`. Suivre la durée réelle, vérifier l'édition `publiee` et le contenu de `frmt_rankings`.
- [ ] Fusionner R2 dans `main` et pousser. Vercel construit.
- [ ] Vérifier en ligne :
  - les deux classements ;
  - trois fiches (top 1 Messieurs, un ~1 500e, une Dame) ;
  - le sitemap ;
  - une recherche.
- [ ] Mettre à jour les fiches mémoire (`project_landing_refonte`, `project_frmt_scraper`).
