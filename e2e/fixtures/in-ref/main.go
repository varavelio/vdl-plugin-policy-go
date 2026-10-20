package main

import (
	"fmt"
	"os"

	"example.com/in-ref/gen"
	"example.com/in-ref/types"
)

func main() {
	inv := types.Invoice{AllowedIds: []string{"u1", "u2"}}
	if !gen.VDLPolicies.CanReadShared.Check(types.User{Id: "u1"}, inv) {
		fmt.Println("expected member to pass")
		os.Exit(1)
	}
	if gen.VDLPolicies.CanReadShared.Check(types.User{Id: "u9"}, inv) {
		fmt.Println("expected non-member to fail")
		os.Exit(1)
	}
	if gen.VDLPolicies.CanReadShared.Check(types.User{Id: "u1"}, types.Invoice{}) {
		fmt.Println("expected empty list to fail")
		os.Exit(1)
	}
	fmt.Println("ok")
}
