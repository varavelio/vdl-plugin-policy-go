package main

import (
	"fmt"
	"os"

	"example.com/principal-only/gen"
	"example.com/principal-only/types"
)

func main() {
	if !gen.VDLPolicies.CanAccessPanel.Check(types.User{Role: "admin"}) {
		fmt.Println("expected admin to pass")
		os.Exit(1)
	}
	if gen.VDLPolicies.CanAccessPanel.Check(types.User{Role: "user"}) {
		fmt.Println("expected user to fail")
		os.Exit(1)
	}
	if names := gen.VDLPolicyNames; len(names) != 1 || names[0] != "CanAccessPanel" {
		fmt.Println("expected Names to list CanAccessPanel")
		os.Exit(1)
	}
	if !gen.VDLPolicies.CanAccessPanel.Check(types.User{Role: "admin"}) {
		fmt.Println("expected catalog check to pass")
		os.Exit(1)
	}
	fmt.Println("ok")
}
