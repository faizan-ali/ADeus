"use client";
import { useEffect, useState } from "react";
import { usePorcupine } from "@picovoice/porcupine-react";

export function useWakeWord() {
  const {
    keywordDetection,
    isLoaded,
    isListening,
    error,
    init,
    start,
    stop,
    release,
  } = usePorcupine();

  const porcupineKeyword = { publicPath: "hey-bob.ppn", label: "hey-bob" };
  const porcupineModel = { publicPath: "porcupine-params.pv" };

  if (!process.env.PICOVOICE_KEY) {
    throw new Error('Missing Picovoice key')
  }

  useEffect(() => {
    init(
      process.env.PICOVOICE_KEY!,
      porcupineKeyword,
      porcupineModel
    );
    console.log("PORCUPINE INITIALIZED");
  }, []);

  useEffect(() => {
    console.log("IS LOADED", isLoaded);
  }, [isLoaded]);

  useEffect(() => {
    console.log("IS LISTENING", isListening);
  }, [isListening]);

  useEffect(() => {
    if (keywordDetection !== null) {
      console.log("KEY WORD DETECTED", keywordDetection);
    }
  }, [keywordDetection]);

  return { start, stop, release, keywordDetection, isListening };
}
