package main

import (
	"fmt"
	"os"

	audit "example.com/custom-options/gen"
	"example.com/custom-options/types"
)

func main() {
	if !audit.VDLPolicies.CanAccess.Check(types.User{Role: "admin"}) {
		fmt.Println("expected admin to pass")
		os.Exit(1)
	}
	if len(audit.VDLPolicies.Names()) != 1 {
		fmt.Println("expected one policy")
		os.Exit(1)
	}
	fmt.Println("ok")
}
