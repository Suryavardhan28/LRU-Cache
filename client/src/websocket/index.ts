import { deleteItem, setItem } from "../redux/slices/cacheSlice";
import store from "../redux/store";

let socket: WebSocket | null = null;

export const connectWebSocket = (): void => {
    socket = new WebSocket("ws://localhost:8080/ws");

    socket.onopen = (): void => {
        console.log("WebSocket connection established");
    };

    socket.onmessage = (event: MessageEvent): void => {
        console.log("WebSocket message received:", event.data);
        const message = JSON.parse(event.data);
        if (message.action === "set") {
            store.dispatch(
                setItem({
                    key: message.key,
                    value: message.value,
                    expiry: message.expiry,
                })
            );
        } else if (message.action === "delete") {
            store.dispatch(deleteItem({ key: message.key }));
        }
    };

    socket.onclose = (): void => {
        console.log("WebSocket connection closed");
        // Optionally, you can try to reconnect
        setTimeout(() => connectWebSocket(), 1000);
    };

    socket.onerror = (error: Event): void => {
        console.error("WebSocket error:", error);
    };
};

export const sendWebSocketMessage = (message: object): void => {
    console.log("Sending WebSocket message:", message);
    if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify(message));
    } else {
        console.error("WebSocket is not open. Message not sent:", message);
    }
};
