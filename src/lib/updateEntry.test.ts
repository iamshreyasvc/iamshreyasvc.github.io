import { describe, expect, it, vi } from 'vitest';
import { buildUpdateFileContent, slugify, toBase64Utf8 } from './updateEntry';

describe('slugify', () => {
	it('lowercases and replaces non-alphanumeric runs with hyphens', () => {
		expect(slugify('May 2024')).toBe('may-2024');
		expect(slugify('AI & Health')).toBe('ai-health');
	});

	it('trims edges and strips leading/trailing hyphens', () => {
		expect(slugify('  hello-world  ')).toBe('hello-world');
		expect(slugify('---x---')).toBe('x');
	});

	it('uses fallback timestamp when input is empty', () => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date('2026-01-15T12:00:00Z'));
		expect(slugify('')).toBe('update-1768478400000');
		vi.useRealTimers();
	});
});

describe('buildUpdateFileContent', () => {
	it('JSON-encodes date for safe YAML strings', () => {
		const md = buildUpdateFileContent('May 2024', 1, 'Hello **world**.');
		expect(md).toBe(`---\ndate: "May 2024"\norder: 1\n---\n\nHello **world**.\n`);
	});

	it('trims body and preserves markdown', () => {
		const md = buildUpdateFileContent('2024', 2, '\n\nLine one.\n');
		expect(md.endsWith('Line one.\n')).toBe(true);
		expect(md).toContain('order: 2');
	});
});

describe('toBase64Utf8', () => {
	it('round-trips ASCII', () => {
		const s = 'hello';
		expect(atob(toBase64Utf8(s))).toBe(s);
	});

	it('handles non-Latin1 unicode', () => {
		const s = '你好 café';
		const decoded = new TextDecoder().decode(
			Uint8Array.from(atob(toBase64Utf8(s)), (c) => c.charCodeAt(0)),
		);
		expect(decoded).toBe(s);
	});
});
