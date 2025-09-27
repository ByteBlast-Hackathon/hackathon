export interface ContextSection {
  id: string;
  title: string;
  content: string;
  actors?: string[];
  documents?: string[];
  timeEstimate?: string;
  decisionPoints?: string[];
  faqs?: { q: string; a: string }[];
}

export const HealthContext: { sections: ContextSection[] } = {
  sections: [
    {
      id: 'troca_titularidade',
      title: 'Troca de Titularidade (Solicitação presencial / on-site)',
      content:
`Resumo: Beneficiário solicita troca de titularidade. Atendimento solicita documentação, imprime/assina documentos padrão, tira cópias, registra atendimento, entrega protocolo, registra em planilha e leva documentos ao cadastro. Se documentos estiverem incompletos, solicita correção ao cliente; se corretos, prossegue para finalizar protocolo.

Fluxo chave: solicitação -> coleta de documentos -> assinatura (se necessário ambos titulares) -> cópia -> registro ERP/planilha -> protocolo -> envio ao cadastro -> verificação -> notificação ao cliente.

Observações operacionais: processo geralmente presencial; quando ambos titulares vivos, é necessária assinatura de ambos; há registro em planilha e protocolo físico (rotina diária).

Atores: Atendimento, Cliente/Beneficiário, Cadastro.
`,
      actors: ['Atendimento', 'Cliente/Beneficiário', 'Cadastro'],
      documents: [
        'RG e CPF do titular',
        'Comprovante de endereço',
        'Certidão de óbito (se aplicável)',
        'Comprovante de vínculo (matrícula/frequência) quando exigido',
      ],
      timeEstimate: 'Atendimento: 3–10 min por etapa; protocolo/impressão: diário',
      decisionPoints: [
        'Assinatura de ambos os titulares necessária?',
        'Documentos corretos para seguir ao cadastro?'
      ],
      faqs: [
        {
          q: 'Quais documentos preciso levar para troca de titularidade?',
          a: 'RG, CPF, comprovante de endereço e qualquer documento específico solicitado (ex.: certidão de óbito). Se houver dois titulares vivos, ambos devem assinar.'
        },
        {
          q: 'O processo pode ser feito online?',
          a: 'Pelo fluxo do documento, a troca de titularidade é realizada presencialmente.'
        }
      ]
    },

    {
      id: 'solicitacao_autorizacao',
      title: 'Solicitação de Autorização / Segunda via de guia',
      content:
`Resumo: Beneficiário solicita autorização ou guia. O atendimento registra a solicitação no CRM/ERP com dados do beneficiário, médico solicitante e código do procedimento. Se houver auditoria, processo segue para auditoria; se não, verifica cobertura; informa beneficiário sobre aprovação/negativa e gera protocolo/guia.

Fluxo chave: entrada via WhatsApp/presencial -> fornecer informações necessárias -> registrar atendimento -> auditoria? -> se aprovado, enviar guia/protocolo -> informar beneficiário. Se negativo, informar motivo e orientar próximos passos.

Atores: Beneficiário, Atendimento, Auditoria (quando aplicável).
`,
      actors: ['Beneficiário', 'Atendimento', 'Auditoria'],
      documents: [
        'Nome completo, data de nascimento do beneficiário',
        'Foto do pedido médico (quando aplicável)',
        'Código do procedimento/motivo médico'
      ],
      timeEstimate: 'Registro: ~3 min; verificação/auditoria: variável (pode levar dias conforme procedimento)',
      decisionPoints: [
        'Necessita de auditoria clínica?',
        'Procedimento tem cobertura pelo plano?'
      ],
      faqs: [
        {
          q: 'Quanto tempo para autorizar um procedimento?',
          a: 'Depende: o registro leva minutos, mas se houver auditoria pode levar mais — consulte o atendimento para prazo específico.'
        },
        {
          q: 'Como envio o pedido médico?',
          a: 'Via texto, anexo de foto do pedido médico ou pelo aplicativo/site conforme instruções do atendimento.'
        }
      ]
    },

    {
      id: 'segunda_via_boleto',
      title: 'Segunda Via de Boleto / Emissão de Guia de Pagamento',
      content:
`Resumo: Beneficiário acessa plataforma (app/site) para segunda via ou solicita via atendimento. Pelo site/app: login -> menu financeiro -> selecionar competência -> gerar segunda via. Via atendimento: registrar solicitação, identificar fatura atual/futura, emitir/encaminhar boleto por e-mail ou disponibilizar impressão.

Fluxo chave: plataforma self-service ou atendimento humano -> seleção da competência/fatura -> geração da segunda via -> envio/impresso.

Atores: Beneficiário (autoatendimento), Atendimento (suporte).
`,
      actors: ['Beneficiário', 'Atendimento'],
      documents: ['Dados para login ou CPF do titular para atendimento'],
      timeEstimate: 'Autoatendimento: ~1 min; atendimento humano: 1–3 min',
      decisionPoints: [
        'É fatura atual ou futura? (impacta forma de desconto e necessidade de ação financeira)'
      ],
      faqs: [
        {
          q: 'Posso emitir a 2ª via pelo app?',
          a: 'Sim — entre no app/site, vá em financeiro, selecione a competência e gere a segunda via.'
        },
        {
          q: 'Não recebi o boleto por e-mail, o que faço?',
          a: 'Solicite a reemissão pelo atendimento informando CPF e competência; eles podem reenviar por e-mail ou disponibilizar impressão.'
        }
      ]
    },

    {
      id: 'plano_maioridade',
      title: 'Plano por Maioridade (Transferência/alteração quando o beneficiário atinge maioridade)',
      content:
`Resumo: Fluxo relativo a tratamento de beneficiários que atingem maioridade / mudança de condição contratual. Geralmente inclui verificação de data de nascimento, comunicação ao beneficiário e atualização cadastral / alteração de vínculo.

Fluxo chave: detecção da maioridade -> notificação/contato -> instruções sobre mudança de plano/opções -> atualização de cadastro se requerido.

Atores: Atendimento, Beneficiário, Cadastro.
`,
      actors: ['Atendimento', 'Beneficiário', 'Cadastro'],
      documents: ['Documento de identidade com data de nascimento'],
      timeEstimate: 'Verificação e atualização: minutos (dependendo de documentação)',
      decisionPoints: [
        'Beneficiário confirma mudança/aceita condições do novo plano?'
      ],
      faqs: [
        {
          q: 'O que acontece quando meu dependente faz 18 anos?',
          a: 'O atendimento verificará regras do contrato; você será orientado sobre opções e eventuais alterações no vínculo ou necessidade de migração para outro plano.'
        }
      ]
    },

    {
      id: 'cobranca_indevida',
      title: 'Cobrança Indevida / Contestação de Fatura',
      content:
`Resumo: Beneficiário entra em contato informando cobrança indevida. Atendimento solicita dados da cobrança (boleto e qual procedimento), registra atendimento, fornece protocolo ao paciente, envia comprovante ao paciente e investiga. Se for cobrada indevidamente, procede com estorno/ajuste; se houver necessidade de desconto/negociação, encaminha ao financeiro.

Fluxo chave: registro -> envio de comprovantes ao paciente -> verificação da cobrança -> decisão: cobrança indevida? -> sim: medidas corretivas; não: fornecer orientação e opções de desconto/parcelamento.

Atores: Atendimento, Financeiro, Beneficiário.
`,
      actors: ['Atendimento', 'Financeiro', 'Beneficiário'],
      documents: [
        'Boleto ou fatura atual',
        'Protocolo/nota fiscal se houver',
        'Comprovantes que contestem a cobrança'
      ],
      timeEstimate: 'Registro inicial: 1–3 min; investigação: variável (pode demandar dias)',
      decisionPoints: [
        'Cobrança é indevida?',
        'Forma de desconto/negociação desejada (fatura atual ou futura)?'
      ],
      faqs: [
        {
          q: 'Como contesto uma cobrança que não reconheço?',
          a: 'Envie o boleto e detalhes ao atendimento; será gerado um protocolo e o caso será investigado. Se comprovada cobrança indevida, será feito o ajuste pelo financeiro.'
        }
      ]
    },

    {
      id: 'atualizacao_cadastral',
      title: 'Atualização Cadastral (via WhatsApp/app/atendimento)',
      content:
`Resumo: Beneficiário fornece dados para atualização (CPF, endereço, dados pessoais). Atendimento verifica documentos, confirma informações e realiza a atualização no CRM/ERP. Se informações estiverem incorretas, informa o beneficiário via WhatsApp.

Fluxo chave: envio de documentação -> verificação pelo atendimento -> atualizar cadastro via CRM -> confirmar com beneficiário.

Atores: Beneficiário, Atendimento, Cadastro.
`,
      actors: ['Beneficiário', 'Atendimento', 'Cadastro'],
      documents: ['CPF, comprovante de endereço, documentos pessoais relevantes'],
      timeEstimate: 'Envio e registro: 1–3 min; atualização no sistema: 1–3 min',
      decisionPoints: [
        'Informações conferidas e válidas? (se não, solicitar correção via WhatsApp)'
      ],
      faqs: [
        {
          q: 'Como atualizo meu endereço?',
          a: 'Envie CPF e comprovante de endereço via WhatsApp ou anexe pelo app; o atendimento verificará e atualizará no sistema.'
        }
      ]
    },

    {
      id: 'agendamento_consultas',
      title: 'Agendamento de Consultas (app / portal / via atendimento)',
      content:
`Resumo: Usuário pode agendar via app/portal (buscar agenda disponível, selecionar vaga, confirmar). Alternativamente, pode contatar a central (WhatsApp/telefone) que verifica disponibilidade e reserva a agenda. Confirmação e protocolo são gerados; atendimento confirma dia/hora/médico/endereço.

Fluxo chave: busca self-service -> selecionar data/hora/profissional -> confirmar; ou porta de entrada via contato -> registro -> verificação de vagas pelo atendimento -> confirmar agendamento -> reservar.

Atores: Beneficiário (autoatendimento), Atendimento, Sistema de Agenda.
`,
      actors: ['Beneficiário', 'Atendimento', 'Sistema de Agenda'],
      documents: ['Nome, data de nascimento, especialidade desejada, preferência de horário'],
      timeEstimate: 'Pesquisa no app: 1–5 min; atendimento para reserva: ~2–5 min',
      decisionPoints: [
        'Há vagas disponíveis no dia/horário/profissional solicitado?'
      ],
      faqs: [
        {
          q: 'Como agendo uma consulta pelo app?',
          a: 'No app, filtre por cidade/especialidade/data, selecione vaga disponível e confirme os dados do agendamento.'
        },
        {
          q: 'Posso agendar por WhatsApp?',
          a: 'Sim — informe nome completo, data de nascimento e a especialidade; o atendimento verifica vagas e reserva para você.'
        }
      ]
    }
  ]
};

export default HealthContext;