let canvasApiToken: string | null = null;

export function setCanvasApiToken(token: string) {
  canvasApiToken = token;
}

export function getCanvasApiToken(): string | null {
  return canvasApiToken;
}