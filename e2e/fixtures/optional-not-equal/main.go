package main

import (
	"fmt"
	"os"

	"example.com/optional-not-equal/gen"
	"example.com/optional-not-equal/types"
)

func main() {
	if !gen.CanSkipFinance(types.User{}) {
		fmt.Println("expected missing to be not-equal")
		os.Exit(1)
	}
	if !gen.CanSkipFinance(types.User{Department: types.Ptr("Sales")}) {
		fmt.Println("expected sales to pass")
		os.Exit(1)
	}
	if gen.CanSkipFinance(types.User{Department: types.Ptr("Finance")}) {
		fmt.Println("expected finance to fail")
		os.Exit(1)
	}
	fmt.Println("ok")
}
