package main

import (
	"fmt"
	"os"

	"example.com/ordering/gen"
	"example.com/ordering/types"
)

func main() {
	if !gen.CanEnter(types.User{Age: 18, Score: 9.6, Name: "Zoe"}) {
		fmt.Println("expected adult with score and name to pass")
		os.Exit(1)
	}
	if gen.CanEnter(types.User{Age: 17, Score: 9.6, Name: "Zoe"}) {
		fmt.Println("expected minor to fail")
		os.Exit(1)
	}
	if gen.CanEnter(types.User{Age: 20, Score: 9.4, Name: "Zoe"}) {
		fmt.Println("expected low score to fail")
		os.Exit(1)
	}
	if gen.CanEnter(types.User{Age: 20, Score: 9.9, Name: "Ana"}) {
		fmt.Println("expected early name to fail")
		os.Exit(1)
	}
	fmt.Println("ok")
}
