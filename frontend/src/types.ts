export type Role = "CLIENT" | "DIARISTA" | "ADMIN";

export type BookingStatus =
  | "PENDING"
  | "ACCEPTED"
  | "REJECTED"
  | "COMPLETED"
  | "CANCELLED";

export type UserPublic = {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  role: Role;
};

export type DiaristProfilePublic = {
  id: string;
  bio: string;
  city: string;
  neighborhoods: string;
  hourlyRateCents: number;
  servicesOffered: string;
  photoUrl: string | null;
  isActive: boolean;
  user: { id: string; name: string; phone: string | null };
};

export type DiaristProfileFull = DiaristProfilePublic & {
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type MeUser = UserPublic & {
  diaristProfile: DiaristProfileFull | null;
};

export type BookingRow = {
  id: string;
  clientId: string;
  diaristId: string;
  scheduledAt: string;
  status: BookingStatus;
  notes: string | null;
  address: string | null;
  createdAt: string;
  updatedAt: string;
  client?: { id: string; name: string; phone: string | null; email?: string };
  diarist?: { id: string; name: string; phone: string | null; email?: string };
};

export type AdminOverview = {
  users: {
    clients: number;
    diaristas: number;
    admins: number;
    activeDiaristProfiles: number;
  };
  bookingsByStatus: Partial<Record<BookingStatus, number>>;
  recentBookings: BookingRow[];
  recentUsers: Array<{
    id: string;
    email: string;
    name: string;
    role: Role;
    createdAt: string;
    phone: string | null;
  }>;
};
