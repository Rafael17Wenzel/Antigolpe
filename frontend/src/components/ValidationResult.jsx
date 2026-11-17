import { BadgeCheck, FileCheck2, Info, Send, TriangleAlert } from 'lucide-react';

function Linha({ termo, valor }) {
  if (!valor) return null;
  return (
    <div className="flex justify-between gap-3">
      <dt className="font-semibold">{termo}</dt>
      <dd className="text-right">{valor}</dd>
    </div>
  );
}

/**
 * Resultado da consulta. "CONFIRMADO" significa correspondência no cadastro,
 * nunca autenticidade garantida; "NAO_CONFIRMADO" nunca é apresentado como golpe.
 */
export default function ValidationResult({ result, onDenunciar, headingRef }) {
  if (!result) {
    return (
      <div className="contorno-ac flex h-full min-h-[220px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-borda p-6 text-center">
        <FileCheck2 size={36} aria-hidden="true" className="mb-3 text-texto-suave" />
        <p className="text-sm font-semibold text-texto">Nenhuma consulta ainda</p>
        <p className="mt-1 text-xs text-texto-suave">
          O resultado da validação aparecerá aqui.
        </p>
      </div>
    );
  }

  if (result.status === 'CONFIRMADO') {
    const { vaga } = result;
    const local = [vaga?.cidade, vaga?.uf].filter(Boolean).join(' / ');

    return (
      <article className="contorno-ac h-full rounded-xl border border-sucesso-borda bg-sucesso-fundo p-5">
        <div className="mb-3 flex items-center gap-2 text-sucesso-texto">
          <BadgeCheck size={26} aria-hidden="true" />
          <h3 ref={headingRef} tabIndex={-1} className="text-base font-bold outline-none">
            Token encontrado no cadastro
          </h3>
        </div>
        <p className="text-sm leading-relaxed text-sucesso-texto">{result.mensagem}</p>
        <dl className="mt-4 space-y-2 border-t border-sucesso-borda pt-4 text-xs text-sucesso-texto">
          <Linha termo="Cargo" valor={vaga?.cargo} />
          <Linha termo="Região" valor={local} />
          <Linha termo="Fonte cadastrada" valor={vaga?.fonteCadastrada} />
        </dl>
        <p className="mt-4 flex items-start gap-1.5 text-[11px] text-sucesso-texto">
          <Info size={14} aria-hidden="true" className="mt-0.5 shrink-0" />
          Cautela: confirme também o remetente e nunca pague taxas nem informe senhas.
        </p>
      </article>
    );
  }

  return (
    <article className="contorno-ac h-full rounded-xl border border-alerta-borda bg-alerta-fundo p-5">
      <div className="mb-3 flex items-center gap-2 text-alerta-texto">
        <TriangleAlert size={26} aria-hidden="true" />
        <h3 ref={headingRef} tabIndex={-1} className="text-base font-bold outline-none">
          Oferta não confirmada
        </h3>
      </div>
      <p className="text-sm leading-relaxed text-alerta-texto">{result.mensagem}</p>
      <ul className="mt-4 list-disc space-y-1 border-t border-alerta-borda pt-4 pl-4 text-xs text-alerta-texto">
        <li>Não clique em links nem envie documentos ou dados bancários.</li>
        <li>Procure a vaga no site oficial, digitando o endereço você mesmo.</li>
        <li>Guarde a mensagem como evidência.</li>
      </ul>
      <button
        type="button"
        onClick={onDenunciar}
        className="mt-4 inline-flex min-h-[32px] items-center gap-1.5 text-sm font-bold text-primaria hover:underline"
      >
        <Send size={14} aria-hidden="true" />
        Denunciar (opcional)
      </button>
    </article>
  );
}
