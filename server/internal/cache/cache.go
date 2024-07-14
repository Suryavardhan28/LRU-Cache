package cache

import (
	"container/list"
	"server/internal/logger"
	"sync"
	"time"
)

type CacheItem struct {
	Key    string
	Value  interface{}
	Expiry time.Time
}

type EvictionCallback func(key string, value interface{})

type LRUCache struct {
	capacity int
	cache    map[string]*list.Element
	order    *list.List
	mu       sync.Mutex
	onEvict  EvictionCallback
}

// NewLRUCache creates a new LRUCache with the given capacity.
func NewLRUCache(capacity int, onEvict EvictionCallback) *LRUCache {
	logger.Log.Printf("Creating LRU cache with capacity: %d", capacity)
	return &LRUCache{
		capacity: capacity,
		cache:    make(map[string]*list.Element),
		order:    list.New(),
		onEvict:  onEvict,
	}
}

// Set adds a new item to the cache with the specified key, value, and duration.
// If the key already exists, it updates the value and expiry time.
func (c *LRUCache) Set(key string, value interface{}, duration time.Duration) {
	c.mu.Lock()
	defer c.mu.Unlock()

	if el, found := c.cache[key]; found {
		logger.Log.Printf("Updating key: %s", key)
		c.order.MoveToFront(el)
		el.Value.(*CacheItem).Value = value
		el.Value.(*CacheItem).Expiry = time.Now().Add(duration)
		return
	}

	if c.order.Len() >= c.capacity {
		logger.Log.Println("Cache is full, evicting least recently used item")
		c.evict()
	}

	logger.Log.Printf("Adding key: %s", key)
	item := &CacheItem{Key: key, Value: value, Expiry: time.Now().Add(duration)}
	el := c.order.PushFront(item)
	c.cache[key] = el
}

// Get retrieves an item from the cache by its key.
// It returns the value and a boolean indicating whether the key was found.
func (c *LRUCache) Get(key string) (interface{}, bool) {
	c.mu.Lock()
	defer c.mu.Unlock()

	if el, found := c.cache[key]; found {
		if time.Now().After(el.Value.(*CacheItem).Expiry) {
			logger.Log.Printf("Key expired: %s", key)
			c.removeElement(el)
			return nil, false
		}

		logger.Log.Printf("Key found: %s", key)
		c.order.MoveToFront(el)
		return el.Value.(*CacheItem).Value, true
	}

	logger.Log.Printf("Key not found: %s", key)
	return nil, false
}

// Delete removes an item from the cache by its key.
func (c *LRUCache) Delete(key string) bool {
	c.mu.Lock()
	defer c.mu.Unlock()

	if el, found := c.cache[key]; found {
		logger.Log.Printf("Deleting key: %s", key)
		c.removeElement(el)
	} else {
		logger.Log.Printf("Key not found for deletion: %s", key)
		return false
	}
	return true
}

// evict removes the least recently used item from the cache.
func (c *LRUCache) evict() {
	el := c.order.Back()
	if el != nil {
		item := el.Value.(*CacheItem)
		logger.Log.Printf("Evicting key: %s", item.Key)
		c.removeElement(el)
		if c.onEvict != nil {
			c.onEvict(item.Key, item.Value)
		}
	}
}

// removeElement removes the specified element from the cache and order list.
func (c *LRUCache) removeElement(el *list.Element) {
	logger.Log.Printf("Removing element with key: %s", el.Value.(*CacheItem).Key)
	c.order.Remove(el)
	delete(c.cache, el.Value.(*CacheItem).Key)
}

// Items returns a slice of all items in the cache.
func (c *LRUCache) GetItems() []CacheItem {
	c.mu.Lock()
	defer c.mu.Unlock()

	items := make([]CacheItem, 0, c.order.Len())
	for el := c.order.Front(); el != nil; el = el.Next() {
		items = append(items, *el.Value.(*CacheItem))
	}
	return items
}
