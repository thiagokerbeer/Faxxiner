import { describe, it, expect } from "vitest";
import { BookingStatus, Role } from "@prisma/client";
import { canTransitionBookingStatus } from "./bookingStateMachine.js";

describe("canTransitionBookingStatus", () => {
  it("allows same status", () => {
    expect(canTransitionBookingStatus(Role.CLIENT, BookingStatus.PENDING, BookingStatus.PENDING)).toBe(true);
    expect(
      canTransitionBookingStatus(Role.DIARISTA, BookingStatus.COMPLETED, BookingStatus.COMPLETED)
    ).toBe(true);
  });

  it("blocks changes from terminal states", () => {
    for (const s of [BookingStatus.REJECTED, BookingStatus.COMPLETED, BookingStatus.CANCELLED]) {
      expect(canTransitionBookingStatus(Role.CLIENT, s, BookingStatus.PENDING)).toBe(false);
      expect(canTransitionBookingStatus(Role.DIARISTA, s, BookingStatus.ACCEPTED)).toBe(false);
    }
  });

  it("CLIENT from PENDING: cancel or complete only", () => {
    expect(canTransitionBookingStatus(Role.CLIENT, BookingStatus.PENDING, BookingStatus.CANCELLED)).toBe(
      true
    );
    expect(canTransitionBookingStatus(Role.CLIENT, BookingStatus.PENDING, BookingStatus.COMPLETED)).toBe(
      true
    );
    expect(canTransitionBookingStatus(Role.CLIENT, BookingStatus.PENDING, BookingStatus.ACCEPTED)).toBe(
      false
    );
  });

  it("CLIENT from ACCEPTED: cancel or complete", () => {
    expect(canTransitionBookingStatus(Role.CLIENT, BookingStatus.ACCEPTED, BookingStatus.CANCELLED)).toBe(
      true
    );
    expect(canTransitionBookingStatus(Role.CLIENT, BookingStatus.ACCEPTED, BookingStatus.COMPLETED)).toBe(
      true
    );
    expect(canTransitionBookingStatus(Role.CLIENT, BookingStatus.ACCEPTED, BookingStatus.REJECTED)).toBe(
      false
    );
  });

  it("DIARISTA from PENDING: accept, reject, complete", () => {
    expect(canTransitionBookingStatus(Role.DIARISTA, BookingStatus.PENDING, BookingStatus.ACCEPTED)).toBe(
      true
    );
    expect(canTransitionBookingStatus(Role.DIARISTA, BookingStatus.PENDING, BookingStatus.REJECTED)).toBe(
      true
    );
    expect(canTransitionBookingStatus(Role.DIARISTA, BookingStatus.PENDING, BookingStatus.COMPLETED)).toBe(
      true
    );
    expect(canTransitionBookingStatus(Role.DIARISTA, BookingStatus.PENDING, BookingStatus.CANCELLED)).toBe(
      false
    );
  });

  it("DIARISTA from ACCEPTED: only complete", () => {
    expect(canTransitionBookingStatus(Role.DIARISTA, BookingStatus.ACCEPTED, BookingStatus.COMPLETED)).toBe(
      true
    );
    expect(canTransitionBookingStatus(Role.DIARISTA, BookingStatus.ACCEPTED, BookingStatus.REJECTED)).toBe(
      false
    );
    expect(canTransitionBookingStatus(Role.DIARISTA, BookingStatus.ACCEPTED, BookingStatus.CANCELLED)).toBe(
      false
    );
  });

  it("ADMIN never transitions via this helper", () => {
    expect(canTransitionBookingStatus(Role.ADMIN, BookingStatus.PENDING, BookingStatus.ACCEPTED)).toBe(
      false
    );
  });
});
