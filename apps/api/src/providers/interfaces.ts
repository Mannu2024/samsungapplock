export interface TranslationProvider {
  translate(text: string, source: string, target: string): Promise<string>;
}

export interface TtsProvider {
  synthesize(params: { text: string; language: string; voice: string; speed: number }): Promise<{ audioUrl: string; timings: Array<{ text: string; startMs: number; endMs: number }> }>;
}

export interface AvatarProvider {
  renderTalkingHead(params: { audioUrl: string; avatarId: string; script: string }): Promise<{ videoUrl: string }>;
}
