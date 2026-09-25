export type CaseType = 'historical_reference' | 'vigil_detection';
export type Evidence = { sourceId: string; locator: string; relation: 'supports' | 'contradicts' };
export type Source = { id: string; publisher: string; url: string; retrievedAt: string; publishedAt?: string; independenceGroup?: string };
export type Claim = { id: string; text: string; status: 'reported' | 'corroborated' | 'contested'; confidence: 'low' | 'medium' | 'high'; evidence: Evidence[] };
export type Hypothesis = { id: string; statement: string; claimIds: string[]; falsifiers: string[]; alternativeTo?: string[] };
export type Exposure = { id: string; claimId: string; targetType: 'company' | 'commodity' | 'route' | 'market' | 'sector'; target: string; channel: string; conditionalImpact: string; watchFor: string[] };
export interface IntelligenceCase {
  schemaVersion: '1.0.0';
  id: string;
  title: string;
  caseType: CaseType;
  status: 'open' | 'updated' | 'closed';
  event: { kind: string; occurredAt: string; location: string; summary: string };
  sources: Source[];
  claims: Claim[];
  challenge: { hypotheses: Hypothesis[]; unresolvedQuestions: string[] };
  exposures: Exposure[];
  assessment: { asOf: string; whatHappened: string; whyItMatters: string; whatToWatch: string[] };
  provenance: { maintainer: string; updatedAt: string; detectionReceipt?: { runId: string; recordedAt: string; url: string } };
}
export type ValidationError = { path: string; message: string };
export type ValidationResult = { valid: boolean; errors: ValidationError[] };
export function validateCase(input: unknown): ValidationResult;
export function assertCase(input: unknown): IntelligenceCase;
export function renderCase(input: unknown): string;
export function compareCases(before: unknown, after: unknown): {
  caseId: string; from: string; to: string;
  sources: { added: string[]; removed: string[]; changed: string[] };
  claims: { added: string[]; removed: string[]; changed: string[] };
  hypotheses: { added: string[]; removed: string[]; changed: string[] };
  exposures: { added: string[]; removed: string[]; changed: string[] };
  eventChanged: boolean; challengeQuestionsChanged: boolean;
  assessmentChanged: boolean; detectionReceiptChanged: boolean; statusChanged: boolean;
};
