
<<<<<<< HEAD

export interface User {
  email: string;
  name?: string;
  role?: 'user' | 'admin';
  password?: string; // Added for explicit type safety
  [key: string]: any; // Keep for other registration fields
=======
export interface User {
  email: string;
  name?: string;
>>>>>>> 55c9eae83c5b5087bd5334a8c2bd725e8a8a5db7
}

export interface AppSettings {
  language: 'pt' | 'en' | 'es';
  screenSize: number;
  userDistance: number;
}

export interface AnamnesisFormData {
  id: string;
  data_consulta: string;
  nome: string;
  endereco: string;
  complemento: string;
  idade: string;
  cep: string;
  bairro: string;
  municipio: string;
  telefone: string;
  celular: string;
  nascimento: string;
  exame_vista: 'Sim' | 'Não';
  data_ultima: string;
  motivo: string[];
  pessoal: string[];
  familiar: string[];
  cirurgia_olhos: string;
  ld_esf: string;
  ld_cil: string;
  ld_eixo: string;
  ld_avcc: string;
  ld_adicao: string;
  ld_avcc2: string;
  le_esf: string;
  le_cil: string;
  le_eixo: string;
  le_avcc: string;
  le_adicao: string;
  le_avcc2: string;
  ldp_esf: string;
  ldp_cil: string;
  ldp_eixo: string;
  ldp_avcc: string;
  ldp_adicao: string;
  ldp_avcc2: string;
  lep_esf: string;
  lep_cil: string;
  lep_eixo: string;
  lep_avcc: string;
  lep_adicao: string;
  lep_avcc2: string;
  av_ld_longe_1: string;
  av_ld_longe_2: string;
  av_le_longe_1: string;
  av_le_longe_2: string;
  av_ld_perto_1: string;
  av_ld_perto_2: string;
  av_le_perto_1: string;
  av_le_perto_2: string;
  observacao: string;
  decl_nome: string;
  decl_rg: string;
  assinatura: string;
  [key: string]: any; // For flexible indexing
}


export interface Video {
  id: string;
  name: string;
  url: string;
}

<<<<<<< HEAD
export type CalculatorType = 'traumaOcular' | 'dryEye' | 'astigmatismo' | 'presbiopia' | 'refração' | 'vertex';

export interface SignInLog {
    email: string;
    location: string;
    timestamp: string;
}
=======
export type CalculatorType = 'traumaOcular' | 'dryEye' | 'astigmatismo' | 'presbiopia' | 'refração' | 'vertex';
>>>>>>> 55c9eae83c5b5087bd5334a8c2bd725e8a8a5db7
