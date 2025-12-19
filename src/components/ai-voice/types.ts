import { VoiceCall } from "@prisma/client";

export interface CallWithDetails extends VoiceCall {
  // Extend if we have relations later, but for now VoiceCall is enough
}

export type CallStatus = 'queued' | 'ringing' | 'in-progress' | 'ended' | 'hung' | 'failed';

