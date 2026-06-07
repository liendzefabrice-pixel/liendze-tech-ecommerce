# 🚀 Guide de Déploiement Liendze Tech E-Commerce

## Frontend (React + Vercel)

### ✅ Déjà fait !
Votre app React est déployée sur Vercel. 
**URL** : Vous recevrez un email de Vercel avec votre URL.

---

## Backend (Strapi + PostgreSQL + Render)

### Étape 1 : Créer une DB PostgreSQL sur Render
1. Aller sur https://render.com
2. Sign Up (ou Login)
3. Dashboard → "New +" → "PostgreSQL"
4. Remplir :
   - **Name** : `liendze-tech-db`
   - **Database** : `liendze_tech`
   - **User** : `admin`
   - **Region** : Closest to you
   - **Plan** : Free
5. Cliquer "Create Database"
6. **⏳ Attendre 5-10 min** que la DB soit ready

### Étape 2 : Copier la chaîne de connexion
Une fois la DB créée:
1. Cliquer sur `liendze-tech-db`
2. Copier l'URL sous "Connections" → "External Database URL"
3. Ressemble à : `postgresql://admin:PASSWORD@host:5432/liendze_tech`
4. **Gardez-la précieusement !**

### Étape 3 : Déployer le Backend sur Render
1. Aller sur https://render.com → New → Web Service
2. Connecter votre repo GitHub `liendze-tech-ecommerce`
3. Sélectionner le dossier `my-admin` comme racine
4. Remplir :
   - **Name** : `liendze-tech-api`
   - **Environment** : Node
   - **Build Command** : `npm run build`
   - **Start Command** : `npm start`
   - **Plan** : Free
   - **Node Version** : 20

### Étape 4 : Configurer les variables d'environnement
Dans le formulaire Render, ajouter les variables :

```
DATABASE_CLIENT=postgres
DATABASE_URL=[PASTE YOUR DB URL HERE]
DATABASE_SSL=true
DATABASE_SSL_REJECT_UNAUTHORIZED=false
NODE_ENV=production
PORT=1337
```

5. Cliquer "Create Web Service"
6. **⏳ Le déploiement prendra 5-10 min**

### Étape 5 : Récupérer l'URL du Backend
Une fois deployé:
1. Vercel vous donnera une URL style : `https://liendze-tech-api.onrender.com`
2. **C'est l'URL de votre API**

---

## Connecter Frontend et Backend

### Mettre à jour la config de l'API

Editez le fichier : `liendze-tech-solutions/src/config/api.js`

Remplacer:
```javascript
// OLD
const API_BASE_URL = "http://localhost:1337";

// NEW
const API_BASE_URL = process.env.REACT_APP_API_URL || "https://liendze-tech-api.onrender.com";
```

### Ajouter variable d'environnement Vercel

1. Aller sur https://vercel.com → Sélectionner votre projet
2. Settings → Environment Variables
3. Ajouter :
   - **Name** : `REACT_APP_API_URL`
   - **Value** : `https://liendze-tech-api.onrender.com`

4. Déployer à nouveau (git push)

---

## 🔗 URLs Finales

- **Frontend** : https://your-vercel-domain.vercel.app
- **Backend API** : https://liendze-tech-api.onrender.com
- **Admin Strapi** : https://liendze-tech-api.onrender.com/admin

---

## ⚠️ Limitations Plan Gratuit Render

- Site "dors" après 15 min d'inactivité
- Premier accès peut prendre 30 sec (réveil de la DB)
- CPU/RAM limité
- Pas de backup automatique

**Solution** : Upgrader à $7/mois pour toujours actif

---

## ✅ Résumé des étapes

- [x] Vercel + Frontend React
- [ ] PostgreSQL sur Render
- [ ] Strapi Backend sur Render
- [ ] Connecter Frontend ↔ Backend
- [ ] Tester en production
