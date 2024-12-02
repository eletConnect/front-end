import axios from 'axios';

const RENDER_API = import.meta.env.VITE_API;
const LOCAL_API = 'http://localhost:3001';

const instance = axios.create({
  baseURL: RENDER_API,
});

async function verificarAPI() {
  try {
    await instance.get('/status');
    console.log('Conectado com sucesso à API da Render:', RENDER_API);
  } catch (error) {
    instance.defaults.baseURL = LOCAL_API;
    console.warn('API da Render não acessível, mudando para localhost:', LOCAL_API);
  }
}

verificarAPI();

export default instance;
