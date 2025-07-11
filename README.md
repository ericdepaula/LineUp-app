
# LineUp

**LineUp** é um aplicativo desenvolvido com **React Native** e **Expo**, criado para **exportar os contatos da agenda telefônica** do dispositivo para um arquivo Excel no formato `.xlsx`. Este guia fornecerá as instruções de instalação, execução do app e como gerar o arquivo `.apk` para Android.

---

## Teste rápido (sem instalar nada)

Se você quiser apenas testar o aplicativo sem instalar dependências ou rodar localmente, basta acessar o link abaixo e seguir as instruções da plataforma Expo:

[Testar o LineUp no Expo](https://expo.dev/accounts/depaula39/projects/Contact-Export-App/builds/000f0c9e-7278-4942-bddf-a3784758f734)

---

## Funcionalidade Principal

- **Exportação de Contatos**: O app permite ao usuário exportar os contatos da agenda telefônica do dispositivo para um arquivo **Excel** no formato `.xlsx`.
- **Formato de Exportação**: O arquivo gerado contém informações como **nome**, **número de telefone** e **e-mail** (se disponível) dos contatos.

---

## Requisitos

Antes de começar, certifique-se de que você tem os seguintes softwares instalados:

- [Node.js](https://nodejs.org/) (versão LTS recomendada)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- [Android Studio](https://developer.android.com/studio) (para emulação Android e build do APK)

---

## Passo 1: Clonar o repositório

Clone o repositório para sua máquina local:

```bash
git clone https://github.com/seu-usuario/lineup.git
cd lineup
```

---

## Passo 2: Instalar Dependencias

Instale as dependências do projeto:

```bash
npm install
# ou
yarn install
```

---

## Passo 3: Rodar o aplicativo em modo desenvolvimento

Para iniciar o app em modo de desenvolvimento no seu dispositivo ou emulador:

```bash
npx expo start
```

Siga as instruções do terminal para abrir o app no seu dispositivo físico (usando o app Expo Go) ou emulador Android.

---

## Passo 4: Gerar o APK para Android

Para gerar o arquivo APK de instalação para Android:

```bash
npx expo run:android
# ou, para build de produção com EAS Build:
npx eas build -p android --profile production
```

O APK será gerado e as instruções aparecerão no terminal.

---

## Como usar o LineUp

1. Abra o aplicativo no seu dispositivo ou emulador.
2. Permita o acesso aos contatos quando solicitado.
3. Toque no botão de exportação para gerar o arquivo Excel (.xlsx) com seus contatos.
4. O arquivo será salvo na pasta de downloads do dispositivo ou conforme instruções do app.