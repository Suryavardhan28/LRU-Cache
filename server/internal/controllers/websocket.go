package controllers

import (
	"context"
	"net/http"
	"os"

	"server/internal/logger"

	"github.com/gorilla/websocket"
	"github.com/joho/godotenv"
)

var (
	clients   = make(map[*websocket.Conn]bool)
	upgrader  websocket.Upgrader
	broadcast = make(chan map[string]interface{})
)

func init() {
	err := godotenv.Load()
	if err != nil {
		logger.Log.Println("No .env file found")
	}
	allowedOrigin := os.Getenv("ALLOWED_ORIGIN")

	upgrader = websocket.Upgrader{
		CheckOrigin: func(r *http.Request) bool {
			origin := r.Header.Get("Origin")
			return origin == allowedOrigin
		},
	}
}

func HandleConnections(w http.ResponseWriter, r *http.Request) {
	ws, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		logger.Log.Printf("Could not open websocket connection: %v", err)
		return
	}
	defer ws.Close()

	clients[ws] = true
	logger.Log.Printf("Client connected: %v", ws.RemoteAddr())

	for {
		var msg map[string]interface{}
		err := ws.ReadJSON(&msg)
		if err != nil {
			logger.Log.Printf("Error reading JSON: %v", err)
			delete(clients, ws)
			logger.Log.Printf("Client disconnected: %v", ws.RemoteAddr())
			break
		}
		logger.Log.Printf("Received message: %v", msg)
		broadcast <- msg
	}
}

func HandleMessages(ctx context.Context) {
	for {
		select {
		case msg := <-broadcast:
			logger.Log.Printf("Broadcasting message: %v", msg)
			for client := range clients {
				err := client.WriteJSON(msg)
				if err != nil {
					logger.Log.Printf("Error writing JSON to client: %v", err)
					client.Close()
					delete(clients, client)
					logger.Log.Printf("Client disconnected: %v", client.RemoteAddr())
				}
			}
		case <-ctx.Done():
			logger.Log.Println("Shutting down message handler")
			return
		}
	}
}
