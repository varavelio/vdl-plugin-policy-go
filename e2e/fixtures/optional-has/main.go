package main

import (
	"fmt"
	"os"

	"example.com/optional-has/gen"
	"example.com/optional-has/types"
)

func main() {
	if !gen.CanAccessFinance(types.User{Age: 20, Department: types.Ptr("Finance")}) {
		fmt.Println("expected finance adult to pass")
		os.Exit(1)
	}
	if gen.CanAccessFinance(types.User{Age: 20}) {
		fmt.Println("expected missing department to fail")
		os.Exit(1)
	}
	if gen.CanAccessFinance(types.User{Age: 20, Department: types.Ptr("Sales")}) {
		fmt.Println("expected wrong department to fail")
		os.Exit(1)
	}
	if gen.CanAccessFinance(types.User{Age: 10, Department: types.Ptr("Finance")}) {
		fmt.Println("expected minor to fail")
		os.Exit(1)
	}
	fmt.Println("ok")
}
