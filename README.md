# 🔐 WebApp con Autenticazione Sicura

Una webapp moderna con autenticazione sicura, database PostgreSQL e frontend React.

## 🚀 Caratteristiche

### Sicurezza
- ✅ Autenticazione JWT con sessioni sicure
- ✅ Password hashing con bcrypt (12 rounds)
- ✅ Rate limiting per prevenire brute force
- ✅ Validazione input con sanitizzazione
- ✅ Headers di sicurezza (Helmet)
- ✅ CORS configurato
- ✅ Audit logging per sicurezza
- ✅ Gestione sessioni con scadenza

### Backend
- ✅ Node.js con Express e TypeScript
- ✅ Database PostgreSQL con Prisma ORM
- ✅ Validazione input con express-validator
- ✅ Gestione errori centralizzata
- ✅ Logging strutturato

### Frontend
- ✅ React con TypeScript
- ✅ Routing con React Router
- ✅ Gestione stato con Context API
- ✅ Form validation con react-hook-form
- ✅ UI moderna con Tailwind CSS
- ✅ Interceptor per refresh token automatico

## 📋 Prerequisiti

- Node.js 18+ 
- PostgreSQL 12+
- npm o yarn

## 🛠️ Installazione

### 1. Clona il repository
```bash
git clone <repository-url>
cd secure-webapp
```

### 2. Installa le dipendenze
```bash
# Backend
npm install

# Frontend
cd client
npm install
cd ..
```

### 3. Configura il database

Crea un database PostgreSQL:
```sql
CREATE DATABASE secure_webapp_db;
```

### 4. Configura le variabili d'ambiente

Copia il file di esempio:
```bash
cp env.example .env
```

Modifica `.env` con le tue configurazioni:
```env
# Server Configuration
NODE_ENV=development
PORT=3001

# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/secure_webapp_db"

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=24h

# Security Configuration
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS Configuration
CORS_ORIGIN=http://localhost:3000
```

### 5. Setup del database

```bash
# Genera il client Prisma
npm run db:generate

# Esegui le migrazioni
npm run db:migrate

# Popola il database con dati di test
npm run db:seed
```

### 6. Avvia l'applicazione

```bash
# Sviluppo (backend + frontend)
npm run dev

# Solo backend
npm run dev:server

# Solo frontend
cd client && npm start
```

## 🔑 Credenziali di Test

Dopo aver eseguito il seed, puoi usare questi account:

### Admin
- Email: `admin@example.com`
- Password: `Admin123!`
- Ruolo: ADMIN

### User
- Email: `user@example.com`
- Password: `User123!`
- Ruolo: USER

## 📚 API Endpoints

### Autenticazione
- `POST /api/auth/register` - Registrazione utente
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `POST /api/auth/refresh-token` - Refresh token
- `GET /api/auth/profile` - Profilo utente
- `POST /api/auth/forgot-password` - Richiesta reset password
- `POST /api/auth/reset-password` - Reset password

### Health Check
- `GET /health` - Stato del server

## 🏗️ Struttura del Progetto

```
├── src/
│   ├── config/           # Configurazioni
│   ├── controllers/      # Controller API
│   ├── middleware/       # Middleware Express
│   ├── routes/          # Route definitions
│   ├── services/        # Business logic
│   └── server.ts        # Entry point
├── prisma/
│   └── schema.prisma    # Schema database
├── client/              # Frontend React
│   ├── src/
│   │   ├── components/  # Componenti React
│   │   ├── contexts/    # Context API
│   │   ├── services/    # API services
│   │   └── types/       # TypeScript types
└── package.json
```

## 🔒 Sicurezza Implementata

### Backend
- **JWT con sessioni**: Token con scadenza e gestione sessioni
- **Password hashing**: bcrypt con 12 rounds
- **Rate limiting**: Protezione da brute force
- **Input validation**: Sanitizzazione e validazione
- **Security headers**: Helmet per headers sicuri
- **CORS**: Configurazione sicura
- **Audit logging**: Tracciamento attività

### Frontend
- **Token storage**: localStorage sicuro
- **Auto refresh**: Refresh automatico token
- **Route protection**: Protezione route private
- **Form validation**: Validazione client-side
- **Error handling**: Gestione errori user-friendly

## 🚀 Deployment

### Produzione
1. Imposta `NODE_ENV=production`
2. Cambia `JWT_SECRET` con una chiave sicura
3. Configura database PostgreSQL di produzione
4. Build frontend: `cd client && npm run build`
5. Build backend: `npm run build`
6. Avvia: `npm start`

### Docker (opzionale)
```dockerfile
# Dockerfile per backend
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3001
CMD ["node", "dist/server.js"]
```

## 🧪 Testing

### Test Automatici con Playwright
Il progetto include test automatizzati che verificano il funzionamento su tutti i browser principali:

```bash
# Esegui tutti i test
make test

# Esegui test con interfaccia grafica
make test-ui

# Visualizza report dei test
make test-report

# Installa browser per i test
make test-install
```

### Browser Supportati
- ✅ **Chrome/Chromium** - Desktop e Mobile
- ✅ **Firefox** - Desktop
- ✅ **Safari** - Desktop e Mobile (WebKit)
- ✅ **Edge** - Desktop

### Test Inclusi
- 🔐 **Login/Logout** - Autenticazione completa
- 🧭 **Navigazione** - Routing e menu
- 📱 **Responsive** - Test mobile e desktop
- ⌨️ **Accessibilità** - Navigazione tastiera
- 🔄 **Browser** - Back/forward, refresh

### GitHub Actions
I test vengono eseguiti automaticamente su:
- Push su `main` e `develop`
- Pull Request su `main` e `develop`

### Comandi Test
```bash
# Test specifici
npx playwright test login.spec.ts
npx playwright test --project=firefox
npx playwright test --project="Mobile Chrome"

# Debug test
npx playwright test --debug
npx playwright test --headed
```

## 📝 Script Disponibili

```bash
# Sviluppo
npm run dev              # Backend + Frontend
npm run dev:server       # Solo backend
npm run dev:client       # Solo frontend

# Build
npm run build            # Build completo
npm run build:server     # Build backend
npm run build:client     # Build frontend

# Database
npm run db:migrate       # Esegui migrazioni
npm run db:generate      # Genera client Prisma
npm run db:seed          # Popola database
npm run db:studio        # Apri Prisma Studio

# Produzione
npm start                # Avvia server produzione
```

## 🤝 Contribuire

1. Fork il progetto
2. Crea un branch per la feature (`git checkout -b feature/AmazingFeature`)
3. Commit le modifiche (`git commit -m 'Add some AmazingFeature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Apri una Pull Request

## 📄 Licenza

Questo progetto è sotto licenza MIT. Vedi il file `LICENSE` per dettagli.

## 🆘 Supporto

Per problemi o domande:
1. Controlla la documentazione
2. Cerca nelle issues esistenti
3. Crea una nuova issue

---

**⚠️ Importante**: Cambia sempre `JWT_SECRET` in produzione e usa HTTPS!

