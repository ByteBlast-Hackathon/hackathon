# Hackathon 2025 - UniAI HealthTech

Este é o **monorepo oficial** do Hackathon. Ele contém o código-fonte para todas as aplicações que compõem a plataforma: **backend**, **frontend** e **mobile**.

---

## 📂 Estrutura do Repositório

O projeto está organizado da seguinte forma para facilitar o desenvolvimento e a manutenção:
```
├── 📁 backend/ # API em NestJS
├── 📁 frontend/ # Aplicação Web em Next.js
└── 📁 mobile/ # Aplicação Mobile em React Native
```

Cada uma destas pastas é um projeto independente com as suas próprias dependências e scripts.  
Por favor, consulte o `README.md` dentro de cada diretório para obter instruções detalhadas de instalação e execução.

---

## 🛠️ Tecnologias Utilizadas

### 🖥️ Backend
- **Framework:** NestJS  
- **Linguagem:** TypeScript  
- **Base de Dados:** PostgreSQL com TypeORM  
- **Autenticação:** JWT com Passport.js  
- **Processamento de Ficheiros:** Multer, pdf2pic, Tesseract.js  
- **Containerização:** Docker & Docker Compose  

### 🌐 Frontend
- **Framework:** Next.js  
- **Linguagem:** TypeScript  
- **Estilização:** Tailwind CSS  
- **Componentes UI:** Shadcn/ui  
- **Validação de Schema:** Zod  

### 📱 Mobile
- **Framework:** React Native  
- **Plataforma:** Expo  

---

## 🚀 Como Começar

### 1. Clone o Repositório

```bash
git clone https://github.com/ByteBlast-Hackathon/hackathon
cd hackathon
```

### 2. Desenvolvimento do Backend

O backend é executado com Docker. Para iniciar:

```bash
cd backend
cp .env.example .env
docker-compose up --build
```

Após iniciar os contentores pela primeira vez, a base de dados estará vazia.
Para popular com os dados dos procedimentos, execute:

```
docker-compose exec nestjs-app npx ts-node src/procedure/seeder/procedure.seeder.ts
```

### 3. Desenvolvimento do Frontend
```
cd frontend
npm install
npm run dev
```

### 4. Desenvolvimento Mobile
```
cd mobile
npm install
npx expo start
```

## 📚 Documentação da API

Confira a documentação da API na rota:

> http://localhost:3000/api-docs

---

### Integrantes do Grupo ByteBlast:

- Arthur dos Santos Pavan
- Felipe dos Santos Silva
- Igor de Moura
- Victor Gabriel Fregne Santucci