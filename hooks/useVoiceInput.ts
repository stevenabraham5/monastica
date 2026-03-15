import { useState, useCallback, useRef, useEffect } from 'react';
import { Platform } from 'react-native';

interface UseVoiceInputReturn {
  isListening: boolean;
  isAvailable: boolean;
  transcript: string;
  start: () => void;
  stop: () => void;
  toggle: () => void;
}

export function useVoiceInput(
  onResult?: (text: string) => void,
): UseVoiceInputReturn {
  const [isListening, setIsListening] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (Platform.OS === 'web') {
      const SpeechRecognition =
        (globalThis as any).SpeechRecognition ||
        (globalThis as any).webkitSpeechRecognition;
      setIsAvailable(!!SpeechRecognition);
    } else {
      // On native, check expo-speech-recognition availability
      try {
        const ExpoSpeechRecognition = require('expo-speech-recognition');
        setIsAvailable(true);
      } catch {
        setIsAvailable(false);
      }
    }
  }, []);

  const start = useCallback(() => {
    if (Platform.OS === 'web') {
      const SpeechRecognition =
        (globalThis as any).SpeechRecognition ||
        (globalThis as any).webkitSpeechRecognition;
      if (!SpeechRecognition) return;

      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let final = '';
        let interim = '';
        for (let i = 0; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            final += result[0].transcript;
          } else {
            interim += result[0].transcript;
          }
        }
        const text = final || interim;
        setTranscript(text);
        if (final) {
          onResult?.(final);
        }
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
      setIsListening(true);
    } else {
      // Native: use expo-speech-recognition
      startNative();
    }
  }, [onResult]);

  const startNative = useCallback(async () => {
    try {
      const ExpoSpeechRecognition = require('expo-speech-recognition');
      const { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } =
        ExpoSpeechRecognition;

      const result = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      if (!result.granted) return;

      ExpoSpeechRecognitionModule.start({
        lang: 'en-US',
        interimResults: true,
      });
      setIsListening(true);
    } catch {
      setIsAvailable(false);
    }
  }, []);

  const stop = useCallback(() => {
    if (Platform.OS === 'web') {
      recognitionRef.current?.stop();
    } else {
      try {
        const { ExpoSpeechRecognitionModule } = require('expo-speech-recognition');
        ExpoSpeechRecognitionModule.stop();
      } catch {}
    }
    setIsListening(false);
  }, []);

  const toggle = useCallback(() => {
    if (isListening) {
      stop();
    } else {
      start();
    }
  }, [isListening, start, stop]);

  return { isListening, isAvailable, transcript, start, stop, toggle };
}
