package controllers

import (
	"context"
	"encoding/json"
	"net/http"
	"os"
	lruCache "server/internal/cache"
	"server/internal/logger"
	"strconv"
	"time"

	"github.com/gorilla/mux"
	"github.com/joho/godotenv"
)

var (
	cache          *lruCache.LRUCache
	deleteRoutines = make(map[string]context.CancelFunc)
)

func init() {
	err := godotenv.Load()
	if err != nil {
		logger.Log.Println("No .env file found")
	}

	cacheSize, err := strconv.Atoi(os.Getenv("LRU_CACHE_SIZE"))
	if err != nil || cacheSize < 1 {
		logger.Log.Fatalf("Invalid LRU_CACHE_SIZE: %v", err)
	}
	cache = lruCache.NewLRUCache(cacheSize, onEvict)
}

func GetCacheDetails(ctx context.Context) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		logger.Log.Printf("GetCacheDetails called")
		items := cache.GetItems()
		response := make(map[string]interface{})
		for _, item := range items {
			expiryTime := item.Expiry.Format("02/01/06 15:04:05")
			response[item.Key] = map[string]interface{}{
				"value":  item.Value,
				"expiry": expiryTime,
			}
		}

		json.NewEncoder(w).Encode(map[string]interface{}{"items": response})
	}
}

func GetItem(ctx context.Context) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		key := mux.Vars(r)["key"]
		logger.Log.Printf("GetItem called with key: %s", key)
		if value, found := cache.Get(key); found {
			logger.Log.Printf("Key found: %s", key)
			json.NewEncoder(w).Encode(map[string]interface{}{"value": value})
		} else {
			logger.Log.Printf("Key not found: %s", key)
			http.NotFound(w, r)
		}
	}
}

func SetItem(ctx context.Context) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		key := mux.Vars(r)["key"]
		logger.Log.Printf("SetItem called with key: %s", key)
		var request map[string]interface{}
		if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
			logger.Log.Printf("Invalid request payload for key: %s", key)
			http.Error(w, "Invalid request payload", http.StatusBadRequest)
			return
		}
		value := request["value"]
		duration := time.Duration(request["expiry"].(float64)) * time.Second

		// Cancel the old delete routine if it exists
		if cancelFunc, found := deleteRoutines[key]; found {
			logger.Log.Printf("Cancelling existing delete routine for existing key: %s", key)
			cancelFunc()
		}

		cache.Set(key, value, duration)
		expiryTime := time.Now().Add(duration).Format("02/01/06 15:04:05")
		broadcast <- map[string]interface{}{"action": "set", "key": key, "value": value, "expiry": expiryTime}
		logger.Log.Printf("Set key: %s with expiry: %s", key, expiryTime)

		// Create a new context with cancel function for the delete routine
		ctx, cancel := context.WithCancel(ctx)
		deleteRoutines[key] = cancel

		// Start a goroutine to delete the item after the expiry duration
		go func() {
			select {
			case <-time.After(duration):
				cache.Delete(key)
				broadcast <- map[string]interface{}{"action": "delete", "key": key}
				logger.Log.Printf("Deleted key: %s after expiry", key)
			case <-ctx.Done():
				// The delete routine was canceled
				delete(deleteRoutines, key)
				logger.Log.Printf("Delete routine entry removed for key: %s", key)
			}
		}()

		w.WriteHeader(http.StatusCreated)
	}
}

func DeleteItem(ctx context.Context) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		key := mux.Vars(r)["key"]
		logger.Log.Printf("DeleteItem called with key: %s", key)

		found := cache.Delete(key)
		if !found {
			logger.Log.Printf("Key not found: %s", key)
			http.NotFound(w, r)
			return
		}
		if cancelFunc, found := deleteRoutines[key]; found {
			logger.Log.Printf("Cancelling delete routine for deleted key: %s", key)
			cancelFunc()
		}
		broadcast <- map[string]interface{}{"action": "delete", "key": key}
		logger.Log.Printf("Deleted key: %s", key)

		w.WriteHeader(http.StatusNoContent)
	}
}

func onEvict(key string, value interface{}) {
	logger.Log.Printf("Evicting key: %s", key)
	if cancelFunc, found := deleteRoutines[key]; found {
		logger.Log.Printf("Cancelling delete routine for deleted key: %s", key)
		cancelFunc()
	}
	broadcast <- map[string]interface{}{"action": "delete", "key": key, "value": value}
}
