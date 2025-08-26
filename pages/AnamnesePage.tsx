import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useHistory, useI18n } from '../App';
import { generateAnamnesisPDF } from '../services/pdfService';
import { fetchAddressByCEP } from '../services/apiService';
import type { AnamnesisFormData } from '../types';

const initialFormData: AnamnesisFormData = {
    id: '', data_consulta: new Date().toISOString().split('T')[0], nome: '', endereco: '', complemento: '', idade: '', cep: '', bairro: '', municipio: '',
    telefone: '', celular: '', nascimento: '', exame_vista: 'Não', data_ultima: '', motivo: [], pessoal: [], familiar: [], cirurgia_olhos: '',
    ld_esf: '', ld_cil: '', ld_eixo: '', ld_avcc: '', ld_adicao: '', ld_avcc2: '',
    le_esf: '', le_cil: '', le_eixo: '', le_avcc: '', le_adicao: '', le_avcc2: '',
    ldp_esf: '', ldp_cil: '', ldp_eixo: '', ldp_avcc: '', ldp_adicao: '', ldp_avcc2: '',
    lep_esf: '', lep_cil: '', lep_eixo: '', lep_avcc: '', lep_adicao: '', lep_avcc2: '',
    av_ld_longe_1: '', av_ld_longe_2: '', av_le_longe_1: '', av_le_longe_2: '',
    av_ld_perto_1: '', av_ld_perto_2: '', av_le_perto_1: '', av_le_perto_2: '',
    observacao: '', decl_nome: '', decl_rg: '', assinatura: ''
};

const SectionHeader: React.FC<{title: string}> = ({ title }) => (
    <h3 className="bg-gray-200 text-gray-800 p-2 rounded-md font-semibold text-sm uppercase tracking-wider mt-6 mb-4">{title}</h3>
);

const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement> & {label: string}> = ({label, ...props}) => (
    <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
        <input {...props} className="w-full p-2 border-b-2 border-gray-300 bg-white text-text-primary focus:border-secondary outline-none text-sm" />
    </div>
);

const Checkbox: React.FC<React.InputHTMLAttributes<HTMLInputElement> & {label: string}> = ({label, ...props}) => (
    <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
        <input type="checkbox" {...props} className="h-4 w-4 rounded border-gray-300 text-secondary focus:ring-secondary"/>
        <span>{label}</span>
    </label>
);

const PrescriptionTable: React.FC<{ title: string, prefix: string, formData: AnamnesisFormData, onChange: any, t: any }> = ({ title, prefix, formData, onChange, t }) => (
    <div>
        <SectionHeader title={title} />
        <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-300 text-sm">
                <thead className="bg-gray-100">
                    <tr>
                        <th className="p-2 border"></th>
                        <th className="p-2 border">{t('anamnese.table.spherical')}</th>
                        <th className="p-2 border">{t('anamnese.table.cylindrical')}</th>
                        <th className="p-2 border">{t('anamnese.table.axis')}</th>
                        <th className="p-2 border">{t('anamnese.table.avcc')}</th>
                        <th className="p-2 border">{t('anamnese.table.addition')}</th>
                        <th className="p-2 border">{t('anamnese.table.avcc')}</th>
                    </tr>
                </thead>
                <tbody>
                    {[ {eye: t('anamnese.table.od'), p: `${prefix}d`}, {eye: t('anamnese.table.oe'), p: `${prefix}e`} ].map(({eye, p}) => (
                        <tr key={p}>
                            <td className="p-1 border font-semibold">{eye}</td>
                            <td className="p-1 border"><input type="text" name={`${p}_esf`} value={formData[`${p}_esf`]} onChange={onChange} className="w-full text-center p-1 border-transparent focus:border-secondary focus:ring-1 focus:ring-secondary outline-none"/></td>
                            <td className="p-1 border"><input type="text" name={`${p}_cil`} value={formData[`${p}_cil`]} onChange={onChange} className="w-full text-center p-1 border-transparent focus:border-secondary focus:ring-1 focus:ring-secondary outline-none"/></td>
                            <td className="p-1 border"><input type="text" name={`${p}_eixo`} value={formData[`${p}_eixo`]} onChange={onChange} className="w-full text-center p-1 border-transparent focus:border-secondary focus:ring-1 focus:ring-secondary outline-none"/></td>
                            <td className="p-1 border"><input type="text" name={`${p}_avcc`} value={formData[`${p}_avcc`]} onChange={onChange} className="w-full text-center p-1 border-transparent focus:border-secondary focus:ring-1 focus:ring-secondary outline-none"/></td>
                            <td className="p-1 border"><input type="text" name={`${p}_adicao`} value={formData[`${p}_adicao`]} onChange={onChange} className="w-full text-center p-1 border-transparent focus:border-secondary focus:ring-1 focus:ring-secondary outline-none"/></td>
                            <td className="p-1 border"><input type="text" name={`${p}_avcc2`} value={formData[`${p}_avcc2`]} onChange={onChange} className="w-full text-center p-1 border-transparent focus:border-secondary focus:ring-1 focus:ring-secondary outline-none"/></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);


const AnamnesePage: React.FC = () => {
    const { id } = useParams<{ id?: string }>();
    const navigate = useNavigate();
    const { history, addOrUpdateHistory } = useHistory();
    const { t } = useI18n();
    const [formData, setFormData] = useState<AnamnesisFormData>(initialFormData);
    const [loading, setLoading] = useState(false);
    
    useEffect(() => {
        if (id) {
            const existingEntry = history.find(item => item.id === id);
            if (existingEntry) {
                setFormData(existingEntry);
            }
        } else {
            const newEntry = { ...initialFormData, id: `anamnesis_${Date.now()}` };
            setFormData(newEntry);
        }
    }, [id, history]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox' && e.target instanceof HTMLInputElement) {
            const { checked } = e.target;
            setFormData(prev => {
                const currentValues = (prev[name] as string[]) || [];
                const newValues = checked 
                    ? [...currentValues, value] 
                    : currentValues.filter(v => v !== value);
                return { ...prev, [name]: newValues };
            });
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleCepBlur = useCallback(async () => {
        const address = await fetchAddressByCEP(formData.cep);
        if (address) {
            setFormData(prev => ({
                ...prev,
                endereco: address.endereco || prev.endereco,
                municipio: address.cidade ? `${address.cidade} - ${address.estado}` : prev.municipio,
                bairro: address.bairro || prev.bairro,
            }));
        }
    }, [formData.cep]);


    const handleSave = async () => {
        if (!formData.nome) {
            alert(t('anamnese.error.nameRequired'));
            return;
        }
        setLoading(true);
        try {
            const updatedFormData = {...formData};
            if (!id) { // set name for declaration only on first save
              updatedFormData.decl_nome = formData.nome;
            }
            setFormData(updatedFormData);
            await addOrUpdateHistory(updatedFormData);
            alert(t('anamnese.success.validated'));
        } catch (error) {
            console.error("Failed to save anamnesis:", error);
            alert("Error saving form.");
        } finally {
            setLoading(false);
        }
    };

    const handleSavePDF = async () => {
         if (!formData.nome) {
            alert(t('anamnese.error.nameRequired'));
            return;
        }
        setLoading(true);
        try {
            await addOrUpdateHistory(formData);
            generateAnamnesisPDF(formData, t);
            navigate('/history');
        } catch (error) {
            console.error("Failed to save before generating PDF:", error);
            alert("Error saving form before generating PDF.");
        } finally {
            setLoading(false);
        }
    }

    const motivoOptions = t('anamnese.motivos.options').split(',');
    const antecedentesOptions = t('anamnese.antecedentes.options').split(',');

    return (
        <div className="p-4 sm:p-8">
            <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-xl border">
                <header className="flex justify-between items-center border-b pb-4 mb-4">
                    <h2 className="text-xl font-bold text-gray-700">{t('anamnese.title')}</h2>
                    <Input label={t('anamnese.form.consultationDate')} name="data_consulta" type="date" value={formData.data_consulta} onChange={handleChange} />
                </header>

                <form>
                    <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
                        <div className="md:col-span-4"><Input label={t('anamnese.form.name')} name="nome" value={formData.nome} onChange={handleChange} /></div>
                        <div className="md:col-span-2"><Input label={t('anamnese.form.idade')} name="idade" type="number" value={formData.idade} onChange={handleChange} /></div>
                        <div className="md:col-span-3"><Input label={t('anamnese.form.address')} name="endereco" value={formData.endereco} onChange={handleChange} /></div>
                        <div className="md:col-span-3"><Input label={t('anamnese.form.complemento')} name="complemento" value={formData.complemento} onChange={handleChange} /></div>
                        <div className="md:col-span-2"><Input label={t('anamnese.form.cep')} name="cep" value={formData.cep} onChange={handleChange} onBlur={handleCepBlur} /></div>
                        <div className="md:col-span-2"><Input label={t('anamnese.form.bairro')} name="bairro" value={formData.bairro} onChange={handleChange} /></div>
                        <div className="md:col-span-2"><Input label={t('anamnese.form.municipio')} name="municipio" value={formData.municipio} onChange={handleChange} /></div>
                        <div className="md:col-span-2"><Input label={t('anamnese.form.phone')} name="telefone" value={formData.telefone} onChange={handleChange} /></div>
                        <div className="md:col-span-2"><Input label={t('anamnese.form.celular')} name="celular" value={formData.celular} onChange={handleChange} /></div>
                        <div className="md:col-span-2"><Input label={t('anamnese.form.birthDate')} name="nascimento" type="date" value={formData.nascimento} onChange={handleChange} /></div>
                    </div>
                    <div className="flex items-center gap-6 mt-4">
                        <label className="text-sm font-medium text-gray-600">{t('anamnese.form.hasExam')}</label>
                        <div className="flex gap-4">
                            <label className="flex items-center gap-1"><input type="radio" name="exame_vista" value="Sim" checked={formData.exame_vista === 'Sim'} onChange={handleChange} /> Sim</label>
                            <label className="flex items-center gap-1"><input type="radio" name="exame_vista" value="Não" checked={formData.exame_vista === 'Não'} onChange={handleChange} /> Não</label>
                        </div>
                        {formData.exame_vista === 'Sim' && <Input label={t('anamnese.form.lastConsultationDate')} name="data_ultima" type="date" value={formData.data_ultima} onChange={handleChange} />}
                    </div>
                    
                    <SectionHeader title={t('anamnese.motivoPrincipal')} />
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-2">
                        {motivoOptions.map(opt => <Checkbox key={opt} name="motivo" label={opt} value={opt} checked={(formData.motivo || []).includes(opt)} onChange={handleChange} />)}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
                        <div>
                            <SectionHeader title={t('anamnese.antecedentes.pessoal')} />
                            <div className="space-y-2">
                                {antecedentesOptions.map(opt => <Checkbox key={opt} name="pessoal" label={opt} value={opt} checked={(formData.pessoal || []).includes(opt)} onChange={handleChange} />)}
                            </div>
                            <div className="mt-4"><Input label={t('anamnese.form.eyeSurgery')} name="cirurgia_olhos" value={formData.cirurgia_olhos} onChange={handleChange} /></div>
                        </div>
                        <div>
                            <SectionHeader title={t('anamnese.antecedentes.familiar')} />
                            <div className="space-y-2">
                               {antecedentesOptions.slice(0, 4).map(opt => <Checkbox key={opt} name="familiar" label={opt} value={opt} checked={(formData.familiar || []).includes(opt)} onChange={handleChange} />)}
                            </div>
                        </div>
                    </div>

                    <PrescriptionTable title={t('anamnese.lensometria')} prefix="l" formData={formData} onChange={handleChange} t={t} />
                    <PrescriptionTable title={t('anamnese.prescricaoOptica')} prefix="lp" formData={formData} onChange={handleChange} t={t} />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
                        <div>
                            <SectionHeader title={t('anamnese.acuidadeVisual')} />
                            <div className="border p-2 rounded-md space-y-2">
                                <h4 className="font-semibold text-center bg-gray-100 p-1 rounded">{t('anamnese.acuidade.longe')}</h4>
                                <div className="flex gap-2 justify-around items-center">
                                    <span>OD</span> <input name="av_ld_longe_1" value={formData.av_ld_longe_1} onChange={handleChange} className="w-12 text-center border-b" /> / <input name="av_ld_longe_2" value={formData.av_ld_longe_2} onChange={handleChange} className="w-12 text-center border-b" />
                                    <span>OE</span> <input name="av_le_longe_1" value={formData.av_le_longe_1} onChange={handleChange} className="w-12 text-center border-b" /> / <input name="av_le_longe_2" value={formData.av_le_longe_2} onChange={handleChange} className="w-12 text-center border-b" />
                                </div>
                                <h4 className="font-semibold text-center bg-gray-100 p-1 rounded">{t('anamnese.acuidade.perto')}</h4>
                                <div className="flex gap-2 justify-around items-center">
                                    <span>OD</span> <input name="av_ld_perto_1" value={formData.av_ld_perto_1} onChange={handleChange} className="w-12 text-center border-b" /> / <input name="av_ld_perto_2" value={formData.av_ld_perto_2} onChange={handleChange} className="w-12 text-center border-b" />
                                    <span>OE</span> <input name="av_le_perto_1" value={formData.av_le_perto_1} onChange={handleChange} className="w-12 text-center border-b" /> / <input name="av_le_perto_2" value={formData.av_le_perto_2} onChange={handleChange} className="w-12 text-center border-b" />
                                </div>
                            </div>
                        </div>
                        <div>
                            <SectionHeader title={t('anamnese.observacoes')} />
                            <textarea name="observacao" value={formData.observacao} onChange={handleChange} rows={5} className="w-full p-2 border rounded-md"></textarea>
                        </div>
                    </div>

                    <SectionHeader title={t('anamnese.declaration.title')} />
                    <div className="border p-4 rounded-md text-sm text-gray-700">
                        <p>{t('anamnese.declaration.textStart')} <input name="decl_nome" value={formData.decl_nome} onChange={handleChange} className="border-b w-64" /> {t('anamnese.declaration.textMid')} <input name="decl_rg" value={formData.decl_rg} onChange={handleChange} className="border-b w-40" />, {t('anamnese.declaration.textEnd')}</p>
                        <div className="mt-8"><Input label={t('anamnese.declaration.signature')} name="assinatura" value={formData.assinatura} onChange={handleChange} /></div>
                    </div>

                    <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-end">
                        <button type="button" onClick={handleSave} disabled={loading} className="px-6 py-2 bg-secondary text-white rounded-md font-semibold hover:bg-blue-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed">
                            {loading ? t('anamnese.saving') : t('anamnese.validate')}
                        </button>
                        <button type="button" onClick={handleSavePDF} disabled={loading} className="px-6 py-2 bg-gray-600 text-white rounded-md font-semibold hover:bg-gray-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed">
                             {loading ? t('anamnese.saving') : t('anamnese.savePDF')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AnamnesePage;