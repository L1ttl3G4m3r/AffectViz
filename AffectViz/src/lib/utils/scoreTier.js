export function scoreTier(score) {
	if (score < 40) return 'low';
	if (score < 70) return 'medium';
	return 'high';
}
