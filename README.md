# Stavelot · Maison pour le Grand Prix de Belgique

Page unique de présentation et de réservation de la maison de Stavelot pendant
le Grand Prix de Belgique (Spa-Francorchamps).

Tout le site tient dans `index.html` : styles, photos (en base64) et scripts
sont embarqués, il n'y a aucune dépendance à installer.

Les bonnes adresses viennent du PDF « Bonnes adresses Stavelot » et vivent
dans le tableau `P` du script de fin de page, un objet par lieu :

| Clé | Contenu |
| --- | --- |
| `n` | nom, affiché et cliquable vers Google Maps |
| `c` | catégorie, définie dans `CATS` (l'ordre du tableau fait l'ordre à l'écran) |
| `m` | `pied` ou `auto` — choisit l'icône de la pastille |
| `t`, `k` | durée et distance depuis la maison |
| `a` | adresse, affichée sous le nom |
| `h` | horaires, dépliés par « Voir + » |
| `d` | description, facultative |
| `p`, `s` | téléphone et site, facultatifs |
| `g` | lien Google Maps, avec son `query_place_id` |

La page en déduit les catégories dépliantes et leurs compteurs : ajouter une
adresse, c'est ajouter une ligne.

## Structure : un tour de circuit

La page se parcourt comme un tour de Spa-Francorchamps. Chaque `<section
class="turn">` est un virage, avec deux attributs lus par le script :
`data-turn` (le numéro affiché) et `data-name` (le nom du virage).

| Virage | Section | Contenu |
| --- | --- | --- |
| 01 · La Source | `#depart` | titre, prix, WhatsApp, tracé du circuit, chiffres clés |
| 02 · Raidillon | `#trajet` | le trajet à vélo en trois étapes, distances en voiture |
| 03 · Les Combes | `#maison` | les huit équipements |
| 04 · Pouhon | `#visite` | les photos |
| 05 · Blanchimont | `#adresses` | les bonnes adresses par catégorie |
| 06 · Ligne d'arrivée | `#reserver` | WhatsApp, téléphone, informations pratiques |

Une route fixe en haut de l'écran porte toute la progression : asphalte
sinueux, ligne médiane en pointillés, trajectoire rouge qui se remplit et
voiture en tête, orientée sur la tangente. Les numéros de virage sont posés
le long du tracé et cliquables, et le compteur à droite annonce le virage
courant.

Le tracé est **régénéré en pixels** à chaque redimensionnement, avec une courbe
par portion d'environ 180 px : le trait garde partout la même épaisseur, et la
route compte trois courbes sur un téléphone contre sept sur un grand écran.

Trois points de calage à respecter si ce bloc est retouché, faute de quoi la
voiture se décale du tracé :

- le SVG reçoit sa largeur et sa hauteur **en pixels** depuis le script, et son
  `viewBox` reprend ces mêmes valeurs. Un `width:100%` ou un calage par
  `left`/`right` ne dimensionne pas un élément remplacé : le tracé se retrouve
  étiré alors que la voiture, elle, est posée en pixels ;
- le compteur a une **largeur fixe**. Sans elle il s'élargit quand le nom du
  virage change, la route raccourcit en cours de défilement et sa fin passe
  sous le compteur ;
- la course s'arrête 13 px avant le bout du tracé, pour que la voiture vienne
  se ranger devant le damier d'arrivée au lieu de se poser dessus.

Ajouter ou retirer un virage ne demande rien d'autre que d'ajouter ou retirer
une section : numérotation, repères et compteur se recalculent seuls.

## À vérifier avant de diffuser le lien

Ces éléments viennent des maquettes et n'ont pas été confirmés :

- les quatre distances en voiture du virage 02 ;
- l'arrivée à 16 h et le départ à 10 h ;
- la salle de bain annonce « draps de bain fournis » : la note d'origine disait
  « draps fournis », comprise ici comme les serviettes, le linge de lit étant
  déjà annoncé dans les chambres.

## Identité visuelle

Reprise des affiches de location : fond nuit (`#0E1519`), rouge de marque
(`#E63946`), titres manuscrits (Kaushan Script) soulignés d'un trait rouge,
capitales condensées espacées (Saira Semi Condensed) pour les accroches et
texte courant en Libre Franklin. La page est en thème sombre unique : elle ne
suit plus la préférence clair/sombre du système.

Les couleurs sont définies en variables CSS sur `:root`, au début de
`index.html` : changer `--red` suffit à rehabiller tout le site.

Les équipements listés (`<ul class="feat">`) sont la seule liste
d'équipements de la page : la section « La maison » ne les répète plus et
laisse la place aux photos.

## Mettre le site à jour

1. Modifier `index.html`.
2. Committer et pousser sur la branche publiée.
3. Le workflow `.github/workflows/deploy.yml` publie la nouvelle version sur
   GitHub Pages.

## Rafraîchissement forcé des visiteurs

GitHub Pages laisse les navigateurs garder la page en cache : sans mécanisme
dédié, un visiteur qui a déjà ouvert le site peut continuer à voir l'ancienne
version. Le dispositif en place :

- à chaque déploiement, le workflow écrit `version.json` avec l'identifiant du
  commit et injecte ce même identifiant dans
  `<meta name="build-id">` de `index.html` ;
- la page interroge `version.json` (en `no-store`, donc jamais servi depuis le
  cache) au chargement, toutes les 60 s, au retour sur l'onglet et à chaque
  reprise de focus ;
- si l'identifiant reçu diffère de celui inscrit dans la page, un court message
  « Nouvelle version — mise à jour… » s'affiche et la page se recharge en
  repassant par le réseau (`fetch(..., {cache:'reload'})` puis
  `location.reload()`), ce qui court-circuite le cache HTTP.

Un onglet resté ouvert bascule donc sur la nouvelle version dans la minute qui
suit le déploiement, sans que le visiteur ait à vider son cache.

## Installer le site comme une application

Le site est une **application web installable** (PWA) : sur Android comme sur
iPhone, il peut être posé sur l'écran d'accueil et s'ouvre alors en plein
écran, sans barre d'adresse, avec sa propre icône. Trois fichiers s'en
chargent :

| Fichier | Rôle |
| --- | --- |
| `manifest.webmanifest` | nom, icônes, couleurs et `display: standalone` |
| `sw.js` | service worker : rend le site installable et consultable hors ligne |
| `icone-180/192/512.png` | icônes de l'écran d'accueil (`icone-maskable-512` pour Android) |

Les icônes sont dessinées dans `icone.svg` et `icone-maskable.svg` — la voiture
en tête de sa trajectoire rouge, comme la route de navigation. Les retoucher,
c'est modifier le SVG puis le réexporter aux quatre tailles ; la version
*maskable* est le même dessin réduit à 80 %, pour survivre au rognage rond
d'Android.

Le service worker travaille en **réseau d'abord** : la page fraîche gagne
toujours, le cache ne sert que de secours quand la connexion manque. Deux
règles à ne pas perdre de vue si `sw.js` est retouché :

- `version.json` n'est **jamais** mis en cache, sinon le rafraîchissement
  automatique décrit plus haut devient aveugle aux nouvelles versions ;
- le nom du cache porte l'identifiant du déploiement (`stavelot-<build>`) :
  chaque mise en ligne crée un cache neuf et efface les précédents.

Côté visiteur : sur Android, le navigateur propose l'installation et un bouton
« Installer l'application » apparaît dans le pied de page. iOS ne propose rien
de lui-même, la marche à suivre (Partager → « Sur l'écran d'accueil ») s'y
affiche donc à la place. Une fois l'application lancée depuis l'écran
d'accueil, les deux disparaissent.

Attention enfin à la règle `[hidden]{display:none !important}` en tête de
feuille de style : le bouton d'installation porte la classe `.cta`, qui pose
`display:inline-flex` et couvrirait sinon l'attribut `hidden`.

## Première mise en ligne

Dans les réglages du dépôt : **Settings → Pages → Build and deployment →
Source : GitHub Actions**. Le workflow se charge du reste.

Le workflow se déclenche sur `main`, `master` et sur la branche de travail
`claude/f1-project-auto-refresh-pvy2bd`. Une fois le travail fusionné dans la
branche par défaut, la ligne `claude/...` peut être retirée de
`.github/workflows/deploy.yml`.

## Travailler en local

```bash
python3 -m http.server 8000
```

puis ouvrir http://localhost:8000. En local l'identifiant de `index.html` n'est
pas remplacé : la page prend la première valeur lue dans `version.json` comme
référence. Modifier ce fichier (par exemple `{"build":"test-2"}`) déclenche le
rechargement automatique et permet de vérifier le mécanisme.

Le service worker, lui, ne s'enregistre que sur `localhost` ou en HTTPS, et
seulement si `sw.js` est servi avec le type `text/javascript` : un serveur qui
renvoie tout en `text/html` le fait échouer silencieusement, sans rien casser
d'autre dans la page.
