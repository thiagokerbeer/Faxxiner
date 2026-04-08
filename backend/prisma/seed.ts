import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash("demo123456", 12);
  const consent = new Date();

  const client = await prisma.user.upsert({
    where: { email: "cliente@demo.com" },
    update: { privacyConsentAt: consent },
    create: {
      email: "cliente@demo.com",
      passwordHash: hash,
      name: "Carlos Cliente",
      phone: "(11) 98888-1111",
      role: Role.CLIENT,
      privacyConsentAt: consent,
    },
  });

  const maria = await prisma.user.upsert({
    where: { email: "maria@demo.com" },
    update: { privacyConsentAt: consent },
    create: {
      email: "maria@demo.com",
      passwordHash: hash,
      name: "Maria Silva",
      phone: "(11) 97777-2222",
      role: Role.DIARISTA,
      privacyConsentAt: consent,
    },
  });

  const ana = await prisma.user.upsert({
    where: { email: "ana@demo.com" },
    update: { privacyConsentAt: consent },
    create: {
      email: "ana@demo.com",
      passwordHash: hash,
      name: "Ana Costa",
      phone: "(11) 96666-3333",
      role: Role.DIARISTA,
      privacyConsentAt: consent,
    },
  });

  const adminDemo = await prisma.user.upsert({
    where: { email: "admin@demo.com" },
    update: {
      role: Role.ADMIN,
      name: "Administrador do site",
      phone: "(11) 95555-0000",
      passwordHash: hash,
      privacyConsentAt: consent,
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

  await prisma.diaristProfile.upsert({
    where: { userId: maria.id },
    update: {},
    create: {
      userId: maria.id,
      bio: "10 anos de experiência em faxina residencial. Organização e capricho.",
      city: "São Paulo",
      neighborhoods: "Pinheiros, Vila Madalena, Perdizes",
      hourlyRateCents: 4500,
      servicesOffered: "Faxina completa, pós-obra, organização de armários",
      isActive: true,
    },
  });

  await prisma.diaristProfile.upsert({
    where: { userId: ana.id },
    update: {},
    create: {
      userId: ana.id,
      bio: "Especialista em limpeza profunda e passar roupa. Referências sob consulta.",
      city: "São Paulo",
      neighborhoods: "Moema, Brooklin, Campo Belo",
      hourlyRateCents: 5200,
      servicesOffered: "Limpeza pesada, passar roupa, cozinha e banheiros",
      isActive: true,
    },
  });

  await prisma.booking.upsert({
    where: { id: "00000000-0000-4000-8000-000000000001" },
    update: {},
    create: {
      id: "00000000-0000-4000-8000-000000000001",
      clientId: client.id,
      diaristId: maria.id,
      scheduledAt: new Date(Date.now() + 86400000 * 3),
      status: "PENDING",
      notes: "Apartamento 2 quartos, preciso de faxina completa.",
      address: "Rua Exemplo, 100 — Pinheiros, SP",
    },
  });

  console.log("Seed OK:", {
    client: client.email,
    adminDemo: adminDemo.email,
    diaristas: [maria.email, ana.email],
  });
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
