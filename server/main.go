package main

import (
	"context"
	"net/http"
	"os"
	"os/signal"
	"server/internal/logger"
	"server/internal/routes"
	"syscall"
	"time"

	"github.com/gorilla/handlers"
	"github.com/joho/godotenv"
)

func main() {
	err := godotenv.Load()
	if err != nil {
		logger.Log.Println("No .env file found")
	}

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	// Handle graceful shutdown
	go func() {
		sigChan := make(chan os.Signal, 1)
		signal.Notify(sigChan, os.Interrupt, syscall.SIGTERM)
		<-sigChan
		logger.Log.Println("Shutting down server...")
		cancel()
	}()

	router := routes.NewRouter(ctx)

	// Add CORS headers
	corsMiddleware := handlers.CORS(
		handlers.AllowedOrigins([]string{os.Getenv("ALLOWED_ORIGIN")}),
		handlers.AllowedMethods([]string{"GET", "POST", "DELETE"}),
		handlers.AllowedHeaders([]string{"Content-Type"}),
	)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	server := &http.Server{
		Addr:    ":" + port,
		Handler: corsMiddleware(router),
	}

	go func() {
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			logger.Log.Fatalf("Could not listen on %s: %v\n", port, err)
		}
	}()

	<-ctx.Done()

	// Graceful shutdown
	ctxShutDown, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := server.Shutdown(ctxShutDown); err != nil {
		logger.Log.Fatalf("Server forced to shutdown: %v", err)
	}

	logger.Log.Println("Server exiting")
}
