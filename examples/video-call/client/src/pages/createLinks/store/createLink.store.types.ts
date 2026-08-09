import type { CallLinkModel, CreateCallLinkInput } from '../../../modules/call-link/call-link.model.ts';

export interface CreateLinkState {
  loading: boolean;
  error: string | null;
}

export interface UseCreateLinkResult extends CreateLinkState {
  createLink: (input: CreateCallLinkInput) => Promise<CallLinkModel | null>;
}
