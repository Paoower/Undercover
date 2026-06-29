# Déployer Undercover en ligne 🚀

Le serveur garde l'état des parties **en mémoire** et utilise **Socket.IO**
(connexions WebSocket persistantes). Il faut donc un hébergement **Node
persistant** — pas du serverless.

> ⚠️ **Vercel / Netlify ne conviennent pas pour le serveur** (serverless : pas
> d'état en mémoire ni de WebSocket long). On déploie tout sur **Render** (ou
> **Railway**) en **un seul service** : le serveur Express sert à la fois le jeu
> (Socket.IO) **et** le client React buildé. Une seule URL, pas de CORS.

---

## Option A — Render (recommandé, gratuit)

### 1. Pousser le code sur GitHub

```bash
git add .
git commit -m "Undercover game"
git push
```

### 2a. Via le Blueprint (automatique)

Le fichier [`render.yaml`](./render.yaml) est déjà présent à la racine.

1. Va sur https://dashboard.render.com → **New** → **Blueprint**.
2. Connecte ton dépôt GitHub. Render lit `render.yaml` et crée le service.
3. Clique **Apply**. C'est tout.

### 2b. Ou manuellement (sans blueprint)

1. **New** → **Web Service** → connecte le dépôt.
2. Réglages :
   - **Runtime** : `Node`
   - **Build Command** : `npm run prod:build`
   - **Start Command** : `npm start`
   - **Health Check Path** : `/health`
   - **Plan** : Free
3. **Create Web Service**.

### 3. Jouer

Render te donne une URL du type `https://undercover-xxxx.onrender.com`.
Partage-la : tout le monde ouvre cette URL, crée/rejoint une room, et joue.

> 💤 Le plan gratuit Render **met le service en veille** après ~15 min
> d'inactivité. La 1ʳᵉ connexion après une pause prend ~30 s à réveiller le
> serveur (et **réinitialise les parties en cours**, puisque l'état est en
> mémoire). Pour un usage soutenu, prends un plan payant ou Railway.

---

## Option B — Railway

1. https://railway.app → **New Project** → **Deploy from GitHub repo**.
2. Dans **Settings** du service :
   - **Build Command** : `npm run prod:build`
   - **Start Command** : `npm start`
3. Railway fournit le `PORT` automatiquement (le serveur l'utilise déjà via
   `process.env.PORT`).
4. **Settings → Networking → Generate Domain** pour obtenir une URL publique.

---

## Option C — Deux services séparés (avancé)

Si tu préfères héberger le client (statique) et le serveur séparément :

1. **Serveur** : déploie le dossier `server/` comme Web Service Node
   (`npm install` / `npm start`).
2. **Client** : déploie `client/` comme site statique
   (build `npm install && npm run build`, dossier publié `dist`) — ça peut même
   aller sur **Vercel** ou **Netlify** pour le client seul.
3. Au build du client, définis la variable d'environnement
   **`VITE_SERVER_URL`** = l'URL publique du serveur
   (ex. `https://undercover-server.onrender.com`).

Le client lit `VITE_SERVER_URL` en priorité (voir `client/src/socket.ts`).

---

## Tester rapidement sans déployer

### Sur le même réseau Wi-Fi (LAN)

```bash
npm run dev
```

Trouve ton IP locale (`ip a` / `ifconfig` → ex. `192.168.1.20`) puis, depuis un
autre appareil du réseau, ouvre `http://192.168.1.20:5173`.
Le client se connecte automatiquement au serveur sur le même hostname `:3001`.

### Tunnel temporaire (amis distants) — ngrok

En prod single-service local :

```bash
npm run prod:build && PORT=3001 npm start   # sert client + serveur sur :3001
ngrok http 3001                             # dans un autre terminal
```

Partage l'URL `https://xxxx.ngrok-free.app` fournie par ngrok.
