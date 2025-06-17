import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// Carrega a chave de API da variável de ambiente.
// Certifique-se de que GEMINI_API_KEY está definida no seu arquivo .env (ou .env.local)
const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

if (!apiKey) {
  console.warn(
    'AVISO: Chave de API do Gemini (GEMINI_API_KEY ou GOOGLE_API_KEY) não encontrada nas variáveis de ambiente. ' +
    'O Genkit tentará usar configurações padrão, mas pode falhar ao acessar os serviços do Google AI. ' +
    'Certifique-se de que a chave está corretamente configurada no seu arquivo .env ou .env.local e que o servidor foi reiniciado.'
  );
}

export const ai = genkit({
  plugins: [googleAI(apiKey ? {apiKey} : undefined)],
  model: 'googleai/gemini-2.0-flash',
});
