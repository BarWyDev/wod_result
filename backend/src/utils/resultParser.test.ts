import { describe, it, expect } from 'vitest';
import { parseResultNumeric } from './resultParser';

describe('resultParser', () => {
  describe('parseResultNumeric', () => {
    describe('time formats', () => {
      it('should parse mm:ss format correctly', () => {
        expect(parseResultNumeric('12:45')).toBe(765); // 12*60 + 45
        expect(parseResultNumeric('01:30')).toBe(90);
        expect(parseResultNumeric('0:45')).toBe(45);
      });

      it('should parse hh:mm:ss format correctly', () => {
        expect(parseResultNumeric('1:23:45')).toBe(5025); // 1*3600 + 23*60 + 45
        expect(parseResultNumeric('0:12:30')).toBe(750);
        expect(parseResultNumeric('2:00:00')).toBe(7200);
      });

      it('should handle leading zeros in time format', () => {
        expect(parseResultNumeric('00:30')).toBe(30);
        expect(parseResultNumeric('05:05')).toBe(305);
        expect(parseResultNumeric('0:05:30')).toBe(330);
      });
    });

    describe('numeric formats', () => {
      it('should parse integer numbers', () => {
        expect(parseResultNumeric('150')).toBe(150);
        expect(parseResultNumeric('42')).toBe(42);
        expect(parseResultNumeric('1')).toBe(1);
      });

      it('should parse decimal numbers', () => {
        expect(parseResultNumeric('75.5')).toBe(75.5);
        expect(parseResultNumeric('100.25')).toBe(100.25);
        expect(parseResultNumeric('3.14')).toBe(3.14);
      });

      it('should extract first number from string with units', () => {
        expect(parseResultNumeric('150 reps')).toBe(150);
        expect(parseResultNumeric('75.5 kg')).toBe(75.5);
        expect(parseResultNumeric('42lbs')).toBe(42);
      });

      it('should handle numbers with whitespace', () => {
        expect(parseResultNumeric('  150  ')).toBe(150);
        expect(parseResultNumeric(' 75.5 ')).toBe(75.5);
      });
    });

    describe('non-numeric values', () => {
      it('should return null for DNF', () => {
        expect(parseResultNumeric('DNF')).toBeNull();
        expect(parseResultNumeric('dnf')).toBeNull();
      });

      it('should return null for DNS', () => {
        expect(parseResultNumeric('DNS')).toBeNull();
        expect(parseResultNumeric('dns')).toBeNull();
      });

      it('should return null for text without numbers', () => {
        expect(parseResultNumeric('Not finished')).toBeNull();
        expect(parseResultNumeric('N/A')).toBeNull();
        expect(parseResultNumeric('')).toBeNull();
      });

      it('should return null for invalid formats', () => {
        expect(parseResultNumeric('abc')).toBeNull();
        expect(parseResultNumeric('--')).toBeNull();
        expect(parseResultNumeric('???')).toBeNull();
      });
    });

    describe('edge cases', () => {
      it('should handle zero values', () => {
        expect(parseResultNumeric('0')).toBe(0);
        expect(parseResultNumeric('0:00')).toBe(0);
        expect(parseResultNumeric('0.0')).toBe(0);
      });

      it('should handle large numbers', () => {
        expect(parseResultNumeric('9999')).toBe(9999);
        expect(parseResultNumeric('999.99')).toBe(999.99);
      });

      it('should handle time format with large values', () => {
        expect(parseResultNumeric('59:59')).toBe(3599);
        expect(parseResultNumeric('99:99:99')).toBe(362439); // 99*3600 + 99*60 + 99
      });
    });
  });
});
