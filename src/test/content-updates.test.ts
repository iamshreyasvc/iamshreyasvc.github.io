import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const here = path.dirname(fileURLToPath(import.meta.url));
const updatesDir = path.join(here, '..', 'content', 'updates');

function parseFrontmatterBlock(raw: string): { frontmatter: string; body: string } | null {
	if (!raw.startsWith('---\n')) return null;
	const end = raw.indexOf('\n---\n', 4);
	if (end === -1) return null;
	return {
		frontmatter: raw.slice(4, end),
		body: raw.slice(end + 5),
	};
}

describe('content collection: updates', () => {
	it('directory exists and has markdown entries', () => {
		expect(fs.existsSync(updatesDir)).toBe(true);
		const files = fs.readdirSync(updatesDir).filter((f) => f.endsWith('.md'));
		expect(files.length).toBeGreaterThan(0);
	});

	it('each update has date and numeric order in frontmatter', () => {
		const files = fs.readdirSync(updatesDir).filter((f) => f.endsWith('.md'));
		for (const file of files) {
			const raw = fs.readFileSync(path.join(updatesDir, file), 'utf8');
			const parsed = parseFrontmatterBlock(raw);
			expect(parsed, `${file}: expected YAML frontmatter`).not.toBeNull();

			const dateLine = parsed!.frontmatter.split('\n').find((l) => l.startsWith('date:'));
			const orderLine = parsed!.frontmatter.split('\n').find((l) => l.startsWith('order:'));
			expect(dateLine, `${file}: missing date`).toBeTruthy();
			expect(orderLine, `${file}: missing order`).toBeTruthy();

			const orderVal = orderLine!.replace(/^order:\s*/, '').trim();
			expect(Number.isFinite(Number(orderVal)), `${file}: order must be a number`).toBe(true);
		}
	});

	it('filenames are safe slugs (no spaces)', () => {
		const files = fs.readdirSync(updatesDir).filter((f) => f.endsWith('.md'));
		for (const file of files) {
			const base = file.replace(/\.md$/, '');
			expect(base).toMatch(/^[a-z0-9-]+$/);
		}
	});
});
