import { createSlice } from '@reduxjs/toolkit';

// Recuperar sensores guardados en localStorage al iniciar la app
const savedSensors = JSON.parse(localStorage.getItem('sensors') || '{}');

const sensorsSlice = createSlice({
  name: 'sensors',
  initialState: savedSensors,
  reducers: {
    updateSensor: (state, action) => {
      // Aseguramos que action.payload siempre sea un array
      const dataArray = Array.isArray(action.payload) ? action.payload : [action.payload];

      dataArray.forEach(sensor => {
        // Tomamos valores previos o inicializamos
        const prevSensor = state[sensor.name] || { temp: 0, hum: 0, region: sensor.region || 'N/A', history: [] };

        // Actualizamos el historial (máx 20 elementos)
        const updatedHistory = [...prevSensor.history, { temp: sensor.temp, hum: sensor.hum, timestamp: Date.now() }];
        if (updatedHistory.length > 20) updatedHistory.shift();

        // Guardamos sensor actualizado en el state
        state[sensor.name] = {
          temp: sensor.temp,
          hum: sensor.hum,
          region: sensor.region || 'N/A',
          history: updatedHistory,
        };
      });

      // Guardar todos los sensores en localStorage
      localStorage.setItem('sensors', JSON.stringify(state));
    },
    clearSensors: (state) => {
      // Limpiamos Redux
      const empty = {};
      localStorage.setItem('sensors', JSON.stringify(empty));
      return empty;
    },
  },
});

export const { updateSensor, clearSensors } = sensorsSlice.actions;
export default sensorsSlice.reducer;
