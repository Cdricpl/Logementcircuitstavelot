# Stavelot · Maison pour le Grand Prix de Belgique

Page unique de présentation et de réservation de la maison de Stavelot pendant
le Grand Prix de Belgique (Spa-Francorchamps).

Tout le site tient dans `index.html` : styles, photos (en base64), carte
Leaflet et scripts sont embarqués, il n'y a aucune dépendance à installer.

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
