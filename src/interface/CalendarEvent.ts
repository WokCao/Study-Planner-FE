export default interface CalendarEvent {
    id: number;
    calendarId: string;
    title: string;
    body: string;
    category: string;
    isReadOnly: boolean;
    start: any;
    end: any;
    backgroundColor: string;
    dragBackgroundColor: string;
    borderColor: string;
}