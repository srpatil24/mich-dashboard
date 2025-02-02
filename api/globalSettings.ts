let canvasApiToken: string | null = null;
let usingCanvas: boolean = true;

export function toggleMode(){
  usingCanvas = !usingCanvas;
}

export function usingCanvasMode(){
  return usingCanvas;
}

export function setCanvasApiToken(token: string) {
  canvasApiToken = token;
}

export function getCanvasApiToken(): string | null {
  return canvasApiToken;
}