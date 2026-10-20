package main

import (
	"fmt"
	"os"

	"example.com/in-empty/gen"
	"example.com/in-empty/types"
)

func main() {
	if gen.CanNever(types.User{Role: "admin"}) {
		fmt.Println("expected empty in to always fail")
		os.Exit(1)
	}
	fmt.Println("ok")
}
