# Como configurar o Vercel Postgres com Prisma

1. Crie um banco de dados Postgres na Vercel:
   - Acesse https://vercel.com/dashboard/postgres
   - Clique em "Create Database" e siga os passos.
   - Copie a string de conexão (Connection String).

2. Adicione a variável de ambiente no seu projeto:
   - No painel da Vercel, vá em "Settings" do seu projeto.
   - Em "Environment Variables", adicione:
     - Nome: DATABASE_URL
     - Valor: <sua_connection_string>

   - Ou crie um arquivo `.env` na raiz do projeto com:
     DATABASE_URL=<sua_connection_string>

3. Configure o Prisma:
   - No arquivo `prisma/schema.prisma`, altere o bloco `datasource` para:

     datasource db {
       provider = "postgresql"
       url      = env("DATABASE_URL")
     }

4. Rode as migrações:
   - Execute no terminal:
     npx prisma migrate dev

5. Pronto! Seu projeto estará conectado ao banco de dados da Vercel.

Se quiser que eu já edite o `schema.prisma` e crie o `.env`, me envie a string de conexão do banco criada na Vercel.
