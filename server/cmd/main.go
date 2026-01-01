package main

import (
	"github.com/MobasirSarkar/hookfilter/internal/server"
	"github.com/joho/godotenv"
)

func main() {
	if err := godotenv.Load(); err != nil {
		panic(err)
	}

	server := server.New()

	if err := server.Run(); err != nil {
		panic(err)
	}
}
