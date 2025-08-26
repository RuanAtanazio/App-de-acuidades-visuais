
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useHistory, useI18n } from '../App';
import { generateAnamnesisPDF } from '../services/pdfService';

const HistoryPage: React.FC = () => {
    const { history } = useHistory();
    const { t } = useI18n();
    const navigate = useNavigate();

    return (
        <div className="p-4 sm:p-8">
            <h2 className="text-2xl font-bold text-primary mb-6">{t('history.pageTitle')}</h2>
            <div className="bg-surface rounded-lg shadow-lg">
                <div className="p-4">
                    {history.length === 0 ? (
                        <p className="text-center text-text-secondary py-8">{t('history.noEntries')}</p>
                    ) : (
                        <ul className="divide-y divide-gray-200">
                            {history.map(entry => (
                                <li key={entry.id} className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-gray-50">
                                    <div className="flex-1">
                                        <p className="font-semibold text-primary">{entry.nome}</p>
                                        <p className="text-sm text-text-secondary">{t('history.consultationOn')} {new Date(entry.data_consulta).toLocaleDateString()}</p>
                                    </div>
                                    <div className="flex gap-2 flex-shrink-0">
                                        <button onClick={() => navigate(`/anamnese/${entry.id}`)} className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold hover:bg-blue-200 transition-colors">{t('common.edit')}</button>
                                        <button onClick={() => generateAnamnesisPDF(entry, t)} className="bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-semibold hover:bg-green-200 transition-colors">{t('history.downloadPDF')}</button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                 <div className="p-4 border-t">
                    <button onClick={() => navigate('/anamnese')} className="w-full sm:w-auto bg-secondary text-white px-6 py-2 rounded-full font-semibold hover:bg-blue-600 transition-colors">
                        + {t('history.newEntry')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default HistoryPage;
