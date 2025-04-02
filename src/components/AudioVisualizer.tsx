
import { useRef, useEffect } from "react";

interface AudioVisualizerProps {
  audioUrl: string;
  className?: string;
}

export function AudioVisualizer({ audioUrl, className = "" }: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const animationRef = useRef<number>();
  const audioContextRef = useRef<AudioContext>();
  const analyserRef = useRef<AnalyserNode>();
  const dataArrayRef = useRef<Uint8Array>();

  useEffect(() => {
    const audio = audioRef.current;
    const canvas = canvasRef.current;
    
    if (!audio || !canvas) return;
    
    // Set up audio context and analyser
    const AudioContext = window.AudioContext;
    if (!AudioContext) return;
    
    audioContextRef.current = new AudioContext();
    analyserRef.current = audioContextRef.current.createAnalyser();
    
    // Connect audio element to analyser
    const source = audioContextRef.current.createMediaElementSource(audio);
    source.connect(analyserRef.current);
    analyserRef.current.connect(audioContextRef.current.destination);
    
    // Configure analyser
    analyserRef.current.fftSize = 256;
    const bufferLength = analyserRef.current.frequencyBinCount;
    dataArrayRef.current = new Uint8Array(bufferLength);
    
    // Setup canvas
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Animation function
    const draw = () => {
      if (!analyserRef.current || !ctx || !dataArrayRef.current) return;
      
      animationRef.current = requestAnimationFrame(draw);
      
      analyserRef.current.getByteFrequencyData(dataArrayRef.current);
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const barWidth = (canvas.width / dataArrayRef.current.length) * 2.5;
      let barHeight;
      let x = 0;
      
      for (let i = 0; i < dataArrayRef.current.length; i++) {
        barHeight = dataArrayRef.current[i] / 2;
        
        // Create gradient
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, '#8a2be2'); // BlueViolet
        gradient.addColorStop(1, '#33c3f0'); // Sky Blue
        
        ctx.fillStyle = gradient;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        
        x += barWidth + 1;
      }
    };
    
    // Start visualization when playing
    const handlePlay = () => {
      if (audioContextRef.current?.state === 'suspended') {
        audioContextRef.current.resume();
      }
      draw();
    };
    
    // Stop visualization when paused
    const handlePause = () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
    
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handlePause);
    
    // Resize canvas to fill parent
    const resizeCanvas = () => {
      if (canvas.parentElement) {
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = 100; // Fixed height
      }
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    return () => {
      // Cleanup
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handlePause);
      window.removeEventListener('resize', resizeCanvas);
      
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [audioUrl]);
  
  return (
    <div className={`relative ${className}`}>
      <audio ref={audioRef} src={audioUrl} controls className="w-full mt-2" />
      <canvas 
        ref={canvasRef} 
        className="w-full h-[100px] mt-2 rounded-md bg-background/50"
      />
    </div>
  );
}
