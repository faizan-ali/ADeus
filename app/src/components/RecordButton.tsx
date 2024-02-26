import { Loader, Mic } from "lucide-react";
import { Button } from "./ui/button";
import { useEffect, useState } from "react";
import { useRecordVoice } from "@/utils/useRecordVoice";
import { useWakeWord } from "@/utils/useWakeWord";

export const RecordButton = ({
  onInput,
  className,
}: {
  onInput: (text: string) => void;
  className?: string;
}) => {
  const { startRecording, stopRecording, text, isRecording, isTranscribing } =
    useRecordVoice();

  const { start, stop, release, keywordDetection, isListening } = useWakeWord();

  useEffect(() => {
    onInput(text);
  }, [text, onInput]);

  useEffect(() => {
    const handleKeywordDetection = async () => {
      if (keywordDetection) {
        await stop();
        startRecording();
      }
    };
    handleKeywordDetection();
  }, [keywordDetection]);

  // Start the wake word detection after 1 second
  useEffect(() => {
    const timer = setTimeout(() => {
      start();
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isRecording && !isTranscribing) {
      start();
    }
  }, [isRecording, isTranscribing]);

  return (
    <>
      <Button
        size={isRecording || isTranscribing ? "default" : "icon"}
        onClick={isRecording ? stopRecording : startRecording}
        disabled={isTranscribing}
        className={`stroke-1  transition-all duration-1000 ease-in-out ${
          className ? className : ""
        }`}
      >
        {isRecording || isTranscribing ? (
          <div className="flex items-center gap-2">
            <Loader className="animate-spin h-4 w-4" />
            <p>{isTranscribing ? "Transcribing..." : "Recording..."}</p>
          </div>
        ) : (
          <Mic size={25} className="stroke-1" />
        )}
      </Button>
    </>
  );
};
