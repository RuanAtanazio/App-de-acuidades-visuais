
const calculateCheckDigit = (baseDigits: number[]): number => {
    let sum = 0;
    let multiplier = baseDigits.length + 1;
    for (const digit of baseDigits) {
        sum += digit * multiplier;
        multiplier--;
    }
    const remainder = sum % 11;
    return remainder < 2 ? 0 : 11 - remainder;
};

export const validateCPF = (cpf: string): boolean => {
    const cleaned = cpf.replace(/\D/g, '');
    if (cleaned.length !== 11 || /^(\d)\1+$/.test(cleaned)) {
        return false;
    }

    const digits = cleaned.split('').map(d => parseInt(d));
    const firstNine = digits.slice(0, 9);
    const firstCheckDigit = calculateCheckDigit(firstNine);
    if (firstCheckDigit !== digits[9]) {
        return false;
    }

    const firstTen = digits.slice(0, 10);
    const secondCheckDigit = calculateCheckDigit(firstTen);
    return secondCheckDigit === digits[10];
};

export const validateCNPJ = (cnpj: string): boolean => {
    const cleaned = cnpj.replace(/\D/g, '');
    if (cleaned.length !== 14 || /^(\d)\1+$/.test(cleaned)) {
        return false;
    }

    const digits = cleaned.split('').map(d => parseInt(d));
    const firstTwelve = digits.slice(0, 12);

    const calculateCnpjDigit = (baseDigits: number[]): number => {
        const sequence = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
        if (baseDigits.length === 13) {
            sequence.unshift(6);
        }
        
        let sum = 0;
        for (let i = 0; i < baseDigits.length; i++) {
            sum += baseDigits[i] * sequence[i];
        }
        
        const remainder = sum % 11;
        return remainder < 2 ? 0 : 11 - remainder;
    };

    const firstCheckDigit = calculateCnpjDigit(firstTwelve);
    if (firstCheckDigit !== digits[12]) {
        return false;
    }

    const firstThirteen = digits.slice(0, 13);
    const secondCheckDigit = calculateCnpjDigit(firstThirteen);
    return secondCheckDigit === digits[13];
};
