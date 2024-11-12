import { invoke } from "@tauri-apps/api/tauri";

export const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
};

export const buildBlob = async (filePath:string, audioType: string) => {

  const audioData: string = await invoke("read_audio_buffer", { filePath });
  // Decode the base64 string to binary
  const byteCharacters = atob(audioData);
  const byteNumbers = new Array(byteCharacters.length);
      
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  const getMimeType = (format: string): string => {
    switch (format.toLowerCase()) {
      case "mp3":
        return "audio/mp3";
      case "opus":
        return "audio/opus";
      case "ogg":
        return "audio/ogg";
      case "flac":
        return "audio/flac";
      case "m4a":
        return "audio/m4a";
      case "m4b":
        return "audio/m4b";
      default:
        throw new Error("Unsupported audio format");
    }
  }
  const mimeType = getMimeType(audioType);        
  const audioBlob = new Blob([byteArray], { type: mimeType });
  return audioBlob;
}