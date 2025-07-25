# Estágio de Build - Instala dependências e compila o projeto
FROM node:18-alpine AS builder

# Define o diretório de trabalho dentro do container
WORKDIR /usr/src/app

# Copia os arquivos de definição de pacotes e instala as dependências
COPY package*.json ./
RUN npm install

# Copia todo o código fonte da aplicação
COPY . .

# Compila a aplicação TypeScript para JavaScript
RUN npm run build

# ---

# Estágio de Produção - Imagem final, mais leve e segura
FROM node:18-alpine

WORKDIR /usr/src/app

# Copia os arquivos de definição de pacotes e instala APENAS as dependências de produção
COPY package*.json ./
RUN npm install --only=production

# Copia a aplicação compilada e os node_modules do estágio de build
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/node_modules ./node_modules


# Expõe a porta que a aplicação irá rodar
EXPOSE 3000

# Comando para iniciar a aplicação
CMD ["node", "dist/main"]