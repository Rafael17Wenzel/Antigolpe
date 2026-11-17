import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const questions = [
  {
    question: 'O Bradesco cobra alguma taxa para participação em processos seletivos?',
    answer:
      'Desconfie de pedidos de pagamento para inscrição, testes, exames ou treinamento. Confirme qualquer cobrança por canais oficiais e independentes antes de tomar qualquer decisão.',
  },
  {
    question: 'Como confirmar se o e-mail do recrutador é verdadeiro?',
    answer:
      'Verifique cuidadosamente o endereço completo do remetente e o domínio dos links. Um domínio aparentemente legítimo não basta para comprovar a identidade do remetente. Entre no portal oficial digitando o endereço por conta própria e confirme a oportunidade.',
  },
  {
    question: 'O que fazer ao identificar uma mensagem suspeita de contratação?',
    answer:
      'Não clique em links nem compartilhe senhas ou documentos. Guarde evidências sem interagir com o remetente e encaminhe a ocorrência a um canal oficial de segurança. O formulário desta demonstração não envia denúncias a nenhuma instituição.',
  },
];

export default function FAQ() {
  const [openItems, setOpenItems] = useState([]);

  function toggleItem(index) {
    setOpenItems((current) =>
      current.includes(index) ? current.filter((item) => item !== index) : [...current, index],
    );
  }

  return (
    <section id="faq" aria-labelledby="faq-titulo" className="mt-12 scroll-mt-28 border-t border-borda pt-8">
      <h2 id="faq-titulo" className="mb-2 text-xl font-bold text-texto">
        Dúvidas frequentes
      </h2>

      <p className="mb-6 text-sm text-texto-suave">Orientações para identificar e evitar possíveis golpes.</p>

      <div className="space-y-3">
        {questions.map((item, index) => {
          const isOpen = openItems.includes(index);
          const answerId = `faq-resposta-${index}`;

          return (
            <div key={item.question} className="overflow-hidden rounded-lg border border-borda-forte">
              <h3>
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={answerId}
                  onClick={() => toggleItem(index)}
                  className="flex min-h-alvo w-full items-center justify-between gap-4 bg-superficie-2 p-4 text-left text-sm font-semibold text-texto transition hover:bg-borda"
                >
                  <span>{item.question}</span>
                  <ChevronDown
                    size={18}
                    aria-hidden="true"
                    className={`shrink-0 text-texto-suave transition-transform ${isOpen ? 'rotate-180' : ''}`}
                  />
                </button>
              </h3>

              <div
                id={answerId}
                hidden={!isOpen}
                className="border-t border-borda bg-superficie p-4 text-sm leading-relaxed text-texto"
              >
                {item.answer}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
