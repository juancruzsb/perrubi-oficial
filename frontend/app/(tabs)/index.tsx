import React, { useState } from "react";
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
} from "react-native";

export default function HomeScreen() {
  const [duracion, setDuracion] = useState("");
  const [ubicacion, setUbicacion] = useState("");
  const [socializacion, setSocializacion] = useState("");
  const [notas, setNotas] = useState("");

  const continuar = () => {
    console.log({
      duracion,
      ubicacion,
      socializacion,
      notas,
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.titulo}>Crear Paseo</Text>

      <Text style={styles.subtitulo}>
        Duración del paseo
      </Text>

      <View style={styles.fila}>
        <TouchableOpacity
          style={[
            styles.boton,
            duracion === "30 min" && styles.botonActivo,
          ]}
          onPress={() => setDuracion("30 min")}
        >
          <Text>30 min</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.boton,
            duracion === "45 min" && styles.botonActivo,
          ]}
          onPress={() => setDuracion("45 min")}
        >
          <Text>45 min</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.boton,
            duracion === "60 min" && styles.botonActivo,
          ]}
          onPress={() => setDuracion("60 min")}
        >
          <Text>60 min</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.boton,
            duracion === "90 min" && styles.botonActivo,
          ]}
          onPress={() => setDuracion("90 min")}
        >
          <Text>90 min</Text>
        </TouchableOpacity>
      </View>

      <Text>Seleccionado: {duracion}</Text>

      <Text style={styles.subtitulo}>
        Zona de paseo
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Ingresa una dirección"
        value={ubicacion}
        onChangeText={setUbicacion}
      />

      <Text style={styles.subtitulo}>
        Socialización
      </Text>

      <Text>
        ¿Tu perro puede socializar con otros perros?
      </Text>

      <TouchableOpacity
        style={[
          styles.boton,
          socializacion === "Sí" &&
            styles.botonActivo,
        ]}
        onPress={() => setSocializacion("Sí")}
      >
        <Text>Sí, puede</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.boton,
          socializacion === "No" &&
            styles.botonActivo,
        ]}
        onPress={() => setSocializacion("No")}
      >
        <Text>No, prefiero que no</Text>
      </TouchableOpacity>

      <Text>Elegido: {socializacion}</Text>

      <Text style={styles.subtitulo}>
        Notas adicionales
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Escribe algo sobre tu perro..."
        multiline
        value={notas}
        onChangeText={setNotas}
      />

      <TouchableOpacity
        style={styles.continuar}
        onPress={continuar}
      >
        <Text style={styles.textoContinuar}>
          Continuar
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 15,
    paddingTop: 60,
    paddingBottom: 40,
  },

  titulo: {
    fontSize: 28,
    fontWeight: "bold",
  },

  subtitulo: {
    fontSize: 18,
    fontWeight: "600",
  },

  fila: {
    flexDirection: "row",
    gap: 10,
    flexWrap: "wrap",
  },

  boton: {
    padding: 12,
    backgroundColor: "#ddd",
    borderRadius: 10,
  },

  botonActivo: {
    backgroundColor: "#8BE28B",
  },

  input: {
    borderWidth: 1,
    borderColor: "#999",
    borderRadius: 10,
    padding: 10,
    minHeight: 50,
  },

  continuar: {
    backgroundColor: "green",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },

  textoContinuar: {
    color: "white",
    fontWeight: "bold",
  },
});