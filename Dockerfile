# Use uma imagem oficial do Node.js como base
FROM node:20

# Crie o diretório de trabalho dentro do container
WORKDIR /app

# Copie os arquivos de dependências
COPY package*.json ./

# Instale as dependências
RUN npm install

# Copie o restante do código para o container
COPY . .

# (Opcional) Compile o TypeScript para JavaScript, se necessário
# RUN npm run build

# Exponha a porta, se seu app rodar um servidor (remova se não for necessário)
# EXPOSE 3000

# Comando para rodar o app
CMD ["npx", "ts-node", "src/index.ts"]