import type {
  BookingStatus,
  IBookingCalendarResponse,
  IBookingSlotCalendarResponse,
} from '../interfaces';

function durationFromTimes(startTime: string, endTime: string): number {
  if (!startTime || !endTime) {
    return 0;
  }
  const toMinutes = (time: string) => {
    const [hours = 0, minutes = 0] = time.split(':').map((part) => parseInt(part, 10));
    return hours * 60 + minutes;
  };
  let start = toMinutes(startTime);
  let end = toMinutes(endTime);
  if (end < start) {
    end += 24 * 60;
  }
  return end - start;
}

/** Maps `BookingSlot/GetAllCalendar` items to the shape expected by the calendar and event dialog. */
export function mapSlotCalendarToBookingCalendar(
  slot: IBookingSlotCalendarResponse,
): IBookingCalendarResponse {
  return {
    id: slot.id,
    sportName: slot.sportTypeName,
    bookingDate: slot.bookingDate,
    startTime: slot.startTime,
    endTime: slot.endTime,
    bookingAmount: slot.bookingFees,
    organizationName: slot.organizationName,
    duration: durationFromTimes(slot.startTime, slot.endTime),
    status: 0,
    statusName: slot.statusName as BookingStatus,
    facilityName: slot.facilityName,
    coachId: 0,
    coachName: '',
    isAssignCoach: false,
    isActive: slot.isActive,
    createdDate: '',
  };
}

export function mapSlotCalendarListToBookingCalendar(
  slots: IBookingSlotCalendarResponse[],
): IBookingCalendarResponse[] {
  return slots.map(mapSlotCalendarToBookingCalendar);
}
