import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'relativeTime',
  standalone: true,
})
export class RelativeTimePipe implements PipeTransform {
  transform(value: Date | string | number): string {
    if (!value) return '';

    const date = new Date(value);
    const now = new Date();

    // If the time is today, show "Today - hh:mm AM/PM"
    if (this.isToday(date, now)) {
      return `Today - ${this.formatTime(date)}`;
    }

    // If the time is yesterday, show "Yesterday - hh:mm AM/PM"
    if (this.isYesterday(date, now)) {
      return `Yesterday - ${this.formatTime(date)}`;
    }

    // If the time is within this week, show the day of the week
    if (this.isThisWeek(date, now)) {
      return `${this.getDayOfWeek(date)} - ${this.formatTime(date)}`;
    }

    // Otherwise, show the date
    return this.formatDate(date);
  }

  private isToday(date: Date, now: Date): boolean {
    return date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear();
  }

  private isYesterday(date: Date, now: Date): boolean {
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    return date.getDate() === yesterday.getDate() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getFullYear() === yesterday.getFullYear();
  }

  private isThisWeek(date: Date, now: Date): boolean {
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    return date >= startOfWeek && date <= endOfWeek;
  }

  private formatTime(date: Date): string {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  private getDayOfWeek(date: Date): string {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[date.getDay()];
  }

  private formatDate(date: Date): string {
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }
}
