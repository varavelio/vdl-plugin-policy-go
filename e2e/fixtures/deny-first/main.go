package main

import (
	"fmt"
	"os"

	"example.com/deny-first/gen"
	"example.com/deny-first/types"
)

func main() {
	if !gen.VDLPolicies.CanLogin.Check(types.User{}) {
		fmt.Println("expected enabled user to pass")
		os.Exit(1)
	}
	if gen.VDLPolicies.CanLogin.Check(types.User{Disabled: true}) {
		fmt.Println("expected disabled user to fail")
		os.Exit(1)
	}
	fmt.Println("ok")
}
