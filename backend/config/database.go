package config

import (
	"context"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/joho/godotenv"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"go.mongodb.org/mongo-driver/mongo/readpref"
)

var (
	// Client adalah instance client MongoDB
	Client *mongo.Client
	// DB adalah database utama yang aktif
	DB *mongo.Database
	// isConnected menandakan status koneksi database
	isConnected bool
)

// InitConfig memuat file .env ke environment variable
func InitConfig() {
	if err := godotenv.Load(); err != nil {
		// Jika file .env tidak ditemukan, gunakan environment variable bawaan sistem
	}
}

// ConnectMongoDB menginisialisasi koneksi ke server MongoDB
func ConnectMongoDB() (*mongo.Database, error) {
	InitConfig()

	uri := os.Getenv("MONGODB_URI")
	if uri == "" {
		uri = "mongodb://localhost:27017"
	}

	dbName := os.Getenv("MONGODB_NAME")
	if dbName == "" {
		dbName = "freeapi"
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	clientOpts := options.Client().ApplyURI(uri)
	client, err := mongo.Connect(ctx, clientOpts)
	if err != nil {
		log.Printf("⚠️  MongoDB Connect Error: %v (Server tetap berjalan tanpa database)\n", err)
		return nil, err
	}

	// Ping database untuk memastikan koneksi hidup
	if err := client.Ping(ctx, readpref.Primary()); err != nil {
		log.Printf("⚠️  MongoDB Ping gagal: %v (Pastikan service MongoDB aktif di %s)\n", err, uri)
		return nil, err
	}

	Client = client
	DB = client.Database(dbName)
	isConnected = true

	fmt.Printf("🍃 MongoDB berhasil terhubung ke database: '%s' (%s)\n\n", dbName, uri)
	return DB, nil
}

// GetDB mengembalikan pointer database MongoDB yang aktif
func GetDB() *mongo.Database {
	return DB
}

// IsConnected memeriksa apakah database MongoDB aktif dan siap menerima query
func IsConnected() bool {
	return isConnected && DB != nil
}

// CloseMongoDB menutup koneksi MongoDB dengan anggun (graceful shutdown)
func CloseMongoDB() {
	if Client != nil {
		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()
		if err := Client.Disconnect(ctx); err != nil {
			log.Printf("Error saat menutup MongoDB: %v\n", err)
		} else {
			fmt.Println("MongoDB connection closed.")
		}
	}
}
