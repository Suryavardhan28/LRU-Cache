package routes

import (
	"context"
	"net/http"
	"server/internal/controllers"
	"server/internal/logger"

	"github.com/gorilla/mux"
)

func NewRouter(ctx context.Context) *mux.Router {
	router := mux.NewRouter()

	router.Use(loggingMiddleware)

	router.HandleFunc("/api/cache/{key}", controllers.GetItem(ctx)).Methods("GET")
	router.HandleFunc("/api/cache/{key}", controllers.SetItem(ctx)).Methods("POST")
	router.HandleFunc("/api/cache/{key}", controllers.DeleteItem(ctx)).Methods("DELETE")
	router.HandleFunc("/api/cache", controllers.GetCacheDetails(ctx)).Methods("GET")
	router.HandleFunc("/ws", controllers.HandleConnections)

	go func() {
		logger.Log.Println("Starting message handler")
		controllers.HandleMessages(ctx)
	}()

	logger.Log.Println("Router initialized and routes set up")
	return router
}

func loggingMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		logger.Log.Printf("Request: %s %s", r.Method, r.RequestURI)
		next.ServeHTTP(w, r)
	})
}
