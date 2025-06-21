
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// Log para verificar se as variáveis de ambiente estão sendo lidas
const geminiApiKeyFromEnv = process.env.GEMINI_API_KEY;
const googleApiKeyFromEnv = process.env.GOOGLE_API_KEY;

console.log(`[genkit.ts] Valor de process.env.GEMINI_API_KEY: ${geminiApiKeyFromEnv ? geminiApiKeyFromEnv.substring(0,5) + '...' : 'NÃO DEFINIDA'}`);
console.log(`[genkit.ts] Valor de process.env.GOOGLE_API_KEY: ${googleApiKeyFromEnv ? googleApiKeyFromEnv.substring(0,5) + '...' : 'NÃO DEFINIDA'}`);

const apiKey = geminiApiKeyFromEnv || googleApiKeyFromEnv;

if (!apiKey) {
  console.error( // Mudado para console.error para maior destaque
    'ERRO CRÍTICO EM src/ai/genkit.ts: Chave de API do Gemini (GEMINI_API_KEY ou GOOGLE_API_KEY) não encontrada nas variáveis de ambiente. ' +
    'O Genkit NÃO FUNCIONARÁ sem uma chave de API válida. ' +
    '1. Verifique se você tem um arquivo .env na raiz do projeto. ' +
    '2. Certifique-se de que o arquivo .env contém a linha: GEMINI_API_KEY=SUA_CHAVE_REAL_AQUI (substitua pela sua chave). ' +
    '3. IMPORTANTE: Reinicie o servidor de desenvolvimento do Next.js (pare com Ctrl+C e rode npm run dev novamente) após adicionar/modificar o .env.'
  );
} else {
  console.log('[genkit.ts] Chave de API detectada e será usada para configurar o plugin GoogleAI: ' + apiKey.substring(0,5) + '...');
}

export const ai = genkit({
  plugins: [
    // Passa a chave explicitamente para o plugin se encontrada.
    // Se apiKey for undefined aqui, o plugin googleAI() ainda tentará procurar
    // GEMINI_API_KEY ou GOOGLE_API_KEY no ambiente por si só.
    googleAI(apiKey ? { apiKey } : undefined) 
  ],
});
