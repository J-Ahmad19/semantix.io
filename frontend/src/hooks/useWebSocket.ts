import { useEffect, useRef, useState, useCallback } from 'react';
import { GameEvent } from '../types/game';

interface UseWebSocketOptions {
  url: string;
  onMessage?: (event: GameEvent) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
}

export function useWebSocket({ url, onMessage, onConnect, onDisconnect }: UseWebSocketOptions) {
  const [isConnected, setIsConnected] = useState(false);
  const ws = useRef<WebSocket | null>(null);

  const onMessageRef = useRef(onMessage);
  const onConnectRef = useRef(onConnect);
  const onDisconnectRef = useRef(onDisconnect);

  useEffect(() => {
    onMessageRef.current = onMessage;
    onConnectRef.current = onConnect;
    onDisconnectRef.current = onDisconnect;
  }, [onMessage, onConnect, onDisconnect]);

  const connect = useCallback(() => {
    if (!url) return;
    if (ws.current?.readyState === WebSocket.OPEN) return;

    ws.current = new WebSocket(url);

    ws.current.onopen = () => {
      setIsConnected(true);
      onConnectRef.current?.();
    };

    ws.current.onclose = () => {
      setIsConnected(false);
      onDisconnectRef.current?.();
      // Basic auto-reconnect
      setTimeout(connect, 3000);
    };

    ws.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as GameEvent;
        onMessageRef.current?.(data);
      } catch (error) {
        console.error('Failed to parse WebSocket message', error);
      }
    };
  }, [url]);

  useEffect(() => {
    connect();
    return () => {
      ws.current?.close();
    };
  }, [connect]);

  const sendMessage = useCallback((type: string, payload: any) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ type, ...payload }));
    }
  }, []);

  return { isConnected, sendMessage };
}
