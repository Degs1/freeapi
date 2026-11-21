package api

import (
	"encoding/json"
	"net/http"
)


// StatusHandler mengembalikan status server
func StatusHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	resp := Response{
		Status:  "success",
		Message: "Server berjalan normal",
		Data: map[string]string{
			"uptime": "online",
		},
	}

	json.NewEncoder(w).Encode(resp)
}