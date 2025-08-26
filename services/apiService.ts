
export const fetchAddressByCEP = async (cep: string) => {
  const cleanedCep = cep.replace(/\D/g, '');
  if (cleanedCep.length !== 8) {
    return null;
  }
  try {
    const response = await fetch(`https://viacep.com.br/ws/${cleanedCep}/json/`);
    if (!response.ok) {
      throw new Error('Failed to fetch CEP');
    }
    const data = await response.json();
    if (data.erro) {
      return null;
    }
    return {
      endereco: data.logradouro,
      cidade: data.localidade,
      estado: data.uf,
      bairro: data.bairro
    };
  } catch (error) {
    console.error("Error fetching address by CEP:", error);
    return null;
  }
};
