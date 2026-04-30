[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/Kjw0hoXJ)
# Exercício Prático: Mapa e Câmera

Neste exercício, vamos construir o **GeoVault**, um diário georreferenciado offline. O objetivo da aplicação é permitir que o usuário guarde "segredos" (um texto e uma foto) atrelados exatamente ao local no mundo onde ele estava naquele momento, exibindo tudo em um mapa interativo.

Todos os dados serão salvos no próprio aparelho utilizando o `AsyncStorage`.

## Objetivos
* Solicitar permissões nativas do dispositivo.
* Capturar coordenadas geográficas com `expo-location`.
* Tirar fotos utilizando a câmera do dispositivo com `expo-camera`.
* Exibir mapas interativos e marcadores customizados com `react-native-maps`.
* Salvar e ler listas de objetos complexos (JSON) no `@react-native-async-storage/async-storage`.

---

## Passo 1: Preparação do Ambiente

Antes de começar a programar, instale as bibliotecas necessárias no terminal do projeto (elas já estão instaladas nesse repositório inicial. Portanto, um `npm ci` será suficiente):

```bash
npx expo install react-native-maps expo-camera expo-location @react-native-async-storage/async-storage
```

Não se esqueça de adicionar as permissões no arquivo `app.json` (plugins de câmera e localização) para que o aplicativo não feche sozinho (crash) quando for testado no celular. Após alterar o `app.json`, reinicie o servidor do Expo com `npx expo start -c`.

## Passo 2: O Fluxo de Salvar o Segredo (A Câmera)

Criar a tela de cadastro do segredo. Ela deve conter um campo de texto e um botão para abrir a câmera.

**O que o código deve fazer:**
1. Solicitar a permissão de GPS e buscar a localização atual (`Location.getCurrentPositionAsync()`).
2. Abrir a câmera e permitir que o usuário tire uma foto, guardando a `URI` da imagem gerada.
3. Ao clicar em **"Salvar no Cofre"**, o aplicativo deve criar um objeto no seguinte formato:
   ```javascript
   const novoSegredo = {
     id: Date.now().toString(),
     texto: "Achei um lugar incrível!",
     fotoUri: "file:///caminho/da/foto.jpg",
     latitude: -25.4284,
     longitude: -49.2733
   };
   ```
4. **Persistência:** Leia a lista atual do `AsyncStorage`, adicione o `novoSegredo` a essa lista, converta para string com `JSON.stringify()` e salve novamente.

## Passo 3: O Mapa dos Segredos

Criar uma aba ou tela contendo o componente `<MapView>` ocupando a tela inteira.

**O que o código deve fazer:**
1. Assim que a tela abrir, leia a lista de segredos salva no `AsyncStorage` com `JSON.parse()`.
2. Utilize a função `.map()` no array de segredos para renderizar um componente `<Marker>` no mapa para cada item, utilizando a `latitude` e `longitude` salvas.
3. **Desafio:** Ao clicar em um pino no mapa, exiba o texto do segredo e a miniatura da foto que foi tirada naquele local. Você pode fazer isso customizando o `<Callout>` (o balãozinho do mapa) ou abrindo um `Modal` nativo do React Native.

### Dicas
* **O emulador não tem GPS móvel:** Lembre-se de configurar uma localização falsa (Mock Location) nas configurações do emulador Android/iOS se estiver usando o PC.
* **Teste no celular real:** Sempre que trabalhar com câmera, a melhor experiência é usar o aplicativo do **Expo Go** no seu próprio smartphone conectado ao Wi-Fi.

---

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
