import { BookingStatus, Role } from "@prisma/client";

const TERMINAL: BookingStatus[] = [
  BookingStatus.REJECTED,
  BookingStatus.COMPLETED,
  BookingStatus.CANCELLED,
];

/**
 * Transições permitidas por papel. Estados terminais não aceitam mudança.
 */
export function canTransitionBookingStatus(
  role: Role,
  current: BookingStatus,
  next: BookingStatus
): boolean {
  if (current === next) return true;
  if (TERMINAL.includes(current)) return false;

  if (role === Role.CLIENT) {
    if (current === BookingStatus.PENDING) {
      return next === BookingStatus.CANCELLED || next === BookingStatus.COMPLETED;
    }
    if (current === BookingStatus.ACCEPTED) {
      return next === BookingStatus.CANCELLED || next === BookingStatus.COMPLETED;
    }
    return false;
  }

  if (role === Role.DIARISTA) {
    if (current === BookingStatus.PENDING) {
      return (
        next === BookingStatus.ACCEPTED ||
        next === BookingStatus.REJECTED ||
        next === BookingStatus.COMPLETED
      );
    }
    if (current === BookingStatus.ACCEPTED) {
      return next === BookingStatus.COMPLETED;
    }
    return false;
  }

  return false;
}
