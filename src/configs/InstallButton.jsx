import React, { useState, useEffect } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';

function BotaoInstalacao() {
  const [eventoInstalacao, setEventoInstalacao] = useState(null);
  const [statusAtualizacao, setStatusAtualizacao] = useState({ offlinePronto: false, precisaAtualizar: false });

  const { atualizarServiceWorker } = useRegisterSW({
    onNeedRefresh: () => setStatusAtualizacao({ ...statusAtualizacao, precisaAtualizar: true }),
    onOfflineReady: () => setStatusAtualizacao({ ...statusAtualizacao, offlinePronto: true }),
  });

  useEffect(() => {
    const prepararInstalacao = (evento) => {
      evento.preventDefault();
      setEventoInstalacao(evento);
    };

    window.addEventListener('beforeinstallprompt', prepararInstalacao);
    return () => window.removeEventListener('beforeinstallprompt', prepararInstalacao);
  }, []);

  const realizarInstalacao = () => {
    if (eventoInstalacao) {
      eventoInstalacao.prompt();
      eventoInstalacao.userChoice.finally(() => setEventoInstalacao(null));
    }
  };

  return (
    <div className="AlertaPWA">
      {eventoInstalacao && (
        <button className="btn" onClick={realizarInstalacao}>
          <i className="bi bi-download"></i> Instalar Aplicativo
        </button>
      )}

      {(statusAtualizacao.offlinePronto || statusAtualizacao.precisaAtualizar) && (
        <div className="AlertaPWA-toast" role="alert">
          <span>
            {statusAtualizacao.offlinePronto 
              ? 'Aplicativo pronto para funcionar offline.' 
              : 'Novo conteúdo disponível.'}
          </span>
          <div>
            {statusAtualizacao.precisaAtualizar && (
              <button onClick={() => atualizarServiceWorker(true)}>Recarregar</button>
            )}
            <button onClick={() => setStatusAtualizacao({ offlinePronto: false, precisaAtualizar: false })}>Fechar</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default BotaoInstalacao;
