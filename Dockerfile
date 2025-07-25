# 1. Usa a versão 20 do Node.js, que é compatível com as dependências
FROM node:20-alpine

# Define o diretório de trabalho dentro do container
WORKDIR /usr/src/app

# Copia os arquivos de definição de pacotes primeiro
COPY package*.json ./

# 2. Copia a pasta do Prisma ANTES de instalar as dependências
COPY prisma ./prisma/

# Instala TODAS as dependências (incluindo as de desenvolvimento)
# Agora o "prisma generate" (do postinstall) vai funcionar
RUN npm install

# Copia todo o resto do código fonte
COPY . .

# Expõe a porta da aplicação
EXPOSE 3000

# O comando para iniciar em modo de desenvolvimento
CMD ["npm", "run", "start:dev"]