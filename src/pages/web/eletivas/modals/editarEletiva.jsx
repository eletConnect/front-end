import React, { useState, useEffect } from 'react';
import axios from '../../../../configs/axios';
import showToast from '../../../../utills/toasts';

export default function ModalEditarEletiva({ codigo, instituicao }) {
    const [eletiva, setEletiva] = useState({
        nome: '',
        tipo: '',
        dia: '',
        horario: '',
        professor: '',
        sala: '',
        total_alunos: '',
        descricao: '',
        serie: '',
        turma: '',
        status: 'Ativo'
    });
    const [isExclusiva, setIsExclusiva] = useState(false);
    const [carregando, setCarregando] = useState(false);
    const [enviando, setEnviando] = useState(false);

    useEffect(() => {
        const mensagemSucesso = sessionStorage.getItem('mensagemSucesso');
        if (mensagemSucesso) {
            showToast('success', mensagemSucesso);
            sessionStorage.removeItem('mensagemSucesso');
        }

        if (codigo && instituicao) {
            buscarEletiva();
        }
    }, [codigo, instituicao]);

    const buscarEletiva = async () => {
        setCarregando(true);
        try {
            const response = await axios.post('/eletivas/buscar', { codigo, instituicao });
            if (response.status === 200 && response.data.length > 0) {
                const dadosEletiva = response.data[0];
                setEletiva({
                    nome: dadosEletiva.nome || '',
                    tipo: dadosEletiva.tipo || '',
                    dia: dadosEletiva.dia || '',
                    horario: dadosEletiva.horario || '',
                    professor: dadosEletiva.professor || '',
                    sala: dadosEletiva.sala || '',
                    total_alunos: dadosEletiva.total_alunos || '',
                    descricao: dadosEletiva.descricao || '',
                    serie: dadosEletiva.serie || '',
                    turma: dadosEletiva.turma || '',
                    status: dadosEletiva.status || 'Ativo'
                });
                setIsExclusiva(!!dadosEletiva.serie);
            }
        } catch (error) {
            showToast('danger', error.response?.data?.mensagem || 'Erro ao buscar dados da eletiva.');
        } finally {
            setCarregando(false);
        }
    };

    const editarEletiva = async (e) => {
        e.preventDefault();
        setEnviando(true);

        try {
            const response = await axios.post('/eletivas/editar', {
                codigo,
                instituicao,
                ...eletiva,
                total_alunos: parseInt(eletiva.total_alunos, 10),
                serie: isExclusiva ? eletiva.serie : null,
                turma: isExclusiva ? eletiva.turma : null,
                exclusiva: isExclusiva
            });

            if (response.status === 200) {
                sessionStorage.setItem('mensagemSucesso', 'Eletiva atualizada com sucesso.');
                window.location.reload();
            }
        } catch (error) {
            showToast('danger', error.response?.data?.mensagem || 'Erro ao editar a eletiva.');
        } finally {
            setEnviando(false);
        }
    };

    const handleChange = (e) => {
        const { id, value } = e.target;
        setEletiva((prevEletiva) => ({
            ...prevEletiva,
            [id]: id === 'total_alunos' ? parseInt(value, 10) : value
        }));
    };

    return (
        <div className="modal fade" id="editarEletiva" tabIndex="-1" aria-labelledby="editarEletivaLabel" aria-hidden="true">
            <div className="modal-dialog modal-lg">
                <div className="modal-content">
                    <div className="modal-header">
                        <div className="d-flex align-items-center gap-2">
                            <i className="bi bi-journal-bookmark-fill fs-3"></i>
                            <h4 className="m-0 fs-4">Eletivas</h4>
                            <i className="bi bi-arrow-right-short fs-4"></i>
                            <h5 className="m-0">Editar</h5>
                        </div>
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <form onSubmit={editarEletiva}>
                        <div className="modal-body">
                            <div className="row g-3">
                                <InputField
                                    id="nome"
                                    label="Nome da Eletiva"
                                    value={eletiva.nome}
                                    onChange={handleChange}
                                    required
                                    maxLength="76"
                                    pattern="[A-Za-zÀ-ÿ\s]+"
                                    feedback="O nome não pode ultrapassar 75 caracteres."
                                />
                                <RadioGroup
                                    id="tipo"
                                    label="Tipo"
                                    value={eletiva.tipo}
                                    onChange={handleChange}
                                    options={['Eletiva', 'Projeto de Vida', 'Trilha']}
                                    required
                                />
                                <SelectField
                                    id="dia"
                                    label="Dia da Semana"
                                    value={eletiva.dia}
                                    onChange={handleChange}
                                    required
                                    options={['Terça-feira', 'Quinta-feira', 'Terça-feira e Quinta-feira']}
                                />
                                <SelectField
                                    id="horario"
                                    label="Horário"
                                    value={eletiva.horario}
                                    onChange={handleChange}
                                    required
                                    options={['1º e 2º horário', '3º e 4º horário', '5º e 6º horário']}
                                />
                                <InputField
                                    id="professor"
                                    label="Professor"
                                    value={eletiva.professor}
                                    onChange={handleChange}
                                    required
                                    maxLength="51"
                                    pattern="[A-Za-zÀ-ÿ\s]+"
                                    feedback="O nome do professor não pode ultrapassar 50 caracteres."
                                />
                                <InputField
                                    id="sala"
                                    label="Sala"
                                    value={eletiva.sala}
                                    onChange={handleChange}
                                    required
                                    maxLength="11"
                                    pattern="[A-Za-z0-9\s]+"
                                    feedback="A sala não pode ultrapassar 10 caracteres."
                                />
                                <InputField
                                    id="total_alunos"
                                    label="Total de Alunos"
                                    value={eletiva.total_alunos}
                                    onChange={handleChange}
                                    required
                                    type="number"
                                    min="1"
                                    max="101"
                                    feedback="O total de alunos deve estar entre 1 e 100."
                                />
                                <TextareaField
                                    id="descricao"
                                    label="Descrição"
                                    value={eletiva.descricao}
                                    onChange={handleChange}
                                    maxLength="500"
                                    rows="3"
                                    feedback="A descrição não pode ultrapassar 500 caracteres."
                                />
                                <SwitchField
                                    id="exclusivaSwitch"
                                    label="Exclusiva para uma turma?"
                                    checked={isExclusiva}
                                    onChange={(e) => setIsExclusiva(e.target.checked)}
                                />
                                {isExclusiva && (
                                    <>
                                        <SelectField
                                            id="serie"
                                            label="Série"
                                            value={eletiva.serie}
                                            onChange={handleChange}
                                            required
                                            options={['1º ano', '2º ano', '3º ano', '4º ano']}
                                        />
                                        <SelectField
                                            id="turma"
                                            label="Turma"
                                            value={eletiva.turma}
                                            onChange={handleChange}
                                            required
                                            options={Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i))}
                                        />
                                    </>
                                )}
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                            <button type="submit" className="btn btn-success" disabled={enviando || carregando}>
                                {enviando ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                        Editando...
                                    </>
                                ) : (
                                    <>
                                        <i className="bi bi-pencil-fill"></i>&ensp;Editar
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

function InputField({ id, label, feedback, ...props }) {
    return (
        <div className="col-md-6">
            <label htmlFor={id} className="form-label">{label} <span className="text-danger">*</span></label>
            <input id={id} className="form-control" {...props} />
            {props.value.length > props.maxLength && (
                <div className="text-danger mt-1">
                    <small>{feedback}</small>
                </div>
            )}
        </div>
    );
}

function SelectField({ id, label, options, ...props }) {
    return (
        <div className="col-md-6">
            <label htmlFor={id} className="form-label">{label} <span className="text-danger">*</span></label>
            <select id={id} className="form-select" {...props}>
                <option value="">Selecione...</option>
                {options.map((option, idx) => (
                    <option key={idx} value={option}>{option}</option>
                ))}
            </select>
        </div>
    );
}

function RadioGroup({ id, label, options, onChange, value, required }) {
    return (
        <div className="col-md-6">
            <label className="form-label">{label} <span className="text-danger">*</span></label>
            <div className="d-flex justify-content-between">
                {options.map((option, idx) => (
                    <div className="form-check" key={idx}>
                        <input
                            className="form-check-input"
                            type="radio"
                            id={`${id}_${option}`}
                            name={id}
                            value={option}
                            checked={value === option}
                            onChange={onChange}
                            required={required}
                        />
                        <label className="form-check-label" htmlFor={`${id}_${option}`}>{option}</label>
                    </div>
                ))}
            </div>
        </div>
    );
}

function TextareaField({ id, label, feedback, ...props }) {
    return (
        <div className="col-md-12">
            <label htmlFor={id} className="form-label">{label}</label>
            <textarea id={id} className="form-control" {...props} />
            {props.value.length > props.maxLength && (
                <div className="text-danger mt-1">
                    <small>{feedback}</small>
                </div>
            )}
        </div>
    );
}

function SwitchField({ id, label, checked, onChange }) {
    return (
        <div className="col-md-12">
            <div className="form-check form-switch">
                <input className="form-check-input" type="checkbox" id={id} checked={checked} onChange={onChange} />
                <label className="form-check-label" htmlFor={id}>{label}</label>
            </div>
        </div>
    );
}
