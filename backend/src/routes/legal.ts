import { Router } from "express";

/**
 * Transparência (LGPD, art. 9º) — informações ao titular, sem expor dados sensíveis.
 * Textos genéricos; personalize e-mail do controlador / DPO via env em deploy.
 */
export const legalRouter = Router();

legalRouter.get("/lgpd", (_req, res) => {
  const controllerEmail = process.env.LGPD_CONTROLLER_EMAIL?.trim() || null;
  const dpoEmail =
    process.env.LGPD_DPO_EMAIL?.trim() || controllerEmail;

  res.json({
    document: "resumo-lgpd",
    version: "1.0",
    updatedAt: "2026-04-08",
    controller: {
      product: "Faxxiner",
      contactEmail: controllerEmail,
    },
    dpo: {
      email: dpoEmail,
      note:
        dpoEmail === null
          ? "Defina LGPD_CONTROLLER_EMAIL e, se aplicável, LGPD_DPO_EMAIL no ambiente de produção."
          : undefined,
    },
    purposes: [
      {
        purpose: "Prestação do serviço de intermediação entre clientes e profissionais",
        dataCategories: ["identificação", "contato", "dados do perfil profissional", "agendamentos e endereço quando informado"],
        legalBasis: "Execução de contrato e procedimentos preliminares (LGPD, art. 7º, V)",
      },
      {
        purpose: "Segurança, prevenção a fraudes e cumprimento legal",
        dataCategories: ["credenciais (senha apenas como hash)", "registros técnicos mínimos"],
        legalBasis: "Legítimo interesse e cumprimento de obrigação legal (LGPD, art. 7º, II e IX)",
      },
    ],
    rights: [
      "Confirmação da existência de tratamento e acesso aos dados",
      "Correção de dados incompletos, inexatos ou desatualizados",
      "Anonimização, bloqueio ou eliminação de dados desnecessários ou tratados em desconformidade",
      "Portabilidade dos dados a outro fornecedor (via exportação)",
      "Eliminação dos dados pessoais tratados com consentimento, quando aplicável",
      "Informação sobre compartilhamentos e sobre o direito de não consentir",
      "Revogação do consentimento, quando o tratamento se basear nele",
    ],
    retention: {
      principle:
        "Dados mantidos pelo tempo necessário para a finalidade, obrigações legais e resolução de litígios.",
      accounts:
        "Após exclusão da conta, identificação direta é anonimizada; registros de agendamento podem permanecer de forma pseudonimizada quando necessário às partes contratantes.",
    },
    securityMeasures: [
      "Comunicação HTTPS obrigatória em produção",
      "Senhas armazenadas com hash (bcrypt)",
      "Cabeçalhos de segurança HTTP (Helmet)",
      "Limitação de taxa em rotas sensíveis",
      "Controle de acesso por perfil (cliente, profissional, administrador)",
    ],
  });
});
