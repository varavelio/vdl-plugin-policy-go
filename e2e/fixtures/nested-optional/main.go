package main

import (
	"fmt"
	"os"

	"example.com/nested-optional/gen"
	"example.com/nested-optional/types"
)

func main() {
	finance := types.User{Profile: &types.Profile{Department: types.Ptr("Finance")}}
	if !gen.CanAccessFinance(finance) {
		fmt.Println("expected nested finance to pass")
		os.Exit(1)
	}
	if gen.CanAccessFinance(types.User{}) {
		fmt.Println("expected nil profile to fail")
		os.Exit(1)
	}
	if gen.CanAccessFinance(types.User{Profile: &types.Profile{}}) {
		fmt.Println("expected nil department to fail")
		os.Exit(1)
	}
	if gen.CanAccessFinance(types.User{Profile: &types.Profile{Department: types.Ptr("Sales")}}) {
		fmt.Println("expected wrong department to fail")
		os.Exit(1)
	}
	fmt.Println("ok")
}
