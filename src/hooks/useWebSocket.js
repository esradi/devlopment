import { useState, useEffect, useRef, useCallback } from 'react';
import { WS_URL } from '../config';

/**
 * Custom hook for WebSocket connections with JWT authentication
 * @param {string} endpoint - The WebSocket endpoint (e.g., '/notifications/')
 * @returns {Object} - { message, sendMessage, isConnected }
 */
export const useWebSocket = (endpoint) => {
    const [message, setMessage] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const socketRef = useRef(null);
    const reconnectTimeoutRef = useRef(null);

    const connect = useCallback(() => {
        const token = localStorage.getItem('access_token');
        if (!token) return;

        // Clean up previous socket if exists
        if (socketRef.current) {
            socketRef.current.close();
        }

        const wsUrl = `${WS_URL}/ws${endpoint}?token=${token}`;

        const socket = new WebSocket(wsUrl);

        socket.onopen = () => {
            console.log(`WebSocket Connected: ${endpoint}`);
            setIsConnected(true);
        };

        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            setMessage(data);
        };

        socket.onclose = (event) => {
            console.log(`WebSocket Disconnected: ${endpoint}`, event.reason);
            setIsConnected(false);
            
            // Reconnect logic
            if (event.code !== 1000) { // If not closed normally
                reconnectTimeoutRef.current = setTimeout(() => {
                    connect();
                }, 3000);
            }
        };

        socket.onerror = (error) => {
            console.error(`WebSocket Error: ${endpoint}`, error);
            socket.close();
        };

        socketRef.current = socket;
    }, [endpoint]);

    useEffect(() => {
        connect();
        return () => {
            if (socketRef.current) {
                socketRef.current.close(1000);
            }
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }
        };
    }, [connect]);

    const sendMessage = useCallback((data) => {
        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
            socketRef.current.send(JSON.stringify(data));
        } else {
            console.warn('Cannot send message: WebSocket is not open');
        }
    }, []);

    return { message, sendMessage, isConnected };
};
