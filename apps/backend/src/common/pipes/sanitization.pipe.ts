import { PipeTransform, Injectable } from '@nestjs/common';

@Injectable()
export class SanitizationPipe implements PipeTransform {
  transform<T>(value: T): T {
    if (typeof value === 'string') {
      return this.sanitize(value as unknown as string) as unknown as T;
    }
    if (Array.isArray(value)) {
      return value.map((item) => this.transform(item)) as unknown as T;
    }
    if (value !== null && typeof value === 'object') {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
        sanitized[key] = this.transform(val);
      }
      return sanitized as T;
    }
    return value;
  }

  private sanitize(str: string): string {
    return str
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\\/g, '&#x5C;')
      .replace(/`/g, '&#x60;');
  }
}