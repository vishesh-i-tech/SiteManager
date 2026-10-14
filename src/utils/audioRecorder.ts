export class AudioNoteRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  public isRecording = false;

  async startRecording(): Promise<boolean> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.audioChunks = [];
      this.mediaRecorder = new MediaRecorder(stream);

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.start();
      this.isRecording = true;
      return true;
    } catch (err) {
      console.warn('Microphone access denied or unsupported:', err);
      return false;
    }
  }

  async stopRecording(): Promise<string | null> {
    return new Promise((resolve) => {
      if (!this.mediaRecorder || !this.isRecording) {
        resolve(null);
        return;
      }

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const base64Audio = reader.result as string;
          resolve(base64Audio);
        };
        // Stop all audio tracks to release microphone indicator
        this.mediaRecorder?.stream.getTracks().forEach((track) => track.stop());
        this.isRecording = false;
      };

      this.mediaRecorder.stop();
    });
  }
}
