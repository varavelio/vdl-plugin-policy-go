package main

import (
	"fmt"
	"os"

	"example.com/logic-not-parens/gen"
	"example.com/logic-not-parens/types"
)

func main() {
	if !gen.VDLPolicies.CanView.Check(types.User{Role: "viewer"}) {
		fmt.Println("expected user without department to pass")
		os.Exit(1)
	}
	if !gen.VDLPolicies.CanView.Check(types.User{Role: "admin", Department: types.Ptr("Sales")}) {
		fmt.Println("expected admin to pass")
		os.Exit(1)
	}
	if gen.VDLPolicies.CanView.Check(types.User{Role: "viewer", Department: types.Ptr("Sales")}) {
		fmt.Println("expected viewer with department to fail")
		os.Exit(1)
	}
	fmt.Println("ok")
}
