declare module "@toastui/react-calendar" {
  import { FC } from "react";
  import Calendar, { CalendarProps } from "@toast-ui/calendar";

  interface ReactCalendar extends FC<CalendarProps> {
    getInstance: () => Calendar;
  }

  const CalendarComponent: ReactCalendar;
  export default CalendarComponent;
}
