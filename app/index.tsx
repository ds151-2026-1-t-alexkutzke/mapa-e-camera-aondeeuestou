import { useRef, useState } from 'react';
import type { ComponentRef } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Location from 'expo-location';

const STORAGE_KEY = '@geovault:segredos';

interface Segredo {
  id: string;
  texto: string;
  fotoUri: string;
  latitude: number;
  longitude: number;
}

export default function NovoSegredoScreen() {
  const cameraRef = useRef<ComponentRef<typeof CameraView>>(null);

  const [texto, setTexto] = useState('');
  const [fotoUri, setFotoUri] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [tirandoFoto, setTirandoFoto] = useState(false);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();

  const handleAbrirCamera = async () => {
    try {
      if (!cameraPermission?.granted) {
        const permission = await requestCameraPermission();

        if (!permission.granted) {
          Alert.alert(
            'Permissão necessária',
            'Para salvar um segredo com foto, permita o acesso à câmera.'
          );
          return;
        }
      }

      setCameraReady(false);
      setIsCameraOpen(true);
    } catch (error) {
      console.error(error);
      Alert.alert('Erro', 'Não foi possível abrir a câmera.');
    }
  };

  const handleTirarFoto = async () => {
    if (!cameraReady) {
      Alert.alert('Aguarde', 'A câmera ainda está carregando.');
      return;
    }

    try {
      setTirandoFoto(true);
      const foto = await cameraRef.current?.takePictureAsync({
        quality: 0.8,
        skipProcessing: false,
      });

      if (!foto?.uri) {
        Alert.alert('Erro', 'Não foi possível capturar a foto.');
        return;
      }

      setFotoUri(foto.uri);
      setIsCameraOpen(false);
    } catch (error) {
      console.error(error);
      Alert.alert('Erro', 'Ocorreu um problema ao tirar a foto.');
    } finally {
      setTirandoFoto(false);
    }
  };

  const handleSalvarSegredo = async () => {
    const textoTratado = texto.trim();

    if (!textoTratado) {
      Alert.alert('Erro', 'Digite um segredo primeiro!');
      return;
    }

    if (!fotoUri) {
      Alert.alert('Erro', 'Adicione uma foto ao segredo antes de salvar.');
      return;
    }

    try {
      setSalvando(true);

      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert(
          'Permissão necessária',
          'Para salvar o ponto no mapa, permita o acesso à localização.'
        );
        return;
      }

      const localizacao = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const novoSegredo: Segredo = {
        id: Date.now().toString(),
        texto: textoTratado,
        fotoUri,
        latitude: localizacao.coords.latitude,
        longitude: localizacao.coords.longitude,
      };

      const dadosSalvos = await AsyncStorage.getItem(STORAGE_KEY);
      const listaAtual: Segredo[] = dadosSalvos ? JSON.parse(dadosSalvos) : [];
      const novaLista = Array.isArray(listaAtual) ? [...listaAtual, novoSegredo] : [novoSegredo];

      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(novaLista));

      Alert.alert('Sucesso', 'Segredo salvo no GeoVault!');
      setTexto('');
      setFotoUri(null);
    } catch (error) {
      console.error(error);
      Alert.alert('Erro', 'Não foi possível salvar o segredo.');
    } finally {
      setSalvando(false);
    }
  };

  if (isCameraOpen) {
    return (
      <View style={styles.cameraContainer}>
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing="back"
          onCameraReady={() => setCameraReady(true)}
        />

        <View style={styles.cameraOverlay}>
          <TouchableOpacity
            style={[styles.btnCapturar, tirandoFoto && styles.btnDisabled]}
            onPress={handleTirarFoto}
            disabled={tirandoFoto}
          >
            {tirandoFoto ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.btnText}>Capturar</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.btnCancelar}
            onPress={() => setIsCameraOpen(false)}
            disabled={tirandoFoto}
          >
            <Text style={styles.btnText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>GeoVault</Text>
        <Text style={styles.subtitle}>Guarde uma lembrança secreta exatamente onde você está.</Text>

        <Text style={styles.label}>Qual o seu segredo neste local?</Text>

        <TextInput
          style={styles.input}
          placeholder="Escreva algo marcante..."
          placeholderTextColor="#777"
          value={texto}
          onChangeText={setTexto}
          multiline
        />

        <View style={styles.fotoContainer}>
          {fotoUri ? (
            <View style={styles.previewContainer}>
              <Image source={{ uri: fotoUri }} style={styles.previewFoto} />
              <TouchableOpacity style={styles.btnTrocarFoto} onPress={handleAbrirCamera}>
                <Text style={styles.btnTrocarFotoText}>Tirar outra foto</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.btnFotoOutline} onPress={handleAbrirCamera}>
              <Text style={styles.btnFotoText}>📷 Adicionar Foto ao Segredo</Text>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={[styles.btnSalvar, salvando && styles.btnDisabled]}
          onPress={handleSalvarSegredo}
          disabled={salvando}
        >
          {salvando ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.btnSalvarText}>Salvar Segredo e Localização 📍</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1e1e1e',
  },
  content: {
    flexGrow: 1,
    padding: 20,
  },
  title: {
    color: '#fff',
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  subtitle: {
    color: '#aaa',
    fontSize: 14,
    marginBottom: 24,
  },
  label: {
    color: '#fff',
    fontSize: 18,
    marginBottom: 10,
    fontWeight: 'bold',
  },
  input: {
    backgroundColor: '#333',
    color: '#fff',
    padding: 15,
    borderRadius: 8,
    minHeight: 120,
    textAlignVertical: 'top',
    fontSize: 16,
  },
  fotoContainer: {
    marginVertical: 20,
    alignItems: 'center',
  },
  previewContainer: {
    width: '100%',
  },
  previewFoto: {
    width: '100%',
    height: 220,
    borderRadius: 8,
    backgroundColor: '#111',
  },
  btnTrocarFoto: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#007bff',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  btnTrocarFotoText: {
    color: '#007bff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  btnFotoOutline: {
    borderWidth: 1,
    borderColor: '#007bff',
    borderStyle: 'dashed',
    padding: 30,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  btnFotoText: {
    color: '#007bff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  btnSalvar: {
    backgroundColor: '#28a745',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    minHeight: 52,
    justifyContent: 'center',
  },
  btnSalvarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  btnDisabled: {
    opacity: 0.65,
  },
  cameraContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 40,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  btnCapturar: {
    backgroundColor: '#28a745',
    paddingHorizontal: 24,
    paddingVertical: 15,
    borderRadius: 30,
    minWidth: 120,
    alignItems: 'center',
  },
  btnCancelar: {
    backgroundColor: '#dc3545',
    paddingHorizontal: 24,
    paddingVertical: 15,
    borderRadius: 30,
    minWidth: 120,
    alignItems: 'center',
  },
  btnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
});
