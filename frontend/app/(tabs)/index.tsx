import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
} from "react-native";

export default function App() {
  const [duracion, setDuracion] = useState("");
  const [socializacion, setSocializacion] = useState("");
  const [notas, setNotas] = useState("");

  const continuar = () => {
    console.log({
      duracion,
      socializacion,
      notas,
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Crear Paseo</Text>

      <Text style={styles.subtitulo}>Duración del paseo</Text>

      <View style={styles.fila}>
        <TouchableOpacity
          style={styles.boton}
          onPress={() => setDuracion("30 min")}
        >
          <Text>30 min</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.boton}
          onPress={() => setDuracion("45 min")}
        >
          <Text>45 min</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.boton}
          onPress={() => setDuracion("60 min")}
        >
          <Text>60 min</Text>
        </TouchableOpacity>
      </View>

      <Text>Seleccionado: {duracion}</Text>

      <Text style={styles.subtitulo}>Zona de paseo</Text>

      <TouchableOpacity style={styles.botonGrande}>
        <Text>Mi ubicación actual</Text>
      </TouchableOpacity>

      <Text style={styles.subtitulo}>Socialización</Text>

      <Text>¿Tu perro puede socializar con otros perros?</Text>

      <TouchableOpacity
        style={styles.boton}
        onPress={() => setSocializacion("Sí")}
      >
        <Text>Sí, puede</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.boton}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    gap: 15,
    marginTop: 50,
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

  botonGrande: {
    padding: 15,
    backgroundColor: "#ddd",
    borderRadius: 10,
  },

  input: {
    borderWidth: 1,
    borderColor: "#999",
    borderRadius: 10,
    padding: 10,
    minHeight: 100,
    textAlignVertical: "top",
  },

  continuar: {
    backgroundColor: "green",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },

  textoContinuar: {
    color: "white",
    fontWeight: "bold",
  },
})