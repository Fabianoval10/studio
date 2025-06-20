
import { config } from 'dotenv';
config();

import '@/ai/flows/initial-report-template.ts';
import '@/ai/flows/generate-report.ts';
// Removida a importação de extract-image-measurements.ts
