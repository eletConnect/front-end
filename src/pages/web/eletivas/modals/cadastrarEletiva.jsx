import React, { useState } from 'react';
import showToast from '../../../../utills/toasts';
import axios from '../../../../configs/axios';

const INITIAL_STATE = {
    nome: '',
    tipo: '',
    dia: '',
    horario: '',
    professor: '',
    sala: '',
    totalAlunos: '',
    serie: '',
    turma: '',
    isExclusiva: false,
};

export default function ModalCadastrarEletiva({ usuario }) {
    const [eletiva, setEletiva] = useState(INITIAL_STATE);
    const [enviando, setEnviando] = useState(false);

    const handleChange = ({ target: { name, value, type, checked } }) => {
        setEletiva(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : type === 'number' ? Number(value) : value,
        }));
    };

    const cadastrarEletiva = async (e) => {
        e.preventDefault();
        setEnviando(true);

        try {
            const resposta = await axios.post('/eletivas/cadastrar', {
                ...eletiva,
                instituicao: usuario.instituicao,
                status: 'Ativo',
                serie: eletiva.isExclusiva ? eletiva.serie : null,
                turma: eletiva.isExclusiva ? eletiva.turma : null,
            });
            if (resposta.status === 201) {
                sessionStorage.setItem('mensagemSucesso', resposta.data.mensagem);
                window.location.reload();
            }
        } catch (erro) {
            showToast('danger', erro.response?.data.mensagem || 'Erro ao cadastrar a eletiva');
        } finally {
            setEnviando(false);
        }
    };

    return (
        <div className="modal fade" id="cadastrarEletiva" tabIndex="-1" aria-labelledby="cadastrarEletivaLabel" aria-hidden="true">
            <div className="modal-dialog modal-lg">
                <div className="modal-content">
                    <div className="modal-header">
                        <h4 className='modal-title fs-4 d-flex align-items-center gap-2'>
                            <i className="bi bi-journal-bookmark-fill fs-3"></i> Eletivas
                            <i className="bi bi-arrow-right-short fs-4"></i> Cadastrar
                        </h4>
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <form onSubmit={cadastrarEletiva}>
                        <div className="modal-body">
                            <div className="row g-3">
                                <InputField size="6" name="nome" label="Nome da Eletiva" value={eletiva.nome} onChange={handleChange} required pattern="[A-Za-zÀ-ÿ\s]+" maxLength="75" feedback="O nome não pode ultrapassar 75 caracteres." />
                                <RadioGroup name="tipo" label="Tipo" value={eletiva.tipo} onChange={handleChange} options={['Eletiva', 'Projeto de Vida', 'Trilha']} required />
                                <SelectField name="dia" label="Dia da semana" value={eletiva.dia} onChange={handleChange} required options={['Terça-feira', 'Quinta-feira', 'Terça-feira e Quinta-feira']} />
                                <SelectField name="horario" label="Horário" value={eletiva.horario} onChange={handleChange} required options={['1º e 2º horário', '3º e 4º horário', '5º e 6º horário']} />
                                <InputField size="6" name="professor" label="Professor" value={eletiva.professor} onChange={handleChange} required pattern="[A-Za-zÀ-ÿ\s]+" maxLength="50" feedback="O nome do professor não pode ultrapassar 50 caracteres." />
                                <InputField size="3" name="sala" label="Sala" value={eletiva.sala} onChange={handleChange} required pattern="[A-Za-z0-9\s]+" maxLength="10" feedback="A sala não pode ultrapassar 10 caracteres." />
                                <InputField size="3" name="totalAlunos" label="Total de Alunos" value={eletiva.totalAlunos} onChange={handleChange} required type="number" min="1" max="100" feedback="O total de alunos deve estar entre 1 e 100." />
                                <SwitchField name="isExclusiva" label="Exclusiva para uma turma?" checked={eletiva.isExclusiva} onChange={handleChange} />
                                {eletiva.isExclusiva && (
                                    <>
                                        <SelectField name="serie" label="Série" value={eletiva.serie} onChange={handleChange} required options={['1º ano', '2º ano', '3º ano']} />
                                        <SelectField name="turma" label="Turma" value={eletiva.turma} onChange={handleChange} required options={Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i))} />
                                    </>
                                )}
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                            <button type="submit" className="btn btn-primary" disabled={enviando}>
                                {enviando ? (<span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>) : (<><i className="bi bi-clipboard-plus"></i>&ensp;Cadastrar</>)}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

function InputField({ name, label, feedback, size, ...props }) {
    return (
        <div className={`col-md-${size}`}>
            <label htmlFor={name} className="form-label">{label} <span className="text-danger">*</span></label>
            <input name={name} id={name} className="form-control" {...props} />
            {props.value && props.value.length > props.maxLength && (
                <div className="text-danger mt-1">
                    <small>{feedback}</small>
                </div>
            )}
        </div>
    );
}

function SelectField({ name, label, options, ...props }) {
    return (
        <div className="col-md-6">
            <label htmlFor={name} className="form-label">{label} <span className="text-danger">*</span></label>
            <select name={name} id={name} className="form-select" {...props}>
                <option value="">Selecione...</option>
                {options.map((option, idx) => (
                    <option key={idx} value={option}>{option}</option>
                ))}
            </select>
        </div>
    );
}

function RadioGroup({ name, label, options, onChange, value, required }) {
    return (
        <div className="col-md-6">
            <label className="form-label">{label} <span className="text-danger">*</span></label>
            <div className="d-flex justify-content-between">
                {options.map((option, idx) => (
                    <div className="form-check" key={idx}>
                        <input className="form-check-input" type="radio" id={`${name}_${option}`} name={name} value={option} checked={value === option} onChange={onChange} required={required} />
                        <label className="form-check-label" htmlFor={`${name}_${option}`}>{option}</label>
                    </div>
                ))}
            </div>
        </div>
    );
}

function SwitchField({ name, label, checked, onChange }) {
    return (
        <div className="col-md-12">
            <div className="form-check form-switch">
                <input className="form-check-input" type="checkbox" id={name} name={name} checked={checked} onChange={onChange} />
                <label className="form-check-label" htmlFor={name}>{label}</label>
            </div>
        </div>
    );
}
