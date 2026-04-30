import { useCallback, useState } from 'react';
import {
  Alert,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { useFocusEffect } from 'expo-router';
import MapView, { Marker, Region } from 'react-native-maps';

const STORAGE_KEY = '@geovault:segredos';

interface Segredo {
  id: string;
  texto: string;
  fotoUri: string | null;
  latitude: number;
  longitude: number;
}

const CURITIBA_REGION: Region = {
  latitude: -25.4284,
  longitude: -49.2733,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

function criarRegiaoDosSegredos(segredos: Segredo[]): Region {
  const latitudes = segredos.map((segredo) => segredo.latitude);
  const longitudes = segredos.map((segredo) => segredo.longitude);

  const minLat = Math.min(...latitudes);
  const maxLat = Math.max(...latitudes);
  const minLng = Math.min(...longitudes);
  const maxLng = Math.max(...longitudes);

  return {
    latitude: (minLat + maxLat) / 2,
    longitude: (minLng + maxLng) / 2,
    latitudeDelta: Math.max((maxLat - minLat) * 1.5, 0.01),
    longitudeDelta: Math.max((maxLng - minLng) * 1.5, 0.01),
  };
}

export default function MapaScreen() {
  const [segredos, setSegredos] = useState<Segredo[]>([]);
  const [regiao, setRegiao] = useState<Region>(CURITIBA_REGION);
  const [segredoSelecionado, setSegredoSelecionado] = useState<Segredo | null>(null);

  useFocusEffect(
    useCallback(() => {
      carregarSegredos();
    }, [])
  );

  const carregarSegredos = async () => {
    try {
      const dadosSalvos = await AsyncStorage.getItem(STORAGE_KEY);
      const lista: Segredo[] = dadosSalvos ? JSON.parse(dadosSalvos) : [];
      const listaSegura = Array.isArray(lista) ? lista : [];

      setSegredos(listaSegura);

      if (listaSegura.length > 0) {
        setRegiao(criarRegiaoDosSegredos(listaSegura));
        return;
      }

      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status === 'granted') {
        const localizacaoAtual = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        setRegiao({
          latitude: localizacaoAtual.coords.latitude,
          longitude: localizacaoAtual.coords.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        });
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Erro', 'Não foi possível carregar os segredos salvos.');
      setSegredos([]);
      setRegiao(CURITIBA_REGION);
    }
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        region={regiao}
        onRegionChangeComplete={setRegiao}
        showsUserLocation
      >
        {segredos.map((segredo) => (
          <Marker
            key={segredo.id}
            coordinate={{ latitude: segredo.latitude, longitude: segredo.longitude }}
            title="Segredo salvo"
            description="Toque no marcador para ver os detalhes"
            onPress={() => setSegredoSelecionado(segredo)}
          />
        ))}
      </MapView>

      {segredos.length === 0 && (
        <View style={styles.avisoContainer}>
          <Text style={styles.avisoText}>Nenhum segredo salvo ainda. Vá na outra aba!</Text>
        </View>
      )}

      <Modal
        visible={segredoSelecionado !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setSegredoSelecionado(null)}
      >
        <View style={styles.modalFundo}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitulo}>🔒 Segredo salvo</Text>

            {segredoSelecionado?.fotoUri ? (
              <Image source={{ uri: segredoSelecionado.fotoUri }} style={styles.modalFoto} />
            ) : (
              <View style={styles.semFotoBox}>
                <Text style={styles.semFotoTexto}>Sem foto salva</Text>
              </View>
            )}

            <Text style={styles.modalTexto}>{segredoSelecionado?.texto}</Text>

            {segredoSelecionado && (
              <Text style={styles.coordsText}>
                {segredoSelecionado.latitude.toFixed(5)}, {segredoSelecionado.longitude.toFixed(5)}
              </Text>
            )}

            <TouchableOpacity
              style={styles.btnFechar}
              onPress={() => setSegredoSelecionado(null)}
            >
              <Text style={styles.btnFecharTexto}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  avisoContainer: {
    position: 'absolute',
    top: 50,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 10,
    borderRadius: 20,
  },
  avisoText: {
    color: '#fff',
  },
  modalFundo: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#1e1e1e',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
  },
  modalTitulo: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 14,
  },
  modalFoto: {
    width: '100%',
    height: 260,
    borderRadius: 12,
    backgroundColor: '#333',
    marginBottom: 14,
  },
  semFotoBox: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  semFotoTexto: {
    color: '#aaa',
  },
  modalTexto: {
    color: '#fff',
    fontSize: 17,
    textAlign: 'center',
    marginBottom: 10,
    lineHeight: 23,
  },
  coordsText: {
    color: '#aaa',
    fontSize: 12,
    marginBottom: 16,
  },
  btnFechar: {
    backgroundColor: '#007bff',
    paddingVertical: 12,
    paddingHorizontal: 36,
    borderRadius: 24,
  },
  btnFecharTexto: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
