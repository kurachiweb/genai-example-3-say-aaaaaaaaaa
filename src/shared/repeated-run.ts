export const MIN_RUN_LENGTH = 10;

const QUALIFYING_CHAR_PATTERN =
	/^(?:\p{Script=Latin}|\p{Script=Han}|\p{Script=Hiragana}|\p{Script=Katakana}|\p{Script=Hangul})$/u;

export interface RepeatedRun {
	/** `Array.from(text)` 基準（コードポイント単位）の開始インデックス */
	start: number;
	/** 終了インデックス（exclusive） */
	end: number;
	char: string;
}

/**
 * アルファベット・漢字・ひらがな・カタカナ・ハングルのいずれかで、
 * 同じ文字が minLength 文字以上連続している箇所をすべて検出する。
 */
export function findRepeatedRuns(
	text: string,
	minLength: number = MIN_RUN_LENGTH,
): RepeatedRun[] {
	const chars = Array.from(text);
	const runs: RepeatedRun[] = [];

	let i = 0;
	while (i < chars.length) {
		let j = i + 1;
		while (j < chars.length && chars[j] === chars[i]) {
			j++;
		}

		const length = j - i;
		if (length >= minLength && QUALIFYING_CHAR_PATTERN.test(chars[i])) {
			runs.push({ start: i, end: j, char: chars[i] });
		}

		i = j;
	}

	return runs;
}

export function hasRepeatedRun(
	text: string,
	minLength: number = MIN_RUN_LENGTH,
): boolean {
	return findRepeatedRuns(text, minLength).length > 0;
}
