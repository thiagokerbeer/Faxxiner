import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

type ClientSeed = {
  email: string;
  name: string;
  phone: string;
};

type DiaristaSeed = {
  email: string;
  name: string;
  phone: string;
  profile: {
    bio: string;
    city: string;
    neighborhoods: string;
    hourlyRateCents: number;
    servicesOffered: string;
    isActive?: boolean;
  };
};

/** Clientes demo (várias capitais no nome / telefone DDD). */
const CLIENTS: ClientSeed[] = [
  { email: "cliente@demo.com", name: "Carlos Cliente", phone: "(11) 98888-1111" },
  { email: "patricia.rj@demo.com", name: "Patrícia Oliveira", phone: "(21) 98765-1101" },
  { email: "roberto.bsb@demo.com", name: "Roberto Almeida", phone: "(61) 98112-2202" },
  { email: "fernanda.ssa@demo.com", name: "Fernanda Santos", phone: "(71) 99223-3303" },
  { email: "juliana.for@demo.com", name: "Juliana Lima", phone: "(85) 99334-4404" },
  { email: "ricardo.bh@demo.com", name: "Ricardo Mendes", phone: "(31) 99445-5505" },
  { email: "amanda.manaus@demo.com", name: "Amanda Ferreira", phone: "(92) 99556-6606" },
  { email: "camila.cwb@demo.com", name: "Camila Rocha", phone: "(41) 99667-7707" },
  { email: "diego.rec@demo.com", name: "Diego Araújo", phone: "(81) 99778-8808" },
  { email: "lais.poa@demo.com", name: "Laís Martins", phone: "(51) 99889-9909" },
  { email: "gabriel.gyn@demo.com", name: "Gabriel Cardoso", phone: "(62) 99100-1010" },
  { email: "tatiane.belem@demo.com", name: "Tatiane Nascimento", phone: "(91) 98211-2121" },
  { email: "bruno.natal@demo.com", name: "Bruno Teixeira", phone: "(84) 98322-3232" },
  { email: "carla.maceio@demo.com", name: "Carla Vieira", phone: "(82) 98433-4343" },
  { email: "felipe.jampa@demo.com", name: "Felipe Correia", phone: "(83) 98544-5454" },
  { email: "renata.aracaju@demo.com", name: "Renata Dias", phone: "(79) 98655-6565" },
  { email: "lucas.the@demo.com", name: "Lucas Barros", phone: "(86) 98766-7676" },
  { email: "vanessa.cgr@demo.com", name: "Vanessa Freitas", phone: "(67) 98877-8787" },
  { email: "igor.cba@demo.com", name: "Igor Monteiro", phone: "(65) 98988-9898" },
  { email: "leticia.fln@demo.com", name: "Letícia Ramos", phone: "(48) 99199-0909" },
  { email: "paulo.vix@demo.com", name: "Paulo Nogueira", phone: "(27) 99200-1212" },
  { email: "marina.slz@demo.com", name: "Marina Castro", phone: "(98) 99311-2323" },
];

/** Diaristas com perfil em capitais (cidades para filtro na listagem). */
const DIARISTAS: DiaristaSeed[] = [
  {
    email: "maria@demo.com",
    name: "Maria Silva",
    phone: "(11) 97777-2222",
    profile: {
      bio: "10 anos de experiência em faxina residencial. Organização e capricho.",
      city: "São Paulo",
      neighborhoods: "Pinheiros, Vila Madalena, Perdizes",
      hourlyRateCents: 4500,
      servicesOffered: "Faxina completa, pós-obra, organização de armários",
    },
  },
  {
    email: "ana@demo.com",
    name: "Ana Costa",
    phone: "(11) 96666-3333",
    profile: {
      bio: "Especialista em limpeza profunda e passar roupa. Referências sob consulta.",
      city: "São Paulo",
      neighborhoods: "Moema, Brooklin, Campo Belo",
      hourlyRateCents: 5200,
      servicesOffered: "Limpeza pesada, passar roupa, cozinha e banheiros",
    },
  },
  {
    email: "carla.rio@demo.com",
    name: "Carla Souza",
    phone: "(21) 97111-4141",
    profile: {
      bio: "Faxina em apartamentos e coberturas. Cuidado com móveis e vidros.",
      city: "Rio de Janeiro",
      neighborhoods: "Copacabana, Ipanema, Leblon",
      hourlyRateCents: 4800,
      servicesOffered: "Faxina geral, vidros, pós-festa",
    },
  },
  {
    email: "denise.bsb@demo.com",
    name: "Denise Ribeiro",
    phone: "(61) 97222-5252",
    profile: {
      bio: "Atendo Asa Sul e Norte com pontualidade. Materiais podem ser combinados.",
      city: "Brasília",
      neighborhoods: "Asa Sul, Asa Norte, Lago Sul",
      hourlyRateCents: 4400,
      servicesOffered: "Residências, pequenos escritórios, organização",
    },
  },
  {
    email: "eliane.ssa@demo.com",
    name: "Eliane Gomes",
    phone: "(71) 97333-6363",
    profile: {
      bio: "Mais de 8 anos em limpeza residencial na orla e bairros centrais.",
      city: "Salvador",
      neighborhoods: "Barra, Pituba, Ondina",
      hourlyRateCents: 4000,
      servicesOffered: "Faxina completa, varrição de área externa",
    },
  },
  {
    email: "graca.for@demo.com",
    name: "Graça Melo",
    phone: "(85) 97444-7474",
    profile: {
      bio: "Trabalho com casas e apartamentos; foco em cozinha e áreas molhadas.",
      city: "Fortaleza",
      neighborhoods: "Aldeota, Meireles, Cocó",
      hourlyRateCents: 3800,
      servicesOffered: "Limpeza pesada, desengordurante e higienização",
    },
  },
  {
    email: "helena.bh@demo.com",
    name: "Helena Pires",
    phone: "(31) 97555-8585",
    profile: {
      bio: "Diarista com referências em condomínios da região central.",
      city: "Belo Horizonte",
      neighborhoods: "Savassi, Lourdes, Funcionários",
      hourlyRateCents: 4200,
      servicesOffered: "Faxina, passar roupa, arrumação de quartos",
    },
  },
  {
    email: "ivone.manaus@demo.com",
    name: "Ivone Carvalho",
    phone: "(92) 97666-9696",
    profile: {
      bio: "Experiência em casas amplas e imóveis com pets.",
      city: "Manaus",
      neighborhoods: "Adrianópolis, Aleixo, Chapada",
      hourlyRateCents: 3600,
      servicesOffered: "Limpeza completa, retirada de pelos, organização",
    },
  },
  {
    email: "janete.cwb@demo.com",
    name: "Janete Lopes",
    phone: "(41) 97777-0707",
    profile: {
      bio: "Capricho em vidros e pisos; atendo Batel e região.",
      city: "Curitiba",
      neighborhoods: "Batel, Bigorrilho, Água Verde",
      hourlyRateCents: 4300,
      servicesOffered: "Faxina, tratamento de pisos, vidros",
    },
  },
  {
    email: "katia.rec@demo.com",
    name: "Kátia Duarte",
    phone: "(81) 97888-1818",
    profile: {
      bio: "Orla e bairros próximos; flexível com horários na parte da manhã.",
      city: "Recife",
      neighborhoods: "Boa Viagem, Pina, Casa Forte",
      hourlyRateCents: 3900,
      servicesOffered: "Residencial, pós-reforma leve, áreas comuns",
    },
  },
  {
    email: "luiza.poa@demo.com",
    name: "Luiza Freitas",
    phone: "(51) 97999-2929",
    profile: {
      bio: "Organização de closets e faxina em apartamentos compactos.",
      city: "Porto Alegre",
      neighborhoods: "Moinhos de Vento, Bela Vista, Cidade Baixa",
      hourlyRateCents: 4100,
      servicesOffered: "Faxina, organização, trocar roupas de cama",
    },
  },
  {
    email: "marcia.gyn@demo.com",
    name: "Márcia Teles",
    phone: "(62) 98000-3030",
    profile: {
      bio: "Setor Marista e Bueno; experiência com famílias com crianças.",
      city: "Goiânia",
      neighborhoods: "Setor Marista, Setor Bueno, Jardim América",
      hourlyRateCents: 3700,
      servicesOffered: "Faxina geral, cozinha, quartos infantis",
    },
  },
  {
    email: "nelma.belem@demo.com",
    name: "Nelma Andrade",
    phone: "(91) 98111-4141",
    profile: {
      bio: "Limpeza residencial e pequenos comércios no centro e Nazaré.",
      city: "Belém",
      neighborhoods: "Nazaré, Umarizal, Marco",
      hourlyRateCents: 3500,
      servicesOffered: "Faxina, varrição de calçada, vidros de loja",
    },
  },
  {
    email: "olga.natal@demo.com",
    name: "Olga Machado",
    phone: "(84) 98222-5252",
    profile: {
      bio: "Ponta Negra e vizinhanças; referências de temporada e Airbnb.",
      city: "Natal",
      neighborhoods: "Ponta Negra, Lagoa Nova, Tirol",
      hourlyRateCents: 4000,
      servicesOffered: "Faxina pós-hóspede, troca de enxoval, organização",
    },
  },
  {
    email: "paula.maceio@demo.com",
    name: "Paula Xavier",
    phone: "(82) 98333-6363",
    profile: {
      bio: "Orla e Jatiúca; cuidado com ambientes próximos à praia (areia e sal).",
      city: "Maceió",
      neighborhoods: "Ponta Verde, Jatiúca, Pajuçara",
      hourlyRateCents: 3800,
      servicesOffered: "Limpeza completa, varrer áreas externas",
    },
  },
  {
    email: "queila.jampa@demo.com",
    name: "Queila Moura",
    phone: "(83) 98444-7474",
    profile: {
      bio: "Tambaú e Manaíra; pontualidade e discrição em prédios.",
      city: "João Pessoa",
      neighborhoods: "Tambaú, Manaíra, Bessa",
      hourlyRateCents: 3600,
      servicesOffered: "Faxina residencial, passar roupa social",
    },
  },
  {
    email: "raquel.aracaju@demo.com",
    name: "Raquel Farias",
    phone: "(79) 98555-8585",
    profile: {
      bio: "Atendo Jardins e centro; foco em banheiros e cozinha.",
      city: "Aracaju",
      neighborhoods: "Jardins, Grageru, Centro",
      hourlyRateCents: 3400,
      servicesOffered: "Faxina, higienização de banheiros, cozinha",
    },
  },
  {
    email: "sonia.the@demo.com",
    name: "Sônia Brito",
    phone: "(86) 98666-9696",
    profile: {
      bio: "Faxina em casas e apartamentos; posso levar alguns materiais básicos.",
      city: "Teresina",
      neighborhoods: "Fátima, Ilhotas, Noivos",
      hourlyRateCents: 3300,
      servicesOffered: "Limpeza geral, organização de despensa",
    },
  },
  {
    email: "tereza.cgr@demo.com",
    name: "Tereza Nunes",
    phone: "(67) 98777-0707",
    profile: {
      bio: "Centro e Tiradentes; experiência com idosos no mesmo endereço fixo.",
      city: "Campo Grande",
      neighborhoods: "Centro, Tiradentes, Carandá Bosque",
      hourlyRateCents: 3500,
      servicesOffered: "Faxina, companhia leve na rotina doméstica",
    },
  },
  {
    email: "vera.cba@demo.com",
    name: "Vera Cunha",
    phone: "(65) 98888-1818",
    profile: {
      bio: "Bosque da Saúde e Popular; limpeza pós-obra leve.",
      city: "Cuiabá",
      neighborhoods: "Bosque da Saúde, Popular, CPA",
      hourlyRateCents: 3700,
      servicesOffered: "Faxina, remoção de poeira fina pós-reforma",
    },
  },
  {
    email: "wanda.fln@demo.com",
    name: "Wanda Rezende",
    phone: "(48) 98999-2929",
    profile: {
      bio: "Ilha e região continental combinando; agenda com antecedência.",
      city: "Florianópolis",
      neighborhoods: "Centro, Trindade, Agronômica",
      hourlyRateCents: 4500,
      servicesOffered: "Residências, temporada, limpeza pós-evento",
    },
  },
  {
    email: "yara.vix@demo.com",
    name: "Yara Peixoto",
    phone: "(27) 99000-3030",
    profile: {
      bio: "Praia do Canto e Jardim da Penha; organização de áreas sociais.",
      city: "Vitória",
      neighborhoods: "Praia do Canto, Jardim da Penha, Enseada",
      hourlyRateCents: 4200,
      servicesOffered: "Faxina, arrumação para receber visitas",
    },
  },
  {
    email: "zilda.slz@demo.com",
    name: "Zilda Matos",
    phone: "(98) 99111-4141",
    profile: {
      bio: "Calhau e Renascença; cuidado com móveis de madeira e couro.",
      city: "São Luís",
      neighborhoods: "Calhau, Renascença, Jardim Renascença",
      hourlyRateCents: 3200,
      servicesOffered: "Limpeza delicada, faxina geral, pó e aspirar",
    },
  },
  {
    email: "alice.palmas@demo.com",
    name: "Alice Moreira",
    phone: "(63) 99222-5252",
    profile: {
      bio: "Plano Diretor Norte e Sul; flexível aos sábados.",
      city: "Palmas",
      neighborhoods: "Plano Diretor Norte, Sul, Taquaralto",
      hourlyRateCents: 3800,
      servicesOffered: "Faxina completa, organização de garagem",
    },
  },
  {
    email: "bia.rbranco@demo.com",
    name: "Beatriz Aguiar",
    phone: "(68) 99333-6363",
    profile: {
      bio: "Centro e Bosque; atendo casas com quintal.",
      city: "Rio Branco",
      neighborhoods: "Centro, Bosque, Vila Ivonete",
      hourlyRateCents: 3400,
      servicesOffered: "Faxina interna e varrição de quintal",
    },
  },
  {
    email: "cecilia.macapa@demo.com",
    name: "Cecília Fontes",
    phone: "(96) 99444-7474",
    profile: {
      bio: "Zona Central e Jesus de Nazaré; referências locais.",
      city: "Macapá",
      neighborhoods: "Central, Jesus de Nazaré, Buritizal",
      hourlyRateCents: 3300,
      servicesOffered: "Limpeza residencial, cozinha e salas",
    },
  },
];

async function main() {
  const hash = await bcrypt.hash("demo123456", 12);
  const consent = new Date();

  const clientIds = new Map<string, string>();
  for (const c of CLIENTS) {
    const u = await prisma.user.upsert({
      where: { email: c.email },
      update: {
        name: c.name,
        phone: c.phone,
        privacyConsentAt: consent,
        passwordHash: hash,
        role: Role.CLIENT,
        deletedAt: null,
      },
      create: {
        email: c.email,
        passwordHash: hash,
        name: c.name,
        phone: c.phone,
        role: Role.CLIENT,
        privacyConsentAt: consent,
      },
    });
    clientIds.set(c.email, u.id);
  }

  const diaristaIds = new Map<string, string>();
  for (const d of DIARISTAS) {
    const u = await prisma.user.upsert({
      where: { email: d.email },
      update: {
        name: d.name,
        phone: d.phone,
        privacyConsentAt: consent,
        passwordHash: hash,
        role: Role.DIARISTA,
        deletedAt: null,
      },
      create: {
        email: d.email,
        passwordHash: hash,
        name: d.name,
        phone: d.phone,
        role: Role.DIARISTA,
        privacyConsentAt: consent,
      },
    });
    diaristaIds.set(d.email, u.id);

    const p = d.profile;
    await prisma.diaristProfile.upsert({
      where: { userId: u.id },
      update: {
        bio: p.bio,
        city: p.city,
        neighborhoods: p.neighborhoods,
        hourlyRateCents: p.hourlyRateCents,
        servicesOffered: p.servicesOffered,
        isActive: p.isActive ?? true,
      },
      create: {
        userId: u.id,
        bio: p.bio,
        city: p.city,
        neighborhoods: p.neighborhoods,
        hourlyRateCents: p.hourlyRateCents,
        servicesOffered: p.servicesOffered,
        isActive: p.isActive ?? true,
      },
    });
  }

  const adminDemo = await prisma.user.upsert({
    where: { email: "admin@demo.com" },
    update: {
      role: Role.ADMIN,
      name: "Administrador do site",
      phone: "(11) 95555-0000",
      passwordHash: hash,
      privacyConsentAt: consent,
      deletedAt: null,
    },
    create: {
      email: "admin@demo.com",
      passwordHash: hash,
      name: "Administrador do site",
      phone: "(11) 95555-0000",
      role: Role.ADMIN,
      privacyConsentAt: consent,
    },
  });
  await prisma.diaristProfile.deleteMany({ where: { userId: adminDemo.id } });

  const idCliente = clientIds.get("cliente@demo.com")!;
  const idMaria = diaristaIds.get("maria@demo.com")!;
  const idCarlaRj = diaristaIds.get("carla.rio@demo.com")!;
  const idPatricia = clientIds.get("patricia.rj@demo.com")!;
  const idDenise = diaristaIds.get("denise.bsb@demo.com")!;
  const idRoberto = clientIds.get("roberto.bsb@demo.com")!;

  await prisma.booking.upsert({
    where: { id: "00000000-0000-4000-8000-000000000001" },
    update: {},
    create: {
      id: "00000000-0000-4000-8000-000000000001",
      clientId: idCliente,
      diaristId: idMaria,
      scheduledAt: new Date(Date.now() + 86400000 * 3),
      status: "PENDING",
      notes: "Apartamento 2 quartos, preciso de faxina completa.",
      address: "Rua Exemplo, 100 — Pinheiros, SP",
    },
  });

  await prisma.booking.upsert({
    where: { id: "00000000-0000-4000-8000-000000000002" },
    update: {},
    create: {
      id: "00000000-0000-4000-8000-000000000002",
      clientId: idPatricia,
      diaristId: idCarlaRj,
      scheduledAt: new Date(Date.now() + 86400000 * 5),
      status: "ACCEPTED",
      notes: "Cobertura com varanda — vidros com prioridade.",
      address: "Av. Atlântica — Copacabana, RJ",
    },
  });

  await prisma.booking.upsert({
    where: { id: "00000000-0000-4000-8000-000000000003" },
    update: {},
    create: {
      id: "00000000-0000-4000-8000-000000000003",
      clientId: idRoberto,
      diaristId: idDenise,
      scheduledAt: new Date(Date.now() - 86400000 * 2),
      status: "COMPLETED",
      notes: "Escritório pequeno, faxina semanal concluída.",
      address: "SQN 305 — Asa Norte, DF",
    },
  });

  console.log("Seed OK:", {
    clientes: CLIENTS.length,
    diaristas: DIARISTAS.length,
    capitaisDiaristas: [...new Set(DIARISTAS.map((d) => d.profile.city))].sort().join(", "),
    admin: adminDemo.email,
    agendamentosDemoFixos: 3,
  });
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
