# College Test System

Бұл жоба студенттерді тесттен өткізуге арналған толыққанды жүйе. Мұғалімдер тест құрастыра алады, ал студенттер тест тапсырып, нәтижелерін көре алады.

## Қалай іске қосу керек:

1. **Тәуелділіктерді орнату (Dependencies)**:
   ```bash
   npm install
   cd client && npm install
   ```

2. **Жобаны іске қосу (Start)**:
   Түпкі папкада (root folder) мына команданы жазыңыз:
   ```bash
   npm run dev
   ```

3. **Браузерден ашу**:
   Жоба `http://localhost:3000` портында іске қосылады.![alt text](image.png)

> Ескерту: егер `npm run dev:client` (Vite) `spawn EPERM` қатесін берсе, бұл Windows-тағы рұқсат/антивирус шектеуінен болуы мүмкін. Мұндай жағдайда тек backend арқылы дайын жинақты (`client/dist`) `http://localhost:3000` арқылы ашыңыз (яғни `npm run dev` жеткілікті).

## Негізгі технологиялар:
- Frontend: React.js, React Router, Vite
- Backend: Node.js, Express.js
- Мәліметтер базасы: SQLite (built-in)
