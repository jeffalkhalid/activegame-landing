# Classement FRMT public sur pagmatch.com — conception

Date : 2026-10-20 · Statut : validé par jeffa le 2026-10-20

## 1. Intention

Faire venir des joueurs sur Pagmatch par Google. Chaque joueur classé à la
Fédération royale marocaine de tennis (padel, FRMT) a sa propre page sur
pagmatch.com. Quand il tape son nom dans Google, il tombe sur sa fiche Pagmatch,
qui l'invite à télécharger l'app.

Modèle de départ : padelrounds.com/frmt/classement/hommes (liste) et la fenêtre
« Palmarès » du site FRMT (fiche joueur).

Pourquoi ça peut marcher : la FRMT publie ces données dans une application
WEBDEV que Google n'indexe pas. Une page par joueur, rapide et bien titrée, n'a
donc presque pas de concurrence sur le nom du joueur.

## 2. Objectifs

1. Deux pages de classement, Hommes et Femmes, avec **tous** les classés (environ
   2 530 hommes et 501 femmes en octobre 2026, mineurs compris : décision de
   jeffa).
2. Une fiche par joueur. Elle reprend tout le palmarès FRMT et le détail de ses
   matchs (dès cette version : décision de jeffa).
3. Mise à jour automatique chaque semaine.
4. **Retour en arrière possible** (exigence de jeffa) : un passage raté ne casse
   jamais le site, et on peut revenir à la semaine précédente.
5. Chaque fiche mène à l'app (« C'est toi ? »).

## 3. Hors objectifs (cette version)

- Les filtres par âge, club, note, etc. à la manière de PadelRounds. La recherche
  couvre le nom et le club.
- Les comptes, la connexion et la revendication d'une fiche par le joueur.
- Le lien entre une fiche publique et le profil Pagmatch d'un joueur (pas
  d'affichage de son niveau Pagmatch).
- Tout calcul de note maison (PadelRounds a son « P-Rating ») : on n'affiche que
  des chiffres FRMT ou dérivés directement (évolution, victoires/défaites).

## 4. Ce qui serait un échec, même si « ça marche »

- **Le site sert un classement faux ou vide** après un passage raté. C'est déjà
  arrivé une fois : un ancien passage avait effacé toutes les joueuses.
- **La fiche montre un autre joueur** que celui demandé. Le risque vient des
  homonymes, ou d'une ligne décalée dans la tranche FRMT (voir 6.3).
- **L'app casse** : les écrans d'inscription, d'administration et de profil, le
  rattachement automatique FRMT et le bonus de fiabilité lisent `frmt_rankings`.
- **Le serveur de la FRMT est surchargé** ou les accès sont bloqués : il faut
  rester lent, et faire un seul passage par semaine, la nuit.
- **Les visiteurs du site consomment le trafic Supabase**, alors que le trafic
  sortant (egress) est le plafond du projet : le site ne doit jamais interroger
  Supabase depuis le navigateur.
- **Des pages ressemblent à du contenu dupliqué ou vide** pour Google, par
  exemple 3 000 fiches presque identiques ou sans titre propre.

## 5. Ce qui existe déjà

- **Scraper** : `scripts/scrape-frmt.ts` dans le dépôt `jeffalkhalid/matchup_padel`
  (Playwright).
  - Il tourne via `.github/workflows/scrape-frmt.yml` : le lundi à 6 h UTC, avec
    une limite de **15 min**, puis `scripts/auto-match-frmt.ts`.
  - Il écrit `public.frmt_rankings` par **remplacement de catégorie** (effacement
    puis insertion), en préservant les `player_id` liés.
  - Ses pièges WEBDEV sont documentés dans le fichier : démarrage à froid, tranches
    de 100 à 104 lignes, ex æquo, pas de bouton de validation.
  - ⚠️ La copie locale de ce dépôt est sur une ancienne branche, avec des
    modifications non commitées. Il faut partir de `origin/main`, dans un worktree.
- **`public.frmt_rankings`** (3 031 lignes, une seule date de passage) :
  - colonnes `id, player_id, frmt_name, frmt_player_id (toujours vide), category
    ('Masculin'|'Féminin'), ranking_position, ranking_points, scraped_at,
    created_at, birth_year` ;
  - lecture publique (RLS `frmt_select` = true pour anon) ;
  - écriture réservée aux admins.
- **Lecteurs dans l'app** (`react-matchup`) : `app/(auth)/signup.tsx`,
  `app/(tabs)/admin.tsx`, `app/player/[id].tsx`, `lib/frmt-match.ts`, et sur
  `players` les déclencheurs `trg_frmt_autolink`, `trg_frmt_fiability_floor` et
  `trg_frmt_track_fiability_bonus`. **Leur contrat ne change pas.**
- **Site** (`activegame-landing`) : Next.js en export statique (`output: 'export'`,
  `trailingSlash: true`), hébergé sur Vercel, déployé à chaque push sur `main`.
  - Il a déjà un sitemap statique, `robots.txt`, des adresses canoniques par page
    et des données structurées.
  - Couleurs et polices dans `app/globals.css` (fond `--ink`, jaune `--brand`,
    Anton / Barlow Condensed / Inter / Manrope).

## 6. Données

### 6.1 Ce que donne la FRMT (reconnaissance du 2026-10-20, 10 joueurs ouverts)

Liste par tranche :
- rang officiel (ex æquo gérés) ;
- `NOM PRÉNOM [ANNÉE] (CLUB)`, où le club est présent sur 100 % des lignes
  vérifiées, souvent « IND » ;
- points.

Palmarès d'un joueur. Fenêtre WEBDEV `#A24`, ouverte par un clic sur la cellule
nom. Deux POST AJAX sur l'adresse de session de la page :
1. `WD_ACTION_=AJAXCHAMP&CLICTABLE=A7&A7=<index>&WD_TABLE_DEBUT_=0&WD_TABLE_NOMBRE_=1&WD_TABLE_COL_LIEN_=`
   donne l'en-tête, les bonus et les totaux. Champs utiles :

   | Rubrique | Champs |
   |---|---|
   | En-tête | `A60` nom (club) · `A66` « Né(e) en » · `A111` « MEILLEUR CLASSEMENT : r (p points au date) » |
   | Bonus | `A49` total · `A35` Départ · `A36` Champ. d'Afrique · `A37` FIP · `A38` Champ. Arabe |
   | Assimilation | `A52` oui/non · `A40` points · `A41` classement d'assimilation |
   | Totaux | `A53` libellé · `A44` total 12 mois · `A46` 12 meilleurs · `A47` bonus + 12 meilleurs · `A45` points de classement · `A54` classement |
   | Note de bas | `A57` |

2. `WD_ACTION_=AJAXEXECUTE&LIGNESTABLE=A55&0=0` donne l'historique sur 12 mois.
   - Une ligne par résultat : `A33` date, `A42` tournoi, `A43` points, `A108`
     catégorie (vide pour un bonus).
   - Ligne **comptée** = `COULEURFOND="#99FF99"`.
   - Le bonus FIP peut arriver comme une **ligne** d'historique (« BOUNUS FIP »)
     alors que `A37` vaut 0. On affiche ce que la FRMT affiche, sans recalculer.

Le bouton « Palmarès » `A81` ouvre la fenêtre `A67` : le détail de tous les
matchs (partenaire et club, adversaires, Gagné/Perdu, score, tour, tournoi),
plus Matchs joués/gagnés/perdus (`A77`/`A78`/`A79`). Environ 68 Ko pour un joueur
du top 10. **La structure exacte de ces requêtes reste à relever** : c'est la
première tâche du plan.

**Pas d'identifiant joueur exposé** : les colonnes d'identifiant arrivent vides.
Clé d'un joueur = **nom normalisé + année de naissance** (+ catégorie).
L'index de ligne n'a de sens que dans la session et la tranche courantes.

### 6.2 Modèle (nouvelles tables, schéma `public`)

Mon choix, ajustable au plan :

- `frmt_editions` — un passage hebdomadaire.
  - Colonnes : `id`, `started_at`, `finished_at`, `status` (`en_cours` |
    `complete` | `rejetee` | `publiee` | `retiree`), `counts` (jsonb : joueurs par
    catégorie, palmarès lus, matchs lus, erreurs), `notes`.
  - **Une seule édition `publiee` à la fois** (index unique partiel).
- `frmt_joueurs` — identité stable d'un joueur d'une semaine à l'autre.
  - Colonnes : `id`, `cle` (unique : nom normalisé + année + catégorie),
    `nom_affiche`, `annee`, `categorie`, `slug` (unique, pour l'adresse de la
    fiche).
- `frmt_classements` — une ligne par (édition, joueur) : rang, points, club,
  totaux, bonus, assimilation, meilleur classement (rang, points, date). C'est
  léger : **on garde toutes les éditions**, ce qui donne l'évolution.
- `frmt_resultats` — l'historique des scores sur 12 mois, par (édition, joueur) :
  date, tournoi, points, catégorie, compté (booléen), ordre.
- `frmt_matchs` — par (édition, joueur) : date, tournoi, tour, partenaire (nom +
  club, et `frmt_joueurs.id` si on le reconnaît), adversaires (idem), score,
  résultat V/D.
- **Rétention** : `frmt_resultats` et `frmt_matchs` sont gardés sur les **8
  dernières éditions publiées** ; les classements, eux, sont gardés sans limite.
  Mon choix, pour la taille de la base (Supabase gratuit, 500 Mo).

**Droits** : sur chaque nouvelle table, `REVOKE ALL FROM anon, authenticated`
d'abord, puis `GRANT SELECT`, avec une RLS de lecture publique et une écriture
réservée au rôle de service. Raison : les privilèges par défaut de Supabase
donnent TRUNCATE à anon, et TRUNCATE échappe à la RLS.

### 6.2 bis Homonymes et retraits

- **Homonymes parfaits** (même nom normalisé, même année, même catégorie dans la
  même édition) : la clé seule ne suffit pas. Mon choix :
  - `cle` devient nom + année + catégorie + **un rang d'homonyme** (1, 2…) attribué
    par ordre de classement à la première apparition ;
  - les semaines suivantes, on rattache chaque homonyme par club identique,
    puis par rang le plus proche ;
  - si le rattachement reste ambigu, les fiches de ces homonymes **ne sont pas
    publiées** cette semaine-là. Mieux vaut pas de fiche qu'une fiche fausse.
  - Le slug reçoit `-2`, `-3`.
- **Retrait d'une fiche** (V1, mon choix, car on publie aussi des mineurs) :
  - table `frmt_exclusions` (clé joueur, date, motif), lue par le build ;
  - un joueur exclu n'a ni fiche, ni ligne dans la recherche, ni entrée dans le
    sitemap ;
  - il reste dans le classement sous la forme « Joueur masqué » avec son rang,
    pour ne pas décaler la liste ;
  - **aucune mention de retrait sur les fiches** (décision de jeffa) : les gens
    passent par le contact habituel (support@pagmatch.com) ;
  - le retrait se fait à la main (une ligne insérée par un admin).

### 6.3 Contrôles d'intégrité au moment de la lecture

- **Années de naissance** : le scraper actuel rejette `year > 2015`. Lever cette
  limite (mineurs compris), avec un plafond raisonnable (année en cours − 5).

- La réponse du palmarès (`A60` + `A66`) doit correspondre au nom et à l'année de
  la ligne demandée, sinon le joueur est marqué en erreur pour cette édition.
- Les tranches se chevauchent : dédoublonner par (nom, année, rang).
- Changement de genre : remettre la tranche (`A18`) à 1, sinon la liste Femmes
  revient vide.

## 7. Le passage hebdomadaire

Il se fait dans le scraper existant, étendu : nouvelle étape, même dépôt, même
workflow.

1. Créer une édition `en_cours`.
2. Pour chaque catégorie, puis chaque tranche : charger la tranche avec Playwright
   (comme aujourd'hui), puis **rejouer les POST** du palmarès et des matchs pour
   chaque index de ligne, **sans clic ni fermeture**. Fermer la fenêtre recharge
   toute la tranche (environ 100 Ko) : c'est à éviter.
3. **Lenteur volontaire** : environ 1,5 s de pause par joueur. Relance de session
   si le serveur WEBDEV fait un démarrage à froid.
   - **Passage incrémental** (mon choix) : la liste complète est lue chaque
     semaine, ce qui est léger et donne rangs, points et évolution. Le palmarès
     et les matchs ne sont relus **que pour les joueurs dont les points ont
     changé**, ou qui sont nouveaux. Pour les autres, on recopie leurs
     données de l'édition précédente. Points inchangés ⇒ aucun résultat ni
     bonus nouveau ; l'expiration à 12 mois change aussi les points.
   - **Passage complet** le premier lundi du mois (3 à 5 h), plus le tout
     premier passage.
   - Raison : `matchup_padel` est un **dépôt privé** (vérifié le 2026-10-20).
     Les minutes GitHub Actions y sont comptées (2 000 min/mois sur le forfait
     gratuit, pour tout le compte). Un passage complet chaque semaine (800 à
     1 500 min/mois) risquerait de couper tous les workflows du compte.
     Visée : moins de 600 min/mois pour ce job. Mesurer la durée réelle au
     premier passage et ajuster.
   - `timeout-minutes: 350` sur le job, lancé la nuit.
4. Écrire toutes les données de l'édition, puis la passer à `complete`.
5. **Contrôles de publication.** Si l'un échoue, l'édition passe à `rejetee` et le
   site reste sur la précédente :
   - nombre de joueurs par catégorie à ±10 % de l'édition publiée ;
   - aucune catégorie vide ;
   - le top 10 de chaque catégorie présent ;
   - taux d'erreurs de palmarès inférieur à 2 %.
6. Si c'est OK : l'ancienne édition publiée passe à `retiree`, la nouvelle à
   `publiee`, dans une même transaction.
7. **Ensuite seulement**, remplir `frmt_rankings` depuis l'édition publiée, comme
   aujourd'hui (même contrat, `player_id` préservés), puis lancer
   `auto-match-frmt.ts`.
8. Appeler le **deploy hook Vercel** du site (secret du dépôt) : le site se
   reconstruit sur l'édition publiée.
9. Purger les résultats et les matchs au-delà de 8 éditions.

### Retour en arrière

Un script `scripts/frmt-publier.ts <edition_id>` (ou `--precedente`) :
- republie une édition existante ;
- appelle le deploy hook ;
- **ne touche pas l'app par défaut** : ni `frmt_rankings`, ni `players`. Le
  rafraîchissement actuel (`refreshLinkedPlayers`, `relink_unlinked_frmt`)
  déclenche les déclencheurs de fiabilité et de bonus des vrais joueurs (bonus
  versé deux fois, plancher modifié…). Une option explicite `--app` refait
  aussi `frmt_rankings` et le rafraîchissement des joueurs liés, à n'utiliser
  qu'en connaissance de cause. Mon choix : les contrôles de publication doivent
  empêcher une mauvaise édition d'atteindre l'app ; le retour en arrière sert
  d'abord au site.

Rien n'est jamais effacé à cette occasion. On peut aussi le lancer à la main
depuis GitHub (`workflow_dispatch` avec le paramètre).

### Alerte

Si une édition est `rejetee` ou si le passage plante, le job GitHub échoue :
GitHub envoie son e-mail d'échec habituel à jeffa.

## 8. Le site

### 8.1 Pages (validées sur maquette)

- **`/classement/hommes/` et `/classement/femmes/`** — maquette « B, cartes » :
  - titre « Classement FRMT padel », date de mise à jour de l'édition, mention
    « source FRMT » ;
  - onglets Hommes / Femmes avec leurs effectifs ;
  - champ de recherche (nom ou club) ;
  - une carte par joueur : rang, nom, club, année, points, évolution du rang et
    des points depuis l'édition précédente. Le top 3 est en jaune ;
  - l'appel « Tu es classé FRMT ? Sur Pagmatch, ton classement règle ton niveau
    dès l'inscription » avec les badges des stores.
- **`/joueur/<slug>/`** — maquette « B, le palmarès FRMT d'abord ». Dans l'ordre :
  1. rang FRMT de la catégorie, nom, club, né en ;
  2. le bloc calcul : meilleur classement (rang, points, date), bonus (départ,
     FIP, Afrique, Arabe), assimilation, total 12 mois, 12 meilleurs, points de
     classement ;
  3. l'historique des scores sur 12 mois : date, tournoi, catégorie, points, les
     lignes **comptées** en vert ;
  4. les matchs : bilan V–D en titre, puis chaque match avec tournoi, tour,
     partenaire, adversaires, score et V/D ;
  5. la courbe d'évolution des points, édition après édition ;
  6. l'appel « C'est toi ? Ton classement FRMT règle ton niveau sur Pagmatch dès
     l'inscription » avec les badges des stores.
- Chaque partenaire ou adversaire **reconnu** comme classé est un lien vers sa
  fiche (maillage interne). Un non reconnu reste du texte simple.
- Une entrée « Classement FRMT » dans le menu et le pied de page de l'accueil.

Les maquettes validées sont dans la session de maquettage du 2026-10-20 (liste B,
fiche B). Le style suit `app/globals.css`, en sombre et jaune.

### 8.2 Construction

- **Tout est généré à l'avance** au moment du build (export statique Next.js,
  `generateStaticParams`) depuis l'édition publiée. Les données sont lues côté
  build avec la clé publique (anon). Les nouvelles tables sont en lecture
  publique.
- **Aucun appel à Supabase depuis le navigateur.**
- **Trafic des builds** : le site se reconstruit à chaque push sur `main` (et en
  prévisualisation), pas seulement le lundi. Relire toute l'édition à chaque
  build (plusieurs dizaines de Mo) userait l'egress. Mon choix :
  1. le build lit d'abord l'**identifiant de l'édition publiée** (une ligne) ;
  2. il cherche `.next/cache/frmt/<edition_id>.json`, que Vercel conserve d'un
     build à l'autre ;
  3. il ne télécharge les tables que si ce fichier manque, puis l'y écrit.
  Une édition n'est donc téléchargée qu'une fois en temps normal. Si le cache
  Vercel ne suffit pas en pratique, solution de repli : le scraper dépose un
  instantané JSON par édition dans Supabase Storage (un seul fichier compressé).
- **Recherche** : un petit index JSON (nom, club, slug, rang) livré avec chaque
  page de classement, puis un filtrage dans le navigateur.
- **Taille** : environ 3 000 fiches à chaque build. Vérifier la durée du build
  Vercel et paginer les lectures Supabase (plafond de 1 000 lignes par requête
  PostgREST).
- **Référencement** :
  - titre `<Nom> — classement FRMT padel | Pagmatch` ;
  - description avec rang, points et club ;
  - adresse canonique propre ;
  - données structurées `Person` (nom, club en `memberOf`) ;
  - `sitemap.xml` **généré** avec les fiches et les deux classements (il remplace
    le sitemap statique actuel).
- **Slug** : nom en minuscules sans accents + année, par exemple
  `alami-mohamed-2002`. En cas de collision, ajouter `-h` / `-f` puis un numéro.
  Un slug ne change jamais une fois attribué (il est stocké dans `frmt_joueurs`).
- **Joueur sorti du classement** : sa fiche n'est plus générée (404). Mon choix.

## 8 bis. Environnements et migrations

- Migrations SQL versionnées **dans `matchup_padel`** (à côté du scraper), et
  appliquées d'abord sur la **base de test**, avec l'accord de jeffa à chaque fois.
  Elles sont notées dans `docs/JOURNAL_APP_TEST.md` (règle du projet), puis
  appliquées en production, avec accord.
- Premier passage complet sur la base de test, lancé à la main
  (`workflow_dispatch` ou en local), avant toute écriture en production.
- Les builds de prévisualisation Vercel lisent la production, en lecture seule :
  les données sont publiques. Pour la mise au point locale, on lit la base de test.

## 9. Décisions prises par jeffa

- Hommes **et** Femmes, tous les classés, mineurs compris.
- Fiche = tout le palmarès FRMT + le détail des matchs, dès la V1.
- Retour en arrière obligatoire.
- But : acquisition par Google (« un joueur qui tape son nom tombe sur sa fiche »).
- Liste en cartes avec podium jaune ; fiche avec le palmarès FRMT d'abord.

## 10. Choix de Claude (à relire)

- Modèle en éditions avec une seule `publiee`, et retour en arrière par
  republication.
- Rétention : 8 éditions pour les résultats et les matchs, illimitée pour les
  classements.
- Seuils des contrôles de publication (±10 %, top 10, moins de 2 % d'erreurs).
- Clé joueur = nom normalisé + année + catégorie ; adresse de fiche
  `/joueur/<slug>/`.
- Fiche absente (404) quand un joueur sort du classement.
- Pause d'environ 1,5 s par joueur, passage de nuit, alerte par l'échec du job
  GitHub.
- Pas de filtres âge/club en V1.
- Passage incrémental chaque semaine (palmarès et matchs relus seulement si les
  points changent) + passage complet mensuel, à cause des minutes GitHub du
  dépôt privé.
- Le retour en arrière ne touche que le site par défaut (option `--app`).
- Cache d'édition dans `.next/cache` pour économiser l'egress des builds.
- Homonymes parfaits départagés par rang d'apparition, puis club ; pas de fiche
  si c'est ambigu.
- Liste d'exclusion dès la V1 (sans mention sur les fiches : décision de jeffa).
- Migrations dans `matchup_padel`, base de test d'abord.

## 11. Laissé au constructeur

- Les détails des requêtes de la fenêtre des matchs (`A67`), à relever en premier.
- Le format exact du score et du tour.
- La normalisation des noms pour reconnaître partenaires et adversaires (accents,
  espaces, ordre nom/prénom).
- La découpe des scripts et les tests (l'analyse du XML WEBDEV doit être testée
  sur les réponses réelles enregistrées).
